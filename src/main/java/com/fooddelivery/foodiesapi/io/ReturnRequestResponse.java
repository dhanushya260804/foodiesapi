package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReturnRequestResponse {
    private String id;
    private String orderId;
    private String userId;
    private String reason;
    private String photoUrl;
    private String status;
    private String adminReason;
    private String refundMethod;
    private double refundAmount;
    private boolean reorderRequested;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
