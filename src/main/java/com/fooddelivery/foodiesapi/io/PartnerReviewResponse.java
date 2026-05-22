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
public class PartnerReviewResponse {
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
