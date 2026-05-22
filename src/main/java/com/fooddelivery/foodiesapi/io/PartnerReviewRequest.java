package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartnerReviewRequest {
    private String partnerId;
    private String orderId;
    private int rating;
    private String comment;
}
