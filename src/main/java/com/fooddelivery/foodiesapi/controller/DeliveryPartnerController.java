package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.DeliveryPartnerRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerResponse;
import com.fooddelivery.foodiesapi.service.DeliveryPartnerService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-partners")
@AllArgsConstructor
public class DeliveryPartnerController {

    private final DeliveryPartnerService deliveryPartnerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryPartnerResponse addPartner(@RequestBody DeliveryPartnerRequest request) {
        return deliveryPartnerService.addPartner(request);
    }

    @GetMapping
    public List<DeliveryPartnerResponse> getAllPartners() {
        return deliveryPartnerService.getAllPartners();
    }

    @GetMapping("/available")
    public List<DeliveryPartnerResponse> getAvailablePartners() {
        return deliveryPartnerService.getAvailablePartners();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePartner(@PathVariable String id) {
        deliveryPartnerService.deletePartner(id);
    }
}
