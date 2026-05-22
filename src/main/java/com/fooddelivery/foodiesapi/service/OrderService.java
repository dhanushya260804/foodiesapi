package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.OrderRequest;
import com.fooddelivery.foodiesapi.io.OrderResponse;
import com.razorpay.RazorpayException;

import java.util.List;
import java.util.Map;

public interface OrderService {
    OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException;
    void verifyPayment(Map<String, String> paymentData, String status);
    List<OrderResponse> getUserOrders();
    void removeOrder(String orderId);
    List<OrderResponse> getOrdersOfAllUsers();
    void updateOrderStatus(String orderId, String status);
    void assignDeliveryPartner(String orderId, String partnerId);
    List<OrderResponse> getAvailableOrdersForPickup();
    OrderResponse pickupOrder(String orderId, String partnerEmail);
    OrderResponse markDelivered(String orderId, String partnerEmail);
    List<OrderResponse> getPartnerDeliveries(String partnerEmail);
    OrderResponse verifyCodOtp(String orderId, String otp, String partnerEmail);

    void cancelOrder(String orderId);
}