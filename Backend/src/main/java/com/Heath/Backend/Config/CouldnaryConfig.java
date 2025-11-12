package com.Heath.Backend.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class CouldnaryConfig {
    @Bean
    public Cloudinary cloudinary(
        @Value("${CLOUDINARY_CLOUD_NAME}") String cloudName,
        @Value("${CLOUDINARY_API_KEY}") String apiKey,
        @Value("${CLOUDINARY_API_SECRET}") String apiSecret
    ){
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}
