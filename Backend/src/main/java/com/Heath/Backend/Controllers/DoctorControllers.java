package com.Heath.Backend.Controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.service.DoctorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/doctors")
public class DoctorControllers {
    private final DoctorService doctorService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> requestOtp(@Valid @RequestBody Map<String , String> body){
        ApiResponse<Object> response = doctorService.requestOtpforDoctor(body);
        return ResponseEntity.ok(response);
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
}
