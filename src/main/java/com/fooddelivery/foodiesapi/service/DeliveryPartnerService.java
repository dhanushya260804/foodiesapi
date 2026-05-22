package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.DeliveryPartnerLoginRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DeliveryPartnerService {

    // Existing
    List<DeliveryPartnerResponse> getAllPartners();
    List<DeliveryPartnerResponse> getAvailablePartners();
    void deletePartner(String id);

    // Application flow
    DeliveryPartnerResponse applyAsPartner(DeliveryPartnerRequest request,
                                           MultipartFile photo,
                                           MultipartFile idProof,
                                           MultipartFile license);

    // Auth
    String login(DeliveryPartnerLoginRequest request);

    // Partner checking own status
    DeliveryPartnerResponse getMyStatus(String email);

    // Admin actions
    List<DeliveryPartnerResponse> getPartnersByStatus(String status);
    DeliveryPartnerResponse approvePartner(String id);
    DeliveryPartnerResponse rejectPartner(String id, String reason);
}