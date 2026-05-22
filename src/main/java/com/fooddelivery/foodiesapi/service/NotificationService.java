package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.OrderResponse;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // Notify a specific customer when their order is picked up
    // Customer subscribes to /topic/orders/{userId}
    public void notifyCustomer(String userId, OrderResponse order) {
        messagingTemplate.convertAndSend("/topic/orders/" + userId, order);
    }
}