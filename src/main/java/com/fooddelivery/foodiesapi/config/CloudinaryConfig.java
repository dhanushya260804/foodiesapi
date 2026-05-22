package com.fooddelivery.foodiesapi.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud_name:}")
    private String cloudName;

    @Value("${cloudinary.api_key:}")
    private String apiKey;

    @Value("${cloudinary.api_secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isEmpty()) {
            return null;
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // Return default image URL instead of uploading
        if (cloudinary() == null) {
            return "https://via.placeholder.com/300x200?text=Food+Image";
        }
        try {
            Map<?, ?> uploadResult = cloudinary().uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "food_images")
            );
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            return "https://via.placeholder.com/300x200?text=Food+Image";
        }
    }
}