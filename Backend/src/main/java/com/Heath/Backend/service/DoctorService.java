package com.Heath.Backend.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.Heath.Backend.Models.Doctor;
import com.Heath.Backend.Repository.DoctorRepository;
import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.EmailUtil;
import com.Heath.Backend.Utils.JwtUtil;
import com.Heath.Backend.Models.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailUtil emailUtil;
    private final JwtUtil jwtUtil;

    public ApiResponse<Object> requestOtpforDoctor(Map<String , String> payload){
        String fullname = payload.get("fullname");
        String email = payload.get("email");
        String rawPassword = payload.get("password");
        String phone = payload.get("phoneNumber");
        String specialization = payload.get("specialization");
        String clinicName = payload.get("clinicName");
        String clinicAddress = payload.get("clinicAddress");
        String city = payload.get("city");
        String about = payload.get("about");
        String state = payload.getOrDefault("state", payload.get("State"));
        String regNumber = payload.getOrDefault("regNumber", payload.get("RegNumber"));

        String profileImageUrl = payload.get("profileImageUrl");

        if (email == null || rawPassword == null || fullname == null || specialization == null) {
            return ApiResponse.error("Required fields missing");
        }

        if (doctorRepository.existsByEmail(email)) {
            return ApiResponse.error("Email already registered");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        Doctor doctor = new Doctor();
        doctor.setFullname(fullname);
        doctor.setEmail(email);
        doctor.setPassword(passwordEncoder.encode(rawPassword));
        doctor.setRole(Role.DOCTOR);
        doctor.setPhoneNumber(phone);
        doctor.setSpecialization(specialization);
        doctor.setClinicName(clinicName);
        doctor.setClinicAddress(clinicAddress);
        doctor.setCity(city);
        doctor.setAbout(about);
        doctor.setState(state);
        doctor.setOtpCode(otp);
        doctor.setRegNumber(regNumber);
        doctor.setOtpExpiry(expiry);
        doctor.setOtpUsed(false);
        doctor.setVerified(false);
        doctor.setProfileImageUrl(profileImageUrl);

        doctorRepository.save(doctor);

        emailUtil.sendOtpEmail(email, otp);

        return ApiResponse.success("OTP sent to email. It will expire in 5 minutes.", null);
    }

    public ApiResponse<Object>  verifyOtpForDoctor(String email, String otp){
        Doctor doctor = doctorRepository.findByEmail(email).orElse(null);

        if(doctor == null) return ApiResponse.error("doctor not found");

        if(doctor.getVerified()) return ApiResponse.error("doctor already verified");

        if(doctor.isOtpUsed()) return ApiResponse.error("OTP already used");

        if(LocalDateTime.now().isAfter(doctor.getOtpExpiry())) return ApiResponse.error("OTP expired");

        if(!otp.equals(doctor.getOtpCode())) return ApiResponse.error("Invaild OTP ! try again");

        doctor.setVerified(true);
        doctor.setOtpUsed(true);
        doctor.setOtpCode(null);
        doctor.setOtpExpiry(null);
        doctorRepository.save(doctor);

        String token = jwtUtil.generateToken(doctor.getEmail());

        return ApiResponse.success("Doctor registered and verified successfully", Map.of(
            "id", doctor.getId(),
            "email", doctor.getEmail(),
            "regVerified", true,
            "token", token
        ));
    }

    public ApiResponse<Object> login(String email , String password){
        Doctor doctor = doctorRepository.findByEmail(email).orElse(null);

        if (doctor == null)
            return ApiResponse.error("Doctor not found");

        if (!doctor.getVerified())
            return ApiResponse.error("Doctor not verified");

        if (!passwordEncoder.matches(password, doctor.getPassword()))
            return ApiResponse.error("Invalid credentials");

        String token = jwtUtil.generateToken(email);

        return ApiResponse.success("Login successful", Map.of("token", token));
    }

    public ApiResponse<Object> recommendByCity(String token, String city, int page, int size) {
        String email = jwtUtil.extractEmail(token);
        if (email == null) return ApiResponse.error("Invalid token");

        Pageable pageable = PageRequest.of(page, size);
        Page<Doctor> result = doctorRepository
                .findByCityIgnoreCaseAndVerifiedTrue(city, pageable);

        List<Doctor> safeList = sanitizeDoctors(result.getContent());

        return ApiResponse.success("City-based recommended doctors", Map.of(
                "doctors", safeList,
                "page", result.getNumber(),
                "totalPages", result.getTotalPages()
        ));
    }

    public ApiResponse<Object> recommendByState(String token, String state, int page, int size) {
        String email = jwtUtil.extractEmail(token);
        if (email == null) return ApiResponse.error("Invalid token");

        Pageable pageable = PageRequest.of(page, size);
        Page<Doctor> result = doctorRepository
                .findByStateIgnoreCaseAndVerifiedTrue(state, pageable);

        List<Doctor> safeList = sanitizeDoctors(result.getContent());

        return ApiResponse.success("State-based recommended doctors", Map.of(
                "doctors", safeList,
                "page", result.getNumber(),
                "totalPages", result.getTotalPages()
        ));
    }

    private List<Doctor> sanitizeDoctors(List<Doctor> list) {
        return list.stream().map(doc -> {
            doc.setPassword(null);
            doc.setOtpCode(null);
            doc.setOtpExpiry(null);
            doc.setOtpUsed(false);
            return doc;
        }).toList();
    }


    public ApiResponse<Object> recommendDoctorAdvanced(
        String token,
        String city,
        String state,
        String specialization,
        int page,
        int size
    ) {
        String email = jwtUtil.extractEmail(token);
        if (email == null) return ApiResponse.error("Invalid token");

        Pageable pageable = PageRequest.of(page, size);

        Page<Doctor> result = doctorRepository
                .findByCityIgnoreCaseAndStateIgnoreCaseAndSpecializationIgnoreCaseAndVerifiedTrue(
                        city,
                        state,
                        specialization,
                        pageable
                );

        List<Doctor> safeList = sanitizeDoctors(result.getContent());

        return ApiResponse.success("Filtered doctor list", Map.of(
                "doctors", safeList,
                "page", result.getNumber(),
                "totalPages", result.getTotalPages()
        ));
    }


    public ApiResponse<Object> updateDoctorProfile(String email, Map<String, String> data){
        Doctor doctor = doctorRepository.findByEmail(email).orElse(null);
        if (doctor == null) return ApiResponse.error("Doctor not found");

        data.remove("email");
        data.remove("specialization");
        data.remove("role");

        if (data.containsKey("password")) {
            String newPass = data.get("password");
            if (newPass != null && !newPass.isBlank()) {
                doctor.setPassword(passwordEncoder.encode(newPass));
            }
        }

        if (data.containsKey("fullname")) doctor.setFullname(data.get("fullname"));
        if (data.containsKey("clinicName")) doctor.setClinicName(data.get("clinicName"));
        if (data.containsKey("clinicAddress")) doctor.setClinicAddress(data.get("clinicAddress"));
        if (data.containsKey("city")) doctor.setCity(data.get("city"));
        if (data.containsKey("state")) doctor.setState(data.get("state"));
        if (data.containsKey("about")) doctor.setAbout(data.get("about"));

        if (data.containsKey("clinicOpenTime")) {
            doctor.setClinicOpenTime(LocalTime.parse(data.get("clinicOpenTime")));
        }

        if (data.containsKey("clinicCloseTime")) {
            doctor.setClinicCloseTime(LocalTime.parse(data.get("clinicCloseTime")));
        }

        if (data.containsKey("workingDays")) {
            Set<String> days = new HashSet<>(Arrays.asList(data.get("workingDays").split(",")));
            doctor.setWorkingDays(days);
        }

        if (data.containsKey("profileImageUrl")) {
            doctor.setProfileImageUrl(data.get("profileImageUrl"));
        }

        doctorRepository.save(doctor);

        doctor.setPassword(null);
        doctor.setOtpCode(null);
        doctor.setOtpExpiry(null);

        return ApiResponse.success("Profile updated successfully", doctor);
    }
}
