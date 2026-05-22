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
public class DeliveryPartnerResponse {
    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private String vehicleNumber;
    private String licenseNumber;
    private String photoUrl;
    private String idProofUrl;
    private String licenseUrl;
    private double rating;
    private boolean available;
    private String status;
    private String rejectionReason;
    private int applicationCount;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
