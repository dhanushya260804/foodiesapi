package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.MessageRequest;
import com.fooddelivery.foodiesapi.io.MessageResponse;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(MessageRequest request);
    List<MessageResponse> getAllMessages();
    MessageResponse replyToMessage(String messageId, String reply);
    List<MessageResponse> getMessagesByEmail(String email);
}