package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryPartnerResponse {
    private String id;
    private String name;
    private String phoneNumber;
    private double rating;
    private boolean available;
}
