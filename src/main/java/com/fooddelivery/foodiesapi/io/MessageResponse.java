package com.fooddelivery.foodiesapi.io;

import com.fooddelivery.foodiesapi.entity.ReplyEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String id;
    private String name;
    private String email;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private List<ReplyEntity> replies;
}