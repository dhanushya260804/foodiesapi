package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.ReturnRequestEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends MongoRepository<ReturnRequestEntity, String> {
    List<ReturnRequestEntity> findByUserId(String userId);
    List<ReturnRequestEntity> findByStatus(String status);
    Optional<ReturnRequestEntity> findByOrderId(String orderId);
    boolean existsByOrderId(String orderId);
}
