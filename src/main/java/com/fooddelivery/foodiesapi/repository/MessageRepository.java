package com.fooddelivery.foodiesapi.repository;

import com.fooddelivery.foodiesapi.entity.MessageEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<MessageEntity, String> {
    List<MessageEntity> findByEmail(String email);
}