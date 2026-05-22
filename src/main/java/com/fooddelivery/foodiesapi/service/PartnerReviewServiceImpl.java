package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.DeliveryPartnerEntity;
import com.fooddelivery.foodiesapi.entity.OrderEntity;
import com.fooddelivery.foodiesapi.entity.PartnerReviewEntity;
import com.fooddelivery.foodiesapi.entity.UserEntity;
import com.fooddelivery.foodiesapi.io.PartnerReviewRequest;
import com.fooddelivery.foodiesapi.io.PartnerReviewResponse;
import com.fooddelivery.foodiesapi.repository.DeliveryPartnerRepository;
import com.fooddelivery.foodiesapi.repository.OrderRepository;
import com.fooddelivery.foodiesapi.repository.PartnerReviewRepository;
import com.fooddelivery.foodiesapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class PartnerReviewServiceImpl implements PartnerReviewService {

    private final PartnerReviewRepository partnerReviewRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuthenticationFacade authenticationFacade;
    private final UserService userService;

    @Override
    public PartnerReviewResponse addReview(PartnerReviewRequest request) {
        String userId = userService.findByUserId();
        String email  = authenticationFacade.getAuthentication().getName();

        // Check order exists and belongs to this user
        OrderEntity order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review your own orders");
        }

        // Check order is delivered
        if (!"Delivered".equalsIgnoreCase(order.getOrderStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only review after delivery");
        }

        // Check not already reviewed
        if (partnerReviewRepository.existsByOrderIdAndUserId(request.getOrderId(), userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already reviewed this delivery");
        }

        // Get partner
        DeliveryPartnerEntity partner = deliveryPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partner not found"));

        // Get user name
        String userName = "Anonymous";
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            userName = userOptional.get().getName();
        }

        // Save review
        PartnerReviewEntity review = PartnerReviewEntity.builder()
                .partnerId(partner.getId())
                .partnerName(partner.getName())
                .orderId(request.getOrderId())
                .userId(userId)
                .userName(userName)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        review = partnerReviewRepository.save(review);

        // Update partner's average rating
        updatePartnerRating(partner);

        return convertToResponse(review);
    }

    @Override
    public List<PartnerReviewResponse> getReviewsByPartner(String partnerId) {
        List<PartnerReviewEntity> reviews = partnerReviewRepository.findByPartnerId(partnerId);
        List<PartnerReviewResponse> responses = new ArrayList<>();
        for (PartnerReviewEntity r : reviews) {
            responses.add(convertToResponse(r));
        }
        return responses;
    }

    // Recalculate and update partner's average rating
    private void updatePartnerRating(DeliveryPartnerEntity partner) {
        List<PartnerReviewEntity> allReviews = partnerReviewRepository.findByPartnerId(partner.getId());
        if (!allReviews.isEmpty()) {
            double avg = allReviews.stream()
                    .mapToInt(PartnerReviewEntity::getRating)
                    .average()
                    .orElse(0.0);
            // Round to 1 decimal
            partner.setRating(Math.round(avg * 10.0) / 10.0);
            deliveryPartnerRepository.save(partner);
        }
    }

    private PartnerReviewResponse convertToResponse(PartnerReviewEntity r) {
        return PartnerReviewResponse.builder()
                .id(r.getId())
                .partnerId(r.getPartnerId())
                .partnerName(r.getPartnerName())
                .orderId(r.getOrderId())
                .userId(r.getUserId())
                .userName(r.getUserName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}