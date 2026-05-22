package com.fooddelivery.foodiesapi.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodRequest {
    private String name;
    private String description;
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