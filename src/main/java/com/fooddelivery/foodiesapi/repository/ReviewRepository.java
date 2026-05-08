package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.ReviewEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<ReviewEntity, String> {
    List<ReviewEntity> findByFoodId(String foodId);
    List<ReviewEntity> findByUserId(String userId);
    boolean existsByFoodIdAndUserId(String foodId, String userId);
}
