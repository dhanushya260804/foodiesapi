package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.FoodRequest;
import com.fooddelivery.foodiesapi.io.FoodResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FoodService {
    FoodResponse addFood(FoodRequest request, MultipartFile image);
    List<FoodResponse> getAllFoods();
    List<FoodResponse> readFoods();
    FoodResponse getFoodById(String id);
    FoodResponse readFood(String id);
    FoodResponse updateFood(String id, FoodRequest request, MultipartFile image);
    void deleteFood(String id);
    List<FoodResponse> getFoodsByCategory(String category);

    // New methods from your code
    String uploadFile(MultipartFile file);
    boolean deleteFile(String imageUrl);
}