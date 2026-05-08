package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.OrderEntity;
import com.fooddelivery.foodiesapi.entity.ReviewEntity;
import com.fooddelivery.foodiesapi.io.OrderItem;
import com.fooddelivery.foodiesapi.io.ReviewRequest;
import com.fooddelivery.foodiesapi.io.ReviewResponse;
import com.fooddelivery.foodiesapi.repository.OrderRepository;
import com.fooddelivery.foodiesapi.repository.ReviewRepository;
import com.fooddelivery.foodiesapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuthenticationFacade authenticationFacade;
    private final UserService userService;

    @Override
    public ReviewResponse addReview(ReviewRequest request) {
        String userId = userService.findByUserId();
        String email = authenticationFacade.getAuthentication().getName();

        if (!hasUserOrderedFood(request.getFoodId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review food you have ordered.");
        }

        if (hasUserAlreadyReviwed(request.getFoodId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already reviewed this food.");
        }

        Optional<com.fooddelivery.foodiesapi.entity.UserEntity> userOptional = userRepository.findByEmail(email);
        String userName = "Anonymous";
        if (userOptional.isPresent()) {
            userName = userOptional.get().getName();
        }

        ReviewEntity review = ReviewEntity.builder()
                .foodId(request.getFoodId())
                .userId(userId)
                .userName(userName)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);
        return convertToResponse(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByFood(String foodId) {
        List<ReviewEntity> reviews = reviewRepository.findByFoodId(foodId);
        List<ReviewResponse> responses = new ArrayList<ReviewResponse>();
        for (ReviewEntity review : reviews) {
            responses.add(convertToResponse(review));
        }
        return responses;
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        List<ReviewEntity> reviews = reviewRepository.findAll();
        List<ReviewResponse> responses = new ArrayList<ReviewResponse>();
        for (ReviewEntity review : reviews) {
            responses.add(convertToResponse(review));
        }
        return responses;
    }

    @Override
    public boolean hasUserOrderedFood(String foodId) {
        String userId = userService.findByUserId();
        List<OrderEntity> orders = orderRepository.findByUserId(userId);
        for (OrderEntity order : orders) {
            for (OrderItem item : order.getOrderedItems()) {
                if (item.getFoodId() != null && item.getFoodId().equals(foodId)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public boolean hasUserAlreadyReviwed(String foodId) {
        String userId = userService.findByUserId();
        return reviewRepository.existsByFoodIdAndUserId(foodId, userId);
    }

    private ReviewResponse convertToResponse(ReviewEntity review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .foodId(review.getFoodId())
                .userId(review.getUserId())
                .userName(review.getUserName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}