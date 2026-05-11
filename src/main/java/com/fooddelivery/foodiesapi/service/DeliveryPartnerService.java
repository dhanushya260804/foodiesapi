package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.io.DeliveryPartnerRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerResponse;
import java.util.List;

public interface DeliveryPartnerService {
    DeliveryPartnerResponse addPartner(DeliveryPartnerRequest request);
    List<DeliveryPartnerResponse> getAllPartners();
    List<DeliveryPartnerResponse> getAvailablePartners();
    void deletePartner(String id);
}
