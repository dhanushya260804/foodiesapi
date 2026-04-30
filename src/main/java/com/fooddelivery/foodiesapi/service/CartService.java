package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.CartRequest;
import com.fooddelivery.foodiesapi.io.CartResponse;

public interface CartService {

    CartResponse addToCart(CartRequest request);

    CartResponse getCart();

    void clearCart();

    CartResponse removeFromCart(CartRequest cartRequest);
}
