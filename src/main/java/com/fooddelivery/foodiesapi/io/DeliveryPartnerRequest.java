package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryPartnerRequest {
    private String name;
    private String phoneNumber;
    private double rating;
    private boolean available;
}
