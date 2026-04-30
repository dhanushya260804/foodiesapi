package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.UserRequest;
import com.fooddelivery.foodiesapi.io.UserResponse;
import com.fooddelivery.foodiesapi.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class UserController {

    private UserService userService;


    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody UserRequest request) {
        return userService.registerUser(request);
    }
}
