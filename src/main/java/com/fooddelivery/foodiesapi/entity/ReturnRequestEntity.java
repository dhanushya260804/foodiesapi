package com.fooddelivery.foodiesapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "return_requests")
public class ReturnRequestEntity {
    @Id
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
