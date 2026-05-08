package com.fooddelivery.foodiesapi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "messages")
public class MessageEntity {
    @Id
    private String id;
    private String name;
    private String email;
    private String message;
    private String status; // "unread", "read", "replied"
    private LocalDateTime createdAt;
    private List<ReplyEntity> replies = new ArrayList<>();
}
