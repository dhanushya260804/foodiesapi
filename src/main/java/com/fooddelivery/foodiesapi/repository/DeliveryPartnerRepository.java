package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.DeliveryPartnerEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DeliveryPartnerRepository extends MongoRepository<DeliveryPartnerEntity, String> {
    List<DeliveryPartnerEntity> findByAvailable(boolean available);
}
