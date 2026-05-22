package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private String id;
    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;
    private double amount;
    private String paymentStatus;
    private String paymentMethod;
    private String razorpayOrderId;
    private String orderStatus;
    private List<OrderItem> orderedItems;
    private LocalDateTime createdAt;
    private String deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private double deliveryPartnerRating;
    private double deliveryEarnings;
    private LocalDateTime deliveredAt;

    private String codOtp;
    private int otpAttempts;
    private boolean otpVerified;
    private double codCharge;

    private double walletAmountUsed;
    private boolean walletUsed;
}
