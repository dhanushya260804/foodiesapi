package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.UserRequest;
import com.fooddelivery.foodiesapi.io.UserResponse;

public interface UserService {

    UserResponse registerUser(UserRequest request);

    String findByUserId();
}
