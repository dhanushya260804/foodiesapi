package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.UserEntity;
import com.fooddelivery.foodiesapi.io.UserRequest;
import com.fooddelivery.foodiesapi.io.UserResponse;
import com.fooddelivery.foodiesapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationFacade authenticationFacade;

    @Override
    public UserResponse registerUser(UserRequest request) {
        UserEntity newUser = convertToEntity(request);
        newUser = userRepository.save(newUser);
        return convertToResponse(newUser);
    }

    @Override
    public String findByUserId() {
        String loggedInUserEmail = authenticationFacade.getAuthentication().getName();

        Optional<UserEntity> userOptional = userRepository.findByEmail(loggedInUserEmail);
        if (!userOptional.isPresent()) {
            throw new UsernameNotFoundException("User not found");
        }

        return userOptional.get().getId();
    }

    @Override
    public UserResponse getProfile() {
        String email = authenticationFacade.getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return convertToResponse(user);
    }

    @Override
    public UserResponse updateProfile(UserRequest request) {
        String email = authenticationFacade.getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user = userRepository.save(user);
        return convertToResponse(user);
    }

    private UserEntity convertToEntity(UserRequest request) {
        return UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();
    }

    private UserResponse convertToResponse(UserEntity registeredUser) {
        return UserResponse.builder()
                .id(registeredUser.getId())
                .name(registeredUser.getName())
                .email(registeredUser.getEmail())
                .phoneNumber(registeredUser.getPhoneNumber())
                .address(registeredUser.getAddress())
                .build();
    }
}