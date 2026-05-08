package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.ReviewRequest;
import com.fooddelivery.foodiesapi.io.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest request);
    List<ReviewResponse> getReviewsByFood(String foodId);
    List<ReviewResponse> getAllReviews();
    boolean hasUserOrderedFood(String foodId);
    boolean hasUserAlreadyReviwed(String foodId);
}
