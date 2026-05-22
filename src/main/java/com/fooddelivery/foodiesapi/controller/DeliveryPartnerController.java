package com.fooddelivery.foodiesapi.controller;

import com.fooddelivery.foodiesapi.io.DeliveryPartnerLoginRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerResponse;
import com.fooddelivery.foodiesapi.service.DeliveryPartnerService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-partners")
@AllArgsConstructor
public class DeliveryPartnerController {

    private final DeliveryPartnerService deliveryPartnerService;

    // ─── Public endpoints (no auth) ───────────────────────────────────────────

    @PostMapping(value = "/apply", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryPartnerResponse applyAsPartner(
            @RequestPart("name")          String name,
            @RequestPart("email")         String email,
            @RequestPart("password")      String password,
            @RequestPart("phoneNumber")   String phoneNumber,
            @RequestPart("vehicleNumber") String vehicleNumber,
            @RequestPart("licenseNumber") String licenseNumber,
            @RequestPart("photo")         MultipartFile photo,
            @RequestPart("idProof")       MultipartFile idProof,
            @RequestPart("license")       MultipartFile license
    ) {
        DeliveryPartnerRequest request = new DeliveryPartnerRequest(
                name, email, password, phoneNumber, vehicleNumber, licenseNumber
        );
        return deliveryPartnerService.applyAsPartner(request, photo, idProof, license);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody DeliveryPartnerLoginRequest request) {
        String token = deliveryPartnerService.login(request);
        return Map.of("token", token);
    }

    // ─── Partner checks own status (partner JWT) ──────────────────────────────

    @GetMapping("/my-status")
    public DeliveryPartnerResponse getMyStatus(@RequestParam String email) {
        return deliveryPartnerService.getMyStatus(email);
    }

    // ─── Admin endpoints ──────────────────────────────────────────────────────

    @GetMapping
    public List<DeliveryPartnerResponse> getAllPartners() {
        return deliveryPartnerService.getAllPartners();
    }

    @GetMapping("/available")
    public List<DeliveryPartnerResponse> getAvailablePartners() {
        return deliveryPartnerService.getAvailablePartners();
    }

    @GetMapping("/status/{status}")
    public List<DeliveryPartnerResponse> getPartnersByStatus(@PathVariable String status) {
        return deliveryPartnerService.getPartnersByStatus(status);
    }

    @PatchMapping("/approve/{id}")
    public DeliveryPartnerResponse approvePartner(@PathVariable String id) {
        return deliveryPartnerService.approvePartner(id);
    }

    @PatchMapping("/reject/{id}")
    public DeliveryPartnerResponse rejectPartner(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        return deliveryPartnerService.rejectPartner(id, body.get("reason"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePartner(@PathVariable String id) {
        deliveryPartnerService.deletePartner(id);
    }
}