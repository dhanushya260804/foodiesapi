package com.fooddelivery.foodiesapi.service;

import com.fooddelivery.foodiesapi.entity.DeliveryPartnerEntity;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerResponse;
import com.fooddelivery.foodiesapi.repository.DeliveryPartnerRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class DeliveryPartnerServiceImpl implements DeliveryPartnerService{

    private final DeliveryPartnerRepository deliveryPartnerRepository;

    @Override
    public DeliveryPartnerResponse addPartner(DeliveryPartnerRequest request) {
        DeliveryPartnerEntity partner = DeliveryPartnerEntity.builder()
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .rating(request.getRating())
                .available(request.isAvailable())
                .build();
        partner = deliveryPartnerRepository.save(partner);
        return convertToResponse(partner);
    }

    private DeliveryPartnerResponse convertToResponse(DeliveryPartnerEntity partner) {
        return DeliveryPartnerResponse.builder()
                .id(partner.getId())
                .name(partner.getName())
                .phoneNumber(partner.getPhoneNumber())
                .rating(partner.getRating())
                .available(partner.isAvailable())
                .build();
    }

    @Override
    public List<DeliveryPartnerResponse> getAllPartners() {
        List<DeliveryPartnerEntity> partners = deliveryPartnerRepository.findAll();
        List<DeliveryPartnerResponse> responses = new ArrayList<>();
        for (DeliveryPartnerEntity partner : partners) {
            responses.add(convertToResponse(partner));
        }
        return responses;
    }

    @Override
    public List<DeliveryPartnerResponse> getAvailablePartners() {
        List<DeliveryPartnerEntity> partners = deliveryPartnerRepository.findByAvailable(true);
        List<DeliveryPartnerResponse> responses = new ArrayList<>();
        for (DeliveryPartnerEntity partner : partners) {
            responses.add(convertToResponse(partner));
        }
        return responses;
    }

    @Override
    public void deletePartner(String id) {
        deliveryPartnerRepository.deleteById(id);
    }
}
