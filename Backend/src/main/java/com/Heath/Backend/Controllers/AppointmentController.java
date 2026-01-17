package com.Heath.Backend.Controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.JwtUtil;
import com.Heath.Backend.service.AppointmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {
    private final AppointmentService appointmentService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Object>> createAppointment(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String patientEmail = jwtUtil.extractEmail(token);
        if (patientEmail == null) return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        ApiResponse<Object> resp = appointmentService.createAppointment(patientEmail, payload);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/resend-otp")
    public ResponseEntity<ApiResponse<Object>> resendOtp(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        if (email == null) return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        return ResponseEntity.ok(appointmentService.resendOtp(email, id));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<Object>> resolve(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String doctorEmail = jwtUtil.extractEmail(token);
        if (doctorEmail == null) return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        String otp = payload.get("otp");
        if (otp == null) return ResponseEntity.badRequest().body(ApiResponse.error("otp is required"));
        return ResponseEntity.ok(appointmentService.resolveAppointment(doctorEmail, id, otp));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Object>> cancel(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> payload) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        if (email == null) return ResponseEntity.status(401).body(ApiResponse.error("Invalid token"));
        String reason = payload.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(appointmentService.cancelAppointment(email, id, reason));
    }

    @GetMapping("/user/upcoming")
    public ResponseEntity<ApiResponse<Object>> patientUpcoming(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return ResponseEntity.ok(appointmentService.getPatientUpcoming(email, page, size));
    }

    @GetMapping("/user/history")
    public ResponseEntity<ApiResponse<Object>> patientHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return ResponseEntity.ok(appointmentService.getPatientHistory(email, page, size));
    }

    @GetMapping("/doctor/upcoming")
    public ResponseEntity<ApiResponse<Object>> doctorUpcoming(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return ResponseEntity.ok(appointmentService.getDoctorUpcoming(email, page, size));
    }

    @GetMapping("/doctor/history")
    public ResponseEntity<ApiResponse<Object>> doctorHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return ResponseEntity.ok(appointmentService.getDoctorHistory(email, page, size));
    }
}
