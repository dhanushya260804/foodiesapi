package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.MessageRequest;
import com.fooddelivery.foodiesapi.io.MessageResponse;
import com.fooddelivery.foodiesapi.service.MessageService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@AllArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(@RequestBody MessageRequest request) {
        return messageService.sendMessage(request);
    }

    @GetMapping
    public List<MessageResponse> getAllMessages() {
        return messageService.getAllMessages();
    }

    @PostMapping("/{messageId}/reply")
    public MessageResponse replyToMessage(@PathVariable String messageId, @RequestBody Map<String, String> body) {
        return messageService.replyToMessage(messageId, body.get("reply"));
    }

    @GetMapping("/my")
    public List<MessageResponse> getMyMessages(@RequestParam String email) {
        return messageService.getMessagesByEmail(email);
    }
}