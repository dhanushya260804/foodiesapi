package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.PartnerReviewRequest;
import com.fooddelivery.foodiesapi.io.PartnerReviewResponse;

import java.util.List;

public interface PartnerReviewService {
    PartnerReviewResponse addReview(PartnerReviewRequest request);
    List<PartnerReviewResponse> getReviewsByPartner(String partnerId);
}
