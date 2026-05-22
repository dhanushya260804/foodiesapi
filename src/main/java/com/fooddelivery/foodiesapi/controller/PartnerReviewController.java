package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.PartnerReviewRequest;
import com.fooddelivery.foodiesapi.io.PartnerReviewResponse;
import com.fooddelivery.foodiesapi.service.PartnerReviewService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partner-reviews")
@AllArgsConstructor
public class PartnerReviewController {

    private final PartnerReviewService partnerReviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PartnerReviewResponse addReview(@RequestBody PartnerReviewRequest request) {
        return partnerReviewService.addReview(request);
    }

    @GetMapping("/{partnerId}")
    public List<PartnerReviewResponse> getReviewsByPartner(@PathVariable String partnerId) {
        return partnerReviewService.getReviewsByPartner(partnerId);
    }
}