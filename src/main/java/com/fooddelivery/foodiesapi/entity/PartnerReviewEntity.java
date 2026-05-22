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
@Document(collection = "partner_reviews")
public class PartnerReviewEntity {
    @Id
    private String id;
    private String partnerId;
    private String partnerName;
    private String orderId;
    private String userId;
    private String userName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
