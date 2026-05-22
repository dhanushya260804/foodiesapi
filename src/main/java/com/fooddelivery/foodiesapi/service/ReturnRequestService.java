package com.fooddelivery.foodiesapi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fooddelivery.foodiesapi.entity.OrderEntity;
import com.fooddelivery.foodiesapi.entity.ReturnRequestEntity;
import com.fooddelivery.foodiesapi.entity.UserEntity;
import com.fooddelivery.foodiesapi.io.OrderItem;
import com.fooddelivery.foodiesapi.io.OrderRequest;
import com.fooddelivery.foodiesapi.io.ReturnRequestResponse;
import com.fooddelivery.foodiesapi.repository.OrderRepository;
import com.fooddelivery.foodiesapi.repository.ReturnRequestRepository;
import com.fooddelivery.foodiesapi.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;
import lombok.AllArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final OrderService orderService;
    private final Cloudinary cloudinary;

    @Value("${razorpay_key}")    private String RAZORPAY_KEY;
    @Value("${razorpay_secret}") private String RAZORPAY_SECRET;

    private static final int RETURN_WINDOW_MINUTES = 15;
    private static final List<String> VALID_REASONS =
            List.of("Wrong order", "Spoiled food", "Missing items");

    public ReturnRequestService(ReturnRequestRepository r, OrderRepository o,
                                UserRepository u, UserService us,
                                OrderService os, Cloudinary c) {
        this.returnRequestRepository = r;
        this.orderRepository = o;
        this.userRepository = u;
        this.userService = us;
        this.orderService = os;
        this.cloudinary = c;
    }

    public ReturnRequestResponse raiseReturnRequest(String orderId, String reason,
                                                    MultipartFile photo,
                                                    boolean reorderRequested) {
        String userId = userService.findByUserId();

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");

        if (!"Delivered".equalsIgnoreCase(order.getOrderStatus()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must be delivered first");

        if (order.getDeliveredAt() == null ||
                ChronoUnit.MINUTES.between(order.getDeliveredAt(), LocalDateTime.now()) > RETURN_WINDOW_MINUTES)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Return window of 15 minutes has expired");

        if (returnRequestRepository.existsByOrderId(orderId))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A return request already exists for this order");

        if (!VALID_REASONS.contains(reason))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid return reason");

        String photoUrl = uploadPhoto(photo);

        String refundMethod = "cod".equalsIgnoreCase(order.getPaymentMethod()) ? "WALLET" : "RAZORPAY";

        ReturnRequestEntity entity = ReturnRequestEntity.builder()
                .orderId(orderId)
                .userId(userId)
                .reason(reason)
                .photoUrl(photoUrl)
                .status("PENDING")
                .refundMethod(refundMethod)
                .refundAmount(order.getAmount())
                .reorderRequested(reorderRequested)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return convertToResponse(returnRequestRepository.save(entity));
    }

    public ReturnRequestResponse approveReturn(String returnId, String adminReason) {
        ReturnRequestEntity request = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found"));

        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        request.setStatus("APPROVED");
        request.setAdminReason(adminReason);
        request.setUpdatedAt(LocalDateTime.now());

        if ("RAZORPAY".equals(request.getRefundMethod())) {
            processRazorpayRefund(order, request.getRefundAmount());
        } else {
            processWalletRefund(order.getUserId(), request.getRefundAmount());
        }

        if (request.isReorderRequested()) {
            createReorder(order);
        }

        order.setOrderStatus("Returned");
        orderRepository.save(order);

        return convertToResponse(returnRequestRepository.save(request));
    }

    public ReturnRequestResponse rejectReturn(String returnId, String adminReason) {
        ReturnRequestEntity request = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found"));

        request.setStatus("REJECTED");
        request.setAdminReason(adminReason);
        request.setUpdatedAt(LocalDateTime.now());
        return convertToResponse(returnRequestRepository.save(request));
    }

    public List<ReturnRequestResponse> getAllRequests() {
        List<ReturnRequestResponse> responses = new ArrayList<>();
        for (ReturnRequestEntity r : returnRequestRepository.findAll())
            responses.add(convertToResponse(r));
        return responses;
    }

    public List<ReturnRequestResponse> getRequestsByStatus(String status) {
        List<ReturnRequestResponse> responses = new ArrayList<>();
        for (ReturnRequestEntity r : returnRequestRepository.findByStatus(status))
            responses.add(convertToResponse(r));
        return responses;
    }

    public ReturnRequestResponse getMyReturnRequest(String orderId) {
        ReturnRequestEntity r = returnRequestRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No return request found"));
        return convertToResponse(r);
    }

    private void processRazorpayRefund(OrderEntity order, double amount) {
        try {
            RazorpayClient client = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", (int)(amount * 100));
            refundRequest.put("speed", "normal");
            Refund refund = client.payments.refund(order.getRazorpayPaymentId(), refundRequest);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Razorpay refund failed: " + e.getMessage());
        }
    }

    private void processWalletRefund(String userId, double amount) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);
    }

    private void createReorder(OrderEntity original) {
        try {
            OrderRequest reorder = OrderRequest.builder()
                    .userAddress(original.getUserAddress())
                    .phoneNumber(original.getPhoneNumber())
                    .email(original.getEmail())
                    .orderedItems(original.getOrderedItems())
                    .amount(calculateFoodOnlyAmount(original))
                    .orderStatus("Food Processing")
                    .paymentMethod("reorder")
                    .build();
            orderService.createOrderWithPayment(reorder);
        } catch (Exception e) {
            // Log but don't fail the return
            System.err.println("Reorder creation failed: " + e.getMessage());
        }
    }

    private double calculateFoodOnlyAmount(OrderEntity order) {
        // Only food price, no shipping/tax/COD charge
        return order.getOrderedItems().stream()
                .mapToDouble(OrderItem::getPrice)
                .sum();
    }

    private String uploadPhoto(MultipartFile file) {
        try {
            Map result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "returns"));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Photo upload failed");
        }
    }

    private ReturnRequestResponse convertToResponse(ReturnRequestEntity r) {
        return ReturnRequestResponse.builder()
                .id(r.getId())
                .orderId(r.getOrderId())
                .userId(r.getUserId())
                .reason(r.getReason())
                .photoUrl(r.getPhotoUrl())
                .status(r.getStatus())
                .adminReason(r.getAdminReason())
                .refundMethod(r.getRefundMethod())
                .refundAmount(r.getRefundAmount())
                .reorderRequested(r.isReorderRequested())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}