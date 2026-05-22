package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryPartnerLoginRequest {
    private String email;
    private String password;
}
