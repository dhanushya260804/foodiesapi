package com.fooddelivery.foodiesapi.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @Bean
    public Cloudinary cloudinary() {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
        return this.cloudinary;
    }

    // Method to upload file to Cloudinary
    public String uploadFile(MultipartFile file) throws IOException {
        if (cloudinary == null) {
            cloudinary();
        }
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
        if (cloudinary == null) {
            cloudinary();
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}