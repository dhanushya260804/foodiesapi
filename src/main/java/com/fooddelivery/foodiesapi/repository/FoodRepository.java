package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.FoodEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity, String> {
    List<FoodEntity> findByCategory(String category);
}