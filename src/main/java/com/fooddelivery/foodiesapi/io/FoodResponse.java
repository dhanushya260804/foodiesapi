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
public class FoodResponse {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private double price;
    private String category;
    private boolean veg;
    private int quantityPerSet;
    private String unit;
    private boolean addOnsEnabled;
    private List<AddOn> addOns;
    private List<String> preferences;
    private List<FoodVariant> variants;
    private boolean variantRequired;
}