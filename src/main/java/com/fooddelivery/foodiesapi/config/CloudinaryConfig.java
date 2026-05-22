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

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    // Method to upload file to Cloudinary
    public String uploadFile(MultipartFile file) throws IOException {
        Cloudinary cloudinary = cloudinary();
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "food_images",
                        "allowed_formats", new String[]{"jpg", "png", "jpeg", "webp", "gif"}
                )
        );
        return uploadResult.get("secure_url").toString();
    }

    // Method to delete file from Cloudinary
    public void deleteFile(String publicId) throws IOException {
        Cloudinary cloudinary = cloudinary();
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    // Method to extract public ID from URL
    public String getPublicIdFromUrl(String url) {
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];
        return fileName.split("\\.")[0];
    }
}