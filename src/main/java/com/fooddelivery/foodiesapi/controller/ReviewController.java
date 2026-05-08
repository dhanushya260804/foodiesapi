package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.ReviewRequest;
import com.fooddelivery.foodiesapi.io.ReviewResponse;
import com.fooddelivery.foodiesapi.service.ReviewService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@AllArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse addReview(@RequestBody ReviewRequest request) {
        return reviewService.addReview(request);
    }

    @GetMapping("/food/{foodId}")
    public List<ReviewResponse> getReviewsByFood(@PathVariable String foodId) {
        return reviewService.getReviewsByFood(foodId);
    }

    @GetMapping("/all")
    public List<ReviewResponse> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/check/{foodId}")
    public boolean hasUserOrderedFood(@PathVariable String foodId) {
        return reviewService.hasUserOrderedFood(foodId);
    }
}