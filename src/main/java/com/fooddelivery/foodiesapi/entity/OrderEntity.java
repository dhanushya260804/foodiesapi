package com.fooddelivery.foodiesapi.entity;

import com.fooddelivery.foodiesapi.io.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderEntity {
    @Id
    private String id;
    private String userId;
    private String userAddress;
    private String phoneNumber;
    private String email;
    private List<OrderItem> orderedItems;
    private double amount;
    private String paymentStatus;
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpaySignature;
    private String razorpayPaymentId;
    private String orderStatus;
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

    private double walletAmountUsed = 0.0;
    private boolean walletUsed = false;
}
