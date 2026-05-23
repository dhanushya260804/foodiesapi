package com.fooddelivery.foodiesapi.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fooddelivery.foodiesapi.io.FoodRequest;
import com.fooddelivery.foodiesapi.io.FoodResponse;
import com.fooddelivery.foodiesapi.service.FoodService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
@AllArgsConstructor
@CrossOrigin("*")
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public FoodResponse addFood(@RequestPart("food") String foodString,
                                @RequestPart("file") MultipartFile file) {
        System.out.println("=== FOOD CONTROLLER ===");
        System.out.println("Received foodString: " + foodString);
        System.out.println("Received file: " + (file != null ? file.getOriginalFilename() : "null"));

        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request = null;
        try {
            request = objectMapper.readValue(foodString, FoodRequest.class);
            System.out.println("Parsed request successfully: " + request);
        } catch (JsonProcessingException ex) {
            System.out.println("JSON parsing error: " + ex.getMessage());
            ex.printStackTrace();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON format: " + ex.getMessage());
        }

        try {
            FoodResponse response = foodService.addFood(request, file);
            System.out.println("Food saved successfully: " + response);
            return response;
        } catch (Exception e) {
            System.out.println("Service error: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to add food: " + e.getMessage());
        }
    }

    @GetMapping
    public List<FoodResponse> readFoods() {
        return foodService.getAllFoods();
    }

    @GetMapping("/{id}")
    public FoodResponse readFood(@PathVariable String id) {
        return foodService.readFood(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable String id) {
        foodService.deleteFood(id);
    }
}

@GetMapping("/public/test")
public String test() {
    return "Public endpoint works!";
}