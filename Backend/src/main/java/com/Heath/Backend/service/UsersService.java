package com.Heath.Backend.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public ApiResponse<Object> requestOtp(String username, String email, String password){

        if(userRepository.existsByEmail(email)){
            return ApiResponse.error("User Already Exists");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        User user = new User();
        user.setUserName(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setOtpCode(otp);
        user.setOtpExpiry(expiry);
        user.setOtpUsed(false);
        user.setVerified(false);
        userRepository.save(user);

        emailUtil.sendOtpEmail(email, otp);

        return ApiResponse.success("OTP sent successfully to " + email , null);
    }


    public ApiResponse<Object> Verification(String email , String otp){
        User user = userRepository.findByEmail(email).orElse(null);

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

        String token = jwtUtil.generateToken(email);
        return ApiResponse.success("Registration successful",   new TokenResponse(token));
    }

    public static class TokenResponse {
        private String token;
        public TokenResponse(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public ApiResponse<Object> login(String email , String password){
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null)
            return ApiResponse.error("User not found");

        if (!user.isVerified())
            return ApiResponse.error("User not verified");

        if (!passwordEncoder.matches(password, user.getPassword()))
            return ApiResponse.error("Invalid credentials");

        String token = jwtUtil.generateToken(email);

        return ApiResponse.success("Login successful", Map.of("token", token));
    }

    public ApiResponse<Object> updateUserProfile(String email, Map<String, Object> payload){
        User user = userRepository.findByEmail(email).orElse(null);
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
