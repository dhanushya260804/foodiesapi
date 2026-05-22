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
@Document(collection = "delivery_partners")
public class DeliveryPartnerEntity {
    @Id
    private String id;

    // Basic Info
    private String name;
    private String email;
    private String password;
    private String phoneNumber;

    // Vehicle & License
    private String vehicleNumber;
    private String licenseNumber;

    // Document URLs (stored in S3)
    private String photoUrl;
    private String idProofUrl;
    private String licenseUrl;

    // Performance (set after approval)
    private double rating;
    private boolean available;

    // Application lifecycle
    private String status; // PENDING, APPROVED, REJECTED
    private String rejectionReason;
    private int applicationCount; // max 3
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
