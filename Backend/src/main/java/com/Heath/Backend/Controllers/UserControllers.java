package com.Heath.Backend.Controllers;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Heath.Backend.Models.User;
import com.Heath.Backend.Repository.UserRepository;
import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.JwtUtil;
import com.Heath.Backend.service.UsersService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserControllers {

    private final UsersService usersService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

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

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Object>> getProfile(@Valid @RequestHeader("Authorization") String authHeader){
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            if (email == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }

            User user = userOpt.get();

            user.setPassword(null);
            return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", user));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Something went wrong"));
        }
    }
}