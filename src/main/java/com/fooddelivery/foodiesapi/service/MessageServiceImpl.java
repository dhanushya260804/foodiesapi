package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.MessageEntity;
import com.fooddelivery.foodiesapi.entity.ReplyEntity;
import com.fooddelivery.foodiesapi.io.MessageRequest;
import com.fooddelivery.foodiesapi.io.MessageResponse;
import com.fooddelivery.foodiesapi.repository.MessageRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    @Override
    public MessageResponse sendMessage(MessageRequest request) {
        MessageEntity message = MessageEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .message(request.getMessage())
                .status("unread")
                .createdAt(LocalDateTime.now())
                .build();
        message = messageRepository.save(message);
        return convertToResponse(message);
    }

    @Override
    public List<MessageResponse> getAllMessages() {
        List<MessageEntity> entities = messageRepository.findAll();
        List<MessageResponse> responses = new ArrayList<MessageResponse>();
        for (MessageEntity entity : entities) {
            responses.add(convertToResponse(entity));
        }
        return responses;
    }

    @Override
    public MessageResponse replyToMessage(String messageId, String reply) {
        Optional<MessageEntity> messageOptional = messageRepository.findById(messageId);
        if (!messageOptional.isPresent()) {
            throw new RuntimeException("Message not found");
        }
        MessageEntity message = messageOptional.get();

        ReplyEntity replyEntity = ReplyEntity.builder()
                .message(reply)
                .repliedAt(LocalDateTime.now())
                .build();

        message.getReplies().add(replyEntity);
        message.setStatus("replied");
        message = messageRepository.save(message);
        return convertToResponse(message);
    }

    @Override
    public List<MessageResponse> getMessagesByEmail(String email) {
        List<MessageEntity> entities = messageRepository.findByEmail(email);
        List<MessageResponse> responses = new ArrayList<MessageResponse>();
        for (MessageEntity entity : entities) {
            responses.add(convertToResponse(entity));
        }
        return responses;
    }

    private MessageResponse convertToResponse(MessageEntity message) {
        return MessageResponse.builder()
                .id(message.getId())
                .name(message.getName())
                .email(message.getEmail())
                .message(message.getMessage())
                .status(message.getStatus())
                .createdAt(message.getCreatedAt())
                .replies(message.getReplies())
                .build();
    }
}