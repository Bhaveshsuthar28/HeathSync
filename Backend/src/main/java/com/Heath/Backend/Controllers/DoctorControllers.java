package com.Heath.Backend.Controllers;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Heath.Backend.Repository.DoctorRepository;
import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.JwtUtil;
import com.Heath.Backend.service.CloudinaryService;
import com.Heath.Backend.service.DoctorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/doctors")
public class DoctorControllers {
    private final DoctorService doctorService;
    private final JwtUtil jwtUtil;
    private final DoctorRepository doctorRepository;
    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Object>> requestOtpJson(@RequestBody Map<String , String> body){
        ApiResponse<Object> response = doctorService.requestOtpforDoctor(body);
        return ResponseEntity.ok(response);
    }

    
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Object>> requestOtp(
            @RequestParam Map<String , String> body,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage){
        try {
            if (profileImage != null && !profileImage.isEmpty()) {
                String imageUrl = cloudinaryService.uploadFile(profileImage);
                if (imageUrl != null) {
                    body.put("profileImageUrl", imageUrl);
                }
            }
            ApiResponse<Object> response = doctorService.requestOtpforDoctor(body);
            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to upload profile image"));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Object>> verifyOtp(@Valid @RequestBody Map<String, String> body){
        String email = body.get("email");
        String otp = body.get("otp");

        ApiResponse<Object> response = doctorService.verifyOtpForDoctor(email, otp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@Valid @RequestBody Map<String , String> payload){
        String email = payload.get("email");
        String password = payload.get("password");
        ApiResponse<Object> response = doctorService.login(email, password);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Object>> getProfile(@Valid @RequestHeader("Authorization") String authHeader){
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
            }

            String email = jwtUtil.extractEmail(authHeader.substring(7));
            if (email == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
            }

            return doctorRepository.findByEmail(email)
                .map(doctor -> {
                    doctor.setPassword(null);
                    doctor.setOtpCode(null);
                    doctor.setOtpExpiry(null);
                    return ResponseEntity.ok(
                        ApiResponse.success("Profile fetched successfully", (Object) doctor)
                    );
                })
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Doctor not found")));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ApiResponse.error("Something went wrong"));
        }
    }

    @PatchMapping(value = "/update" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Object>> updateProfile(@RequestHeader("Authorization") String authHeader, @RequestParam Map<String, String> fields, @RequestParam(value = "profileImage", required = false) MultipartFile profileImage){
        try {
            if (profileImage != null && !profileImage.isEmpty()) {
                String imageUrl = cloudinaryService.uploadFile(profileImage);
                fields.put("profileImageUrl", imageUrl);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Image upload failed"));
        }

        String email = jwtUtil.extractEmail(authHeader.substring(7));
        ApiResponse<Object> response = doctorService.updateDoctorProfile(email, fields);

        return ResponseEntity.ok(response);
    }
}
