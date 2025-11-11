package com.Heath.Backend.Controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.service.UsersService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserControllers {

    private final UsersService usersService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> Userregister(@Valid @RequestBody Map<String , String> payload){
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        ApiResponse<Object> response = usersService.requestOtp(username, email, password);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Object>> UserverifyOtp(@RequestBody Map<String , String> payload){
        String email = payload.get("email");
        String otp = payload.get("otp");

        ApiResponse<Object> response = usersService.Verification(email, otp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@Valid @RequestBody Map<String , String> payload){
        String email = payload.get("email");
        String password = payload.get("password");
        ApiResponse<Object> response = usersService.login(email, password);
        return ResponseEntity.ok(response);
    }
}