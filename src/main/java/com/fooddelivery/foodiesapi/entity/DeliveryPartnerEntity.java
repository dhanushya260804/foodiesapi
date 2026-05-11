package com.fooddelivery.foodiesapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "delivery_partners")
public class DeliveryPartnerEntity {
    @Id
    private String id;
    private String name;
    private String phoneNumber;
    private double rating;
    private boolean available;
}
