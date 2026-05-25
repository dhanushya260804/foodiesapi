package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.DeliveryPartnerEntity;
import com.fooddelivery.foodiesapi.entity.OrderEntity;
import com.fooddelivery.foodiesapi.entity.UserEntity;
import com.fooddelivery.foodiesapi.io.OrderRequest;
import com.fooddelivery.foodiesapi.io.OrderResponse;
import com.fooddelivery.foodiesapi.repository.CartRepository;
import com.fooddelivery.foodiesapi.repository.DeliveryPartnerRepository;
import com.fooddelivery.foodiesapi.repository.OrderRepository;
import com.fooddelivery.foodiesapi.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    // Earnings model
    private static final double BASE_PAY = 30.0;
    private static final double PERCENT_PAY = 0.08;
    private static final double COD_BONUS = 15.0;
    private static final double COD_CHARGE = 10.0;
    private static final int MAX_OTP_ATTEMPTS = 3;

    private final OrderRepository orderRepository;
    private final UserService userService;
    private final CartRepository cartRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Value("${razorpay_key}")
    private String RAZORPAY_KEY;

    @Value("${razorpay_secret}")
    private String RAZORPAY_SECRET;

    // Constructor injection
    public OrderServiceImpl(OrderRepository orderRepository,
                            UserService userService,
                            CartRepository cartRepository,
                            DeliveryPartnerRepository deliveryPartnerRepository,
                            NotificationService notificationService,
                            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userService = userService;
        this.cartRepository = cartRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // ── Create Order with Wallet Support ──────────────────────────────────────────

    @Override
    public OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException {
        String userId = userService.findByUserId();

        // Get user's wallet balance
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        double walletBalance = user.getWalletBalance();

        double originalAmount = request.getAmount();
        double amountToPay = originalAmount;
        double walletUsed = 0.0;

        // Check if customer wants to use wallet
        if (request.isUseWallet() && walletBalance > 0) {
            walletUsed = Math.min(walletBalance, originalAmount);
            amountToPay = originalAmount - walletUsed;

            // Deduct from wallet immediately
            user.setWalletBalance(walletBalance - walletUsed);
            userRepository.save(user);
        }

        OrderEntity newOrder = convertToEntity(request);
        newOrder.setUserId(userId);
        newOrder.setWalletAmountUsed(walletUsed);
        newOrder.setWalletUsed(walletUsed > 0);

        boolean isCod = "cod".equalsIgnoreCase(request.getPaymentMethod());

        if (amountToPay <= 0) {
            // Fully paid by wallet - no payment needed
            newOrder.setPaymentMethod("wallet");
            newOrder.setAmount(0);
            newOrder.setPaymentStatus("Paid");
            newOrder.setOrderStatus("Pending");
            newOrder = orderRepository.save(newOrder);
            cartRepository.deleteByUserId(userId);

        } else if (isCod) {
            // COD with possible partial wallet payment
            newOrder.setPaymentMethod("cod");
            newOrder.setCodCharge(COD_CHARGE);
            newOrder.setAmount(originalAmount + COD_CHARGE);
            newOrder.setPaymentStatus("Pending");

            // Generate OTP
            String otp = String.format("%04d", new Random().nextInt(10000));
            newOrder.setCodOtp(otp);
            newOrder.setOtpAttempts(0);
            newOrder.setOtpVerified(false);
            newOrder = orderRepository.save(newOrder);

        } else {
            // Online payment for remaining amount
            newOrder.setPaymentMethod("online");
            newOrder.setAmount(amountToPay);
            newOrder.setPaymentStatus("Pending");
            newOrder = orderRepository.save(newOrder);

            RazorpayClient razorpayClient = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (long) (amountToPay * 100));
            orderRequest.put("currency", "INR");
            orderRequest.put("payment_capture", 1);
            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            newOrder.setRazorpayOrderId(razorpayOrder.get("id"));
            newOrder = orderRepository.save(newOrder);
        }

        return convertToResponse(newOrder);
    }

    // ── Verify Online Payment ─────────────────────────────────────────────────

    @Override
    public void verifyPayment(Map<String, String> paymentData, String status) {
        String razorpayOrderId = paymentData.get("razorpay_order_id");
        Optional<OrderEntity> orderOptional = orderRepository.findByRazorpayOrderId(razorpayOrderId);

        // For COD, find by id instead
        if (!orderOptional.isPresent()) {
            String orderId = paymentData.get("order_id");
            if (orderId != null) {
                orderOptional = orderRepository.findById(orderId);
            }
        }

        if (!orderOptional.isPresent()) {
            throw new RuntimeException("Order not found");
        }

        OrderEntity existingOrder = orderOptional.get();
        existingOrder.setPaymentStatus(status);
        existingOrder.setRazorpaySignature(paymentData.get("razorpay_signature"));
        existingOrder.setRazorpayPaymentId(paymentData.get("razorpay_payment_id"));
        orderRepository.save(existingOrder);

        if ("Paid".equalsIgnoreCase(status)) {
            cartRepository.deleteByUserId(existingOrder.getUserId());
        }
    }

    // ── Verify COD OTP ────────────────────────────────────────────────────────

    @Override
    public OrderResponse verifyCodOtp(String orderId, String otp, String partnerEmail) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Validate this partner owns the order
        DeliveryPartnerEntity partner = deliveryPartnerRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partner not found"));

        if (!partner.getId().equals(order.getDeliveryPartnerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this order");
        }

        // Check attempts
        if (order.getOtpAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Maximum OTP attempts reached. Contact support.");
        }

        // Verify OTP
        if (!order.getCodOtp().equals(otp)) {
            order.setOtpAttempts(order.getOtpAttempts() + 1);
            orderRepository.save(order);
            int remaining = MAX_OTP_ATTEMPTS - order.getOtpAttempts();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // OTP correct — mark as delivered and paid
        order.setOtpVerified(true);
        order.setOtpAttempts(order.getOtpAttempts() + 1);
        order.setOrderStatus("Delivered");
        order.setPaymentStatus("Paid");
        order.setDeliveredAt(LocalDateTime.now());

        // Earnings: base + % + COD bonus
        double earnings = BASE_PAY + (PERCENT_PAY * order.getAmount()) + COD_BONUS;
        earnings = Math.round(earnings * 100.0) / 100.0;
        order.setDeliveryEarnings(earnings);

        orderRepository.save(order);

        // Free up the partner
        partner.setAvailable(true);
        deliveryPartnerRepository.save(partner);

        // Clear customer cart
        cartRepository.deleteByUserId(order.getUserId());

        return convertToResponse(order);
    }

    // ── Get Orders ────────────────────────────────────────────────────────────

    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUserId = userService.findByUserId();
        List<OrderEntity> list = orderRepository.findByUserId(loggedInUserId);
        List<OrderResponse> responses = new ArrayList<>();
        for (OrderEntity entity : list) {
            responses.add(convertToResponse(entity));
        }
        return responses;
    }

    @Override
    public void removeOrder(String orderId) {
        orderRepository.deleteById(orderId);
    }

    @Override
    public List<OrderResponse> getOrdersOfAllUsers() {
        List<OrderEntity> list = orderRepository.findAll();
        List<OrderResponse> responses = new ArrayList<>();
        for (OrderEntity entity : list) {
            responses.add(convertToResponse(entity));
        }
        return responses;
    }

    @Override
    public void updateOrderStatus(String orderId, String status) {
        OrderEntity entity = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        entity.setOrderStatus(status);
        if ("Delivered".equalsIgnoreCase(status)) {
            entity.setDeliveredAt(LocalDateTime.now());  // ← ADD THIS
            if (entity.getDeliveryPartnerId() != null) {
                freeUpPartner(entity.getDeliveryPartnerId());
            }
        }
        orderRepository.save(entity);
    }

    @Override
    public void assignDeliveryPartner(String orderId, String partnerId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        DeliveryPartnerEntity partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        order.setDeliveryPartnerId(partner.getId());
        order.setDeliveryPartnerName(partner.getName());
        order.setDeliveryPartnerPhone(partner.getPhoneNumber());
        order.setDeliveryPartnerRating(partner.getRating());
        partner.setAvailable(false);
        deliveryPartnerRepository.save(partner);
        orderRepository.save(order);
    }

    @Override
    public List<OrderResponse> getAvailableOrdersForPickup() {
        return orderRepository.findAll().stream()
                .filter(o -> "Paid".equalsIgnoreCase(o.getPaymentStatus())
                        && (o.getDeliveryPartnerId() == null || o.getDeliveryPartnerId().isEmpty())
                        && !"Delivered".equalsIgnoreCase(o.getOrderStatus())
                        && !"Cancelled".equalsIgnoreCase(o.getOrderStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse pickupOrder(String orderId, String partnerEmail) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getDeliveryPartnerId() != null && !order.getDeliveryPartnerId().isEmpty()) {
            throw new RuntimeException("This order has already been picked up");
        }

        DeliveryPartnerEntity partner = deliveryPartnerRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        if (!partner.isAvailable()) {
            throw new RuntimeException("You are currently unavailable for delivery");
        }

        order.setDeliveryPartnerId(partner.getId());
        order.setDeliveryPartnerName(partner.getName());
        order.setDeliveryPartnerPhone(partner.getPhoneNumber());
        order.setDeliveryPartnerRating(partner.getRating());
        order.setOrderStatus("Out for Delivery");

        partner.setAvailable(false);
        deliveryPartnerRepository.save(partner);

        OrderEntity saved = orderRepository.save(order);
        OrderResponse response = convertToResponse(saved);
        notificationService.notifyCustomer(order.getUserId(), response);
        return response;
    }

    @Override
    public OrderResponse markDelivered(String orderId, String partnerEmail) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        DeliveryPartnerEntity partner = deliveryPartnerRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        if (!partner.getId().equals(order.getDeliveryPartnerId())) {
            throw new RuntimeException("You are not assigned to this order");
        }

        // For COD orders, OTP must be verified first
        if ("cod".equalsIgnoreCase(order.getPaymentMethod()) && !order.isOtpVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Please verify OTP before marking as delivered");
        }

        double earnings = BASE_PAY + (PERCENT_PAY * order.getAmount());
        earnings = Math.round(earnings * 100.0) / 100.0;

        order.setOrderStatus("Delivered");
        order.setDeliveryEarnings(earnings);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);

        partner.setAvailable(true);
        deliveryPartnerRepository.save(partner);

        return convertToResponse(order);
    }

    @Override
    public List<OrderResponse> getPartnerDeliveries(String partnerEmail) {
        DeliveryPartnerEntity partner = deliveryPartnerRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        return orderRepository.findAll().stream()
                .filter(o -> partner.getId().equals(o.getDeliveryPartnerId())
                        && "Delivered".equalsIgnoreCase(o.getOrderStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ── Cancel Order with Wallet Refund ───────────────────────────────────────

    @Override
    @Transactional
    public void cancelOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Only allow cancellation for pending orders
        if (!"Pending".equals(order.getOrderStatus()) && !"Food Processing".equals(order.getOrderStatus())) {
            throw new RuntimeException("Cannot cancel order in " + order.getOrderStatus() + " status");
        }

        // Refund wallet amount if used
        if (order.isWalletUsed() && order.getWalletAmountUsed() > 0) {
            UserEntity user = userRepository.findById(order.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setWalletBalance(user.getWalletBalance() + order.getWalletAmountUsed());
            userRepository.save(user);
        }

        order.setOrderStatus("Cancelled");
        orderRepository.save(order);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void freeUpPartner(String partnerId) {
        deliveryPartnerRepository.findById(partnerId).ifPresent(p -> {
            p.setAvailable(true);
            deliveryPartnerRepository.save(p);
        });
    }

    private OrderResponse convertToResponse(OrderEntity o) {
        return OrderResponse.builder()
                .id(o.getId())
                .amount(o.getAmount())
                .userAddress(o.getUserAddress())
                .userId(o.getUserId())
                .razorpayOrderId(o.getRazorpayOrderId())
                .paymentStatus(o.getPaymentStatus())
                .paymentMethod(o.getPaymentMethod())
                .orderStatus(o.getOrderStatus())
                .email(o.getEmail())
                .phoneNumber(o.getPhoneNumber())
                .orderedItems(o.getOrderedItems())
                .createdAt(o.getCreatedAt())
                .deliveryPartnerId(o.getDeliveryPartnerId())
                .deliveryPartnerName(o.getDeliveryPartnerName())
                .deliveryPartnerPhone(o.getDeliveryPartnerPhone())
                .deliveryPartnerRating(o.getDeliveryPartnerRating())
                .deliveryEarnings(o.getDeliveryEarnings())
                .deliveredAt(o.getDeliveredAt())
                .codOtp(o.getCodOtp())
                .otpAttempts(o.getOtpAttempts())
                .otpVerified(o.isOtpVerified())
                .codCharge(o.getCodCharge())
                .walletAmountUsed(o.getWalletAmountUsed())
                .walletUsed(o.isWalletUsed())
                .build();
    }

    private OrderEntity convertToEntity(OrderRequest request) {
        return OrderEntity.builder()
                .userAddress(request.getUserAddress())
                .amount(request.getAmount())
                .orderedItems(request.getOrderedItems())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .orderStatus(request.getOrderStatus())
                .paymentMethod(request.getPaymentMethod())
                .createdAt(LocalDateTime.now())
                .build();
    }
}