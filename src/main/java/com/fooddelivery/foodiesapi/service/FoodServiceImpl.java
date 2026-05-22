package com.fooddelivery.foodiesapi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fooddelivery.foodiesapi.config.CloudinaryConfig;
import com.fooddelivery.foodiesapi.entity.FoodEntity;
import com.fooddelivery.foodiesapi.io.FoodRequest;
import com.fooddelivery.foodiesapi.io.FoodResponse;
import com.fooddelivery.foodiesapi.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodRepository foodRepository;
    private final CloudinaryConfig cloudinaryConfig;
    private final Cloudinary cloudinary;

    @Override
    public FoodResponse addFood(FoodRequest request, MultipartFile image) {
        try {
            String imageUrl = cloudinaryConfig.uploadFile(image);
            FoodEntity entity = convertToEntity(request);
            entity.setImageUrl(imageUrl);
            FoodEntity saved = foodRepository.save(entity);
            return convertToResponse(saved);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to add food: " + e.getMessage());
        }
    }

    @Override
    public List<FoodResponse> getAllFoods() {
        List<FoodEntity> entities = foodRepository.findAll();
        List<FoodResponse> responses = new ArrayList<>();
        for (FoodEntity entity : entities) {
            responses.add(convertToResponse(entity));
        }
        return responses;
    }

    @Override
    public List<FoodResponse> readFoods() {
        return getAllFoods();
    }

    @Override
    public FoodResponse getFoodById(String id) {
        FoodEntity entity = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));
        return convertToResponse(entity);
    }

    @Override
    public FoodResponse readFood(String id) {
        FoodEntity entity = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found with id: " + id));
        return convertToResponse(entity);
    }

    @Override
    public FoodResponse updateFood(String id, FoodRequest request, MultipartFile image) {
        FoodEntity existing = foodRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found"));

        try {
            String imageUrl = existing.getImageUrl();
            if (image != null && !image.isEmpty()) {
                imageUrl = cloudinaryConfig.uploadFile(image);
            }

            FoodEntity updated = convertToEntity(request);
            updated.setId(id);
            updated.setImageUrl(imageUrl);
            FoodEntity saved = foodRepository.save(updated);
            return convertToResponse(saved);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to update food: " + e.getMessage());
        }
    }

    @Override
    public void deleteFood(String id) {
        if (!foodRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Food not found");
        }
        foodRepository.deleteById(id);
    }

    @Override
    public List<FoodResponse> getFoodsByCategory(String category) {
        List<FoodEntity> entities = foodRepository.findByCategory(category);
        List<FoodResponse> responses = new ArrayList<>();
        for (FoodEntity entity : entities) {
            responses.add(convertToResponse(entity));
        }
        return responses;
    }

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(), ObjectUtils.asMap("folder", "foods"));
            return (String) uploadResult.get("secure_url");
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
        }
    }

    @Override
    public boolean deleteFile(String imageUrl) {
        try {
            cloudinary.uploader().destroy(extractPublicId(imageUrl), ObjectUtils.emptyMap());
            return true;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File delete failed");
        }
    }

    private String extractPublicId(String url) {
        try {
            String after = url.split("/upload/")[1].replaceFirst("v\\d+/", "");
            int dot = after.lastIndexOf(".");
            return dot != -1 ? after.substring(0, dot) : after;
        } catch (Exception e) {
            return url;
        }
    }

    private FoodResponse convertToResponse(FoodEntity entity) {
        return FoodResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .price(entity.getPrice())
                .category(entity.getCategory())
                .veg(entity.isVeg())
                .quantityPerSet(entity.getQuantityPerSet())
                .unit(entity.getUnit())
                .addOnsEnabled(entity.isAddOnsEnabled())
                .addOns(entity.getAddOns() != null ? entity.getAddOns() : new ArrayList<>())
                .preferences(entity.getPreferences() != null ? entity.getPreferences() : new ArrayList<>())
                .variants(entity.getVariants() != null ? entity.getVariants() : new ArrayList<>())
                .variantRequired(entity.isVariantRequired())
                .build();
    }

    private FoodEntity convertToEntity(FoodRequest request) {
        return FoodEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .veg(request.isVeg())
                .quantityPerSet(request.getQuantityPerSet())
                .unit(request.getUnit())
                .addOnsEnabled(request.isAddOnsEnabled())
                .addOns(request.getAddOns() != null ? request.getAddOns() : new ArrayList<>())
                .preferences(request.getPreferences() != null ? request.getPreferences() : new ArrayList<>())
                .variants(request.getVariants() != null ? request.getVariants() : new ArrayList<>())
                .variantRequired(request.isVariantRequired())
                .build();
    }
}