package com.Heath.Backend.Controllers;

import java.util.Map;
import java.util.Optional;

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

import com.Heath.Backend.Models.User;
import com.Heath.Backend.Repository.UserRepository; 
import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.JwtUtil;
import com.Heath.Backend.service.DoctorService;
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
    private final DoctorService doctorService;

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

    @GetMapping("/recommend/city")
    public ResponseEntity<ApiResponse<Object>> recommendByCity(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam("city") String city,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        if (!authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        }

        String token = authHeader.substring(7);
        ApiResponse<Object> response = doctorService.recommendByCity(token, city, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommend/state")
    public ResponseEntity<ApiResponse<Object>> recommendByState(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("state") String state,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        if (!authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        }

        String token = authHeader.substring(7);
        ApiResponse<Object> response = doctorService.recommendByState(token, state, page, size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/update")
    public ResponseEntity<ApiResponse<Object>> updateUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> payload)
    {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(ApiResponse.error("Invalid or missing token"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            if (email == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
            }

            ApiResponse<Object> response = usersService.updateUserProfile(email, payload);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Something went wrong"));
        }
    }
    
    @GetMapping("/recommend/advanced")
    public ResponseEntity<ApiResponse<Object>> recommendAdvanced(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String city,
            @RequestParam String state,
            @RequestParam String specialization,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        }

        String token = authHeader.substring(7);
        ApiResponse<Object> response = doctorService.recommendDoctorAdvanced(token, city, state, specialization, page, size);

        return ResponseEntity.ok(response);
    }

}