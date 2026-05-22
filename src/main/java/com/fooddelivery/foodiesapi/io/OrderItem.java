package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItem {
    private String foodId;
    private int quantity;
    private double price;
    private String category;
    private String imageUrl;
    private String description;
    private String name;
    private List<String> selectedAddOns;
    private List<String> selectedPreferences;
    private double addOnsPrice;
}
