package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.OrderRequest;
import com.fooddelivery.foodiesapi.io.OrderResponse;
import com.fooddelivery.foodiesapi.service.OrderService;
import com.razorpay.RazorpayException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@AllArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrderWithPayment(@RequestBody OrderRequest request) throws RazorpayException {
        return orderService.createOrderWithPayment(request);
    }

    @PostMapping("/verify")
    public void verifyPayment(@RequestBody Map<String, String> paymentData) {
        orderService.verifyPayment(paymentData, "Paid");
    }

    @GetMapping
    public List<OrderResponse> getOrders() {
        return orderService.getUserOrders();
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable String orderId) {
        orderService.removeOrder(orderId);
    }

    @GetMapping("/all")
    public List<OrderResponse> getOrdersOfAllUsers() {
        return orderService.getOrdersOfAllUsers();
    }

    @PatchMapping("/status/{orderId}")
    public void updateOrderStatus(@PathVariable String orderId, @RequestParam String status) {
        orderService.updateOrderStatus(orderId, status);
    }

    @PatchMapping("/assign-partner/{orderId}")
    public void assignDeliveryPartner(@PathVariable String orderId, @RequestBody Map<String, String> body) {
        orderService.assignDeliveryPartner(orderId, body.get("partnerId"));
    }

    @GetMapping("/available")
    public List<OrderResponse> getAvailableOrders() {
        return orderService.getAvailableOrdersForPickup();
    }

    @PatchMapping("/pickup/{orderId}")
    public OrderResponse pickupOrder(@PathVariable String orderId, @RequestBody Map<String, String> body) {
        return orderService.pickupOrder(orderId, body.get("partnerEmail"));
    }

    @PatchMapping("/delivered/{orderId}")
    public OrderResponse markDelivered(@PathVariable String orderId, @RequestBody Map<String, String> body) {
        return orderService.markDelivered(orderId, body.get("partnerEmail"));
    }

    @GetMapping("/my-deliveries")
    public List<OrderResponse> getPartnerDeliveries(@RequestParam String partnerEmail) {
        return orderService.getPartnerDeliveries(partnerEmail);
    }

    // COD OTP verification
    @PostMapping("/verify-otp/{orderId}")
    public OrderResponse verifyCodOtp(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        return orderService.verifyCodOtp(orderId, body.get("otp"), body.get("partnerEmail"));
    }

    // Add to OrderController.java
    @PatchMapping("/cancel/{orderId}")
    public void cancelOrder(@PathVariable String orderId) {
        orderService.cancelOrder(orderId);
    }
}