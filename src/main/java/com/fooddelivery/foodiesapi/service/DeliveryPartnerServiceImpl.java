package com.fooddelivery.foodiesapi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fooddelivery.foodiesapi.entity.DeliveryPartnerEntity;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerLoginRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerRequest;
import com.fooddelivery.foodiesapi.io.DeliveryPartnerResponse;
import com.fooddelivery.foodiesapi.repository.DeliveryPartnerRepository;
import com.fooddelivery.foodiesapi.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class DeliveryPartnerServiceImpl implements DeliveryPartnerService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final Cloudinary cloudinary;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    private static final int MAX_APPLICATIONS = 3;

    @Override
    public DeliveryPartnerResponse applyAsPartner(DeliveryPartnerRequest request,
                                                  MultipartFile photo,
                                                  MultipartFile idProof,
                                                  MultipartFile license) {
        if (deliveryPartnerRepository.existsByEmail(request.getEmail())) {
            DeliveryPartnerEntity existing = deliveryPartnerRepository
                    .findByEmail(request.getEmail()).orElseThrow();

            if (existing.getApplicationCount() >= MAX_APPLICATIONS)
                throw new RuntimeException("Maximum application attempts (3) reached for this email");
            if ("PENDING".equals(existing.getStatus()))
                throw new RuntimeException("Your application is already under review");
            if ("APPROVED".equals(existing.getStatus()))
                throw new RuntimeException("You are already an approved delivery partner");

            existing.setName(request.getName());
            existing.setPhoneNumber(request.getPhoneNumber());
            existing.setVehicleNumber(request.getVehicleNumber());
            existing.setLicenseNumber(request.getLicenseNumber());
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
            existing.setPhotoUrl(uploadFile(photo, "partners/photos"));
            existing.setIdProofUrl(uploadFile(idProof, "partners/idproofs"));
            existing.setLicenseUrl(uploadFile(license, "partners/licenses"));
            existing.setStatus("PENDING");
            existing.setRejectionReason(null);
            existing.setApplicationCount(existing.getApplicationCount() + 1);
            existing.setAppliedAt(LocalDateTime.now());
            existing.setUpdatedAt(LocalDateTime.now());
            return convertToResponse(deliveryPartnerRepository.save(existing));
        }

        DeliveryPartnerEntity partner = DeliveryPartnerEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .vehicleNumber(request.getVehicleNumber())
                .licenseNumber(request.getLicenseNumber())
                .photoUrl(uploadFile(photo, "partners/photos"))
                .idProofUrl(uploadFile(idProof, "partners/idproofs"))
                .licenseUrl(uploadFile(license, "partners/licenses"))
                .status("PENDING")
                .applicationCount(1)
                .available(false)
                .rating(0.0)
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return convertToResponse(deliveryPartnerRepository.save(partner));
    }

    @Override
    public String login(DeliveryPartnerLoginRequest request) {
        DeliveryPartnerEntity partner = deliveryPartnerRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email"));
        if (!passwordEncoder.matches(request.getPassword(), partner.getPassword()))
            throw new RuntimeException("Invalid password");
        return jwtUtil.generateToken(partner.getEmail());
    }

    @Override
    public DeliveryPartnerResponse getMyStatus(String email) {
        return convertToResponse(deliveryPartnerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Partner not found")));
    }

    @Override
    public List<DeliveryPartnerResponse> getPartnersByStatus(String status) {
        List<DeliveryPartnerResponse> responses = new ArrayList<>();
        for (DeliveryPartnerEntity p : deliveryPartnerRepository.findByStatus(status))
            responses.add(convertToResponse(p));
        return responses;
    }

    @Override
    public DeliveryPartnerResponse approvePartner(String id) {
        DeliveryPartnerEntity partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        partner.setStatus("APPROVED");
        partner.setAvailable(true);
        partner.setRejectionReason(null);
        partner.setUpdatedAt(LocalDateTime.now());
        return convertToResponse(deliveryPartnerRepository.save(partner));
    }

    @Override
    public DeliveryPartnerResponse rejectPartner(String id, String reason) {
        DeliveryPartnerEntity partner = deliveryPartnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found"));
        partner.setStatus("REJECTED");
        partner.setAvailable(false);
        partner.setRejectionReason(reason);
        partner.setUpdatedAt(LocalDateTime.now());
        return convertToResponse(deliveryPartnerRepository.save(partner));
    }

    @Override
    public List<DeliveryPartnerResponse> getAllPartners() {
        List<DeliveryPartnerResponse> responses = new ArrayList<>();
        for (DeliveryPartnerEntity p : deliveryPartnerRepository.findAll())
            responses.add(convertToResponse(p));
        return responses;
    }

    @Override
    public List<DeliveryPartnerResponse> getAvailablePartners() {
        List<DeliveryPartnerResponse> responses = new ArrayList<>();
        for (DeliveryPartnerEntity p : deliveryPartnerRepository.findByAvailable(true))
            responses.add(convertToResponse(p));
        return responses;
    }

    @Override
    public void deletePartner(String id) {
        deliveryPartnerRepository.deleteById(id);
    }

    private String uploadFile(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", folder)
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    private DeliveryPartnerResponse convertToResponse(DeliveryPartnerEntity partner) {
        return DeliveryPartnerResponse.builder()
                .id(partner.getId())
                .name(partner.getName())
                .email(partner.getEmail())
                .phoneNumber(partner.getPhoneNumber())
                .vehicleNumber(partner.getVehicleNumber())
                .licenseNumber(partner.getLicenseNumber())
                .photoUrl(partner.getPhotoUrl())
                .idProofUrl(partner.getIdProofUrl())
                .licenseUrl(partner.getLicenseUrl())
                .rating(partner.getRating())
                .available(partner.isAvailable())
                .status(partner.getStatus())
                .rejectionReason(partner.getRejectionReason())
                .applicationCount(partner.getApplicationCount())
                .appliedAt(partner.getAppliedAt())
                .updatedAt(partner.getUpdatedAt())
                .build();
    }
}