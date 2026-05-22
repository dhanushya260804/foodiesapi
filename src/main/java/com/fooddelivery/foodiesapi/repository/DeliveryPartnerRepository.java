package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.DeliveryPartnerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DeliveryPartnerRepository extends MongoRepository<DeliveryPartnerEntity, String> {
    List<DeliveryPartnerEntity> findByAvailable(boolean available);
    List<DeliveryPartnerEntity> findByStatus(String status);
    Optional<DeliveryPartnerEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}
