package com.fooddelivery.foodiesapi.entity;

import com.fooddelivery.foodiesapi.io.AddOn;
import com.fooddelivery.foodiesapi.io.FoodVariant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "foods")
public class FoodEntity {
    @Id
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