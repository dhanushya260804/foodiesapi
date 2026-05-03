package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.CartEntity;
import com.fooddelivery.foodiesapi.io.CartRequest;
import com.fooddelivery.foodiesapi.io.CartResponse;
import com.fooddelivery.foodiesapi.repository.CartRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final UserService userService;

    @Override
    public CartResponse addToCart(CartRequest request) {
        String loggedInUserId = userService.findByUserId();
        Optional<CartEntity> cartOptional = cartRepository.findByUserId(loggedInUserId);

        CartEntity cart;
        if (cartOptional.isPresent()) {
            cart = cartOptional.get();
        } else {
            cart = new CartEntity(loggedInUserId, new HashMap<String, Integer>());
        }

        Map<String, Integer> cartItems = cart.getItems();

        int currentQty = 0;
        if (cartItems.containsKey(request.getFoodId())) {
            currentQty = cartItems.get(request.getFoodId());
        }
        cartItems.put(request.getFoodId(), currentQty + 1);

        cart.setItems(cartItems);
        cart = cartRepository.save(cart);
        return convertToResponse(cart);
    }

    @Override
    public CartResponse getCart() {
        String loggedInUserId = userService.findByUserId();
        Optional<CartEntity> cartOptional = cartRepository.findByUserId(loggedInUserId);

        CartEntity entity;
        if (cartOptional.isPresent()) {
            entity = cartOptional.get();
        } else {
            entity = new CartEntity(null, loggedInUserId, new HashMap<String, Integer>());
        }

        return convertToResponse(entity);
    }

    @Override
    public void clearCart() {
        String loggedInUserId = userService.findByUserId();
        cartRepository.deleteByUserId(loggedInUserId);
    }

    @Override
    public CartResponse removeFromCart(CartRequest cartRequest) {
        String loggedInUserId = userService.findByUserId();
        Optional<CartEntity> cartOptional = cartRepository.findByUserId(loggedInUserId);

        if (!cartOptional.isPresent()) {
            throw new RuntimeException("Cart is not found");
        }

        CartEntity entity = cartOptional.get();
        Map<String, Integer> cartItems = entity.getItems();

        if (cartItems.containsKey(cartRequest.getFoodId())) {
            int currentQty = cartItems.get(cartRequest.getFoodId());
            if (currentQty > 0) {
                cartItems.put(cartRequest.getFoodId(), currentQty - 1);
            } else {
                cartItems.remove(cartRequest.getFoodId());
            }
            entity = cartRepository.save(entity);
        }

        return convertToResponse(entity);
    }

    private CartResponse convertToResponse(CartEntity cartEntity) {
        return CartResponse.builder()
                .id(cartEntity.getId())
                .userId(cartEntity.getUserId())
                .items(cartEntity.getItems())
                .build();
    }
}