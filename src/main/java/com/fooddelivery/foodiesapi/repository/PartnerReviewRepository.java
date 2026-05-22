package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.PartnerReviewEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PartnerReviewRepository extends MongoRepository<PartnerReviewEntity, String> {
    List<PartnerReviewEntity> findByPartnerId(String partnerId);
    boolean existsByOrderIdAndUserId(String orderId, String userId);
}
