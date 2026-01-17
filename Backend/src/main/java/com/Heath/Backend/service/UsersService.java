package com.Heath.Backend.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

import org.springframework.mail.MailException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Heath.Backend.Models.User;
import com.Heath.Backend.Repository.UserRepository;
import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.EmailUtil;
import com.Heath.Backend.Utils.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsersService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailUtil emailUtil;

    private static String normalizeEmail(String email) {
        if (email == null) return null;
        String normalized = email.trim().toLowerCase();
        return normalized.isEmpty() ? null : normalized;
    }

    private static String normalizeUsername(String username) {
        if (username == null) return null;
        String normalized = username.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<Object> requestOtp(String username, String email, String password){
        String normalizedEmail = normalizeEmail(email);
        String normalizedUsername = normalizeUsername(username);

        if (normalizedEmail == null) return ApiResponse.error("Email is required");
        if (normalizedUsername == null) return ApiResponse.error("Username is required");
        if (password == null || password.isBlank()) return ApiResponse.error("Password is required");

        User existing = userRepository.findByEmail(normalizedEmail).orElse(null);

        if(existing != null && existing.isVerified()){
            return ApiResponse.error("User Already Exists");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        User user = existing != null ? existing : new User();
        user.setUserName(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setOtpCode(otp);
        user.setOtpExpiry(expiry);
        user.setOtpUsed(false);
        user.setVerified(false);

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            if (userRepository.existsByEmail(normalizedEmail)) {
                return ApiResponse.error("Email already registered");
            }
            if (userRepository.existsByUserName(normalizedUsername)) {
                return ApiResponse.error("This name is already used");
            }
            throw ex;
        }
        
        try {
            emailUtil.sendOtpEmail(normalizedEmail, otp);
        } catch (MailException e) {
            throw e;
        }

        return ApiResponse.success("OTP sent successfully to " + normalizedEmail , null);
    }


    public ApiResponse<Object> Verification(String email , String otp){
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) return ApiResponse.error("Email is required");

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if(user == null) return ApiResponse.error("User not found");

        if(user.isVerified()) return ApiResponse.error("User already verified");

        if(user.isOtpUsed()) return ApiResponse.error("OTP already used");

        if(LocalDateTime.now().isAfter(user.getOtpExpiry())) return ApiResponse.error("OTP expired");

        if(!otp.equals(user.getOtpCode())) return ApiResponse.error("Invaild OTP ! try again");

        user.setVerified(true);
        user.setOtpUsed(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(normalizedEmail);
        return ApiResponse.success("Registration successful",   new TokenResponse(token));
    }

    public static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public ApiResponse<Object> login(String email , String password){
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) return ApiResponse.error("Email is required");

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null)
            return ApiResponse.error("User not found");

        if (!user.isVerified())
            return ApiResponse.error("User not verified");

        if (!passwordEncoder.matches(password, user.getPassword()))
            return ApiResponse.error("Invalid credentials");

        String token = jwtUtil.generateToken(normalizedEmail);

        return ApiResponse.success("Login successful", Map.of("token", token));
    }

    public ApiResponse<Object> updateUserProfile(String email, Map<String, Object> payload){
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) return ApiResponse.error("User not Found");

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if(user == null) return ApiResponse.error("User not Found");

        String userName = (String) payload.get("userName");
        String city = (String) payload.get("city");
        String state = (String) payload.get("state");

        if(userName !=null && !userName.isBlank()){
            if(userRepository.existsByUserName(userName) && !user.getUserName().equals(userName)){
                return ApiResponse.error("This name is already used");
            }

            user.setUserName(userName);
        }

        if (city != null) user.setCity(city);
        if (state != null) user.setState(state);

        userRepository.save(user);

        user.setPassword(null);

        return ApiResponse.success("Profile updated successfully", user);
    }

}
