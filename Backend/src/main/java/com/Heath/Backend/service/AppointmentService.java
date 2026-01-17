package com.Heath.Backend.service;

import java.security.SecureRandom;
import java.time.*;
import java.util.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.Heath.Backend.Models.Appointment;
import com.Heath.Backend.Models.Doctor;
import com.Heath.Backend.Models.User;
import com.Heath.Backend.Models.Appointment.Status;
import com.Heath.Backend.Repository.AppointmentRepository;
import com.Heath.Backend.Repository.DoctorCloseDateRepository;
import com.Heath.Backend.Repository.DoctorRepository;
import com.Heath.Backend.Repository.UserRepository;
import com.Heath.Backend.Utils.ApiResponse;
import com.Heath.Backend.Utils.EmailUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorCloseDateRepository doctorClosedDateRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailUtil emailUtil;

    private final SecureRandom random = new SecureRandom();

    private final int OTP_LENGTH = 6;
    private final Duration OTP_TTL = Duration.ofMinutes(15);
    private final int SEARCH_DAYS_AHEAD = 30;

    private boolean isDevMode() {
        return false;
    }

    @Transactional
    public ApiResponse<Object> createAppointment(String patientEmail, Map<String, String> payload){
        Long doctorId = parseLong(payload.get("doctorId"));
        if (doctorId == null) return ApiResponse.error("doctorId is required");

        String timeStr = payload.get("time");
        if (timeStr == null) return ApiResponse.error("time is required (HH:mm)");

        LocalTime time;
        try {
            time = LocalTime.parse(timeStr);
        } catch (Exception e) {
            return ApiResponse.error("invalid time format, expected HH:mm");
        }

        Integer duration = payload.get("durationMinutes") != null ? Integer.parseInt(payload.get("durationMinutes")) : 30;
        String message = payload.get("message");

        Optional<User> patientOpt = userRepository.findByEmail(patientEmail);
        User patient = patientOpt.orElse(null);
        if (patient == null) return ApiResponse.error("Patient not found");

        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) return ApiResponse.error("Doctor not found");
        Doctor doctor = doctorOpt.get();

        LocalDate scheduledDate = null;

        if (payload.get("date") != null) {
            try {
                scheduledDate = LocalDate.parse(payload.get("date"));
            } catch (Exception e) {
                return ApiResponse.error("invalid date format, expected yyyy-MM-dd");
            }
        } else {
            scheduledDate = findNextAvailableDateForTime(doctor, time);
            if (scheduledDate == null) return ApiResponse.error("Doctor not available for the selected time in the next " + SEARCH_DAYS_AHEAD + " days");
        }

        LocalDateTime scheduledAt = LocalDateTime.of(scheduledDate, time);

        if (scheduledAt.isBefore(LocalDateTime.now())) {
            return ApiResponse.error("Selected date/time is in the past");
        }

        if (!isWithinClinicHours(doctor, time)) {
            return ApiResponse.error("Selected time is outside doctor's clinic hours");
        }

        List<Appointment> conflicts = appointmentRepository.findConflictingForExactStart(doctorId, scheduledAt);
        if (!conflicts.isEmpty()) {
            return ApiResponse.error("Selected slot already taken");
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setScheduledAt(scheduledAt);
        appointment.setDurationMinutes(duration);
        appointment.setMessage(message);

        String otp = generateNumericOtp(OTP_LENGTH);
        String otpHash = passwordEncoder.encode(otp);
        appointment.setOtpHash(otpHash);
        appointment.setOtpExpiry(LocalDateTime.now().plus(OTP_TTL));
        appointment.setOtpAttempts(0);
        appointment.setMaxOtpAttempts(3);
        appointment.setStatus(Status.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        String subject = "Your appointment OTP";
        String body = "Your OTP for appointment with Dr. " + doctor.getFullname() + " on " + scheduledAt.toString() +
                " is: " + otp + ". It will expire in " + OTP_TTL.toMinutes() + " minutes.";

        emailUtil.sendSimpleEmail(patient.getEmail(), subject, body);

        Map<String, Object> resp = new HashMap<>();
        resp.put("appointment", sanitize(saved));
        resp.put("otpSent", true);

        if (isDevMode()) resp.put("devOtp", otp);

        return ApiResponse.success("Appointment created and OTP sent to patient", resp);
    }

    @Transactional
    public ApiResponse<Object> resendOtp(String patientEmail, Long appointmentId) {
        Optional<Appointment> opt = appointmentRepository.findById(appointmentId);
        if (opt.isEmpty()) return ApiResponse.error("Appointment not found");
        Appointment appointment = opt.get();

        Optional<User> p = userRepository.findByEmail(patientEmail);
        User patient = p.orElse(null);

        if (patient == null || !patient.getId().equals(appointment.getPatient().getId())) return ApiResponse.error("Not authorized");

        if (appointment.getStatus() != Status.PENDING) return ApiResponse.error("Only pending appointments can receive OTP");

        if (appointment.getOtpExpiry() != null && appointment.getOtpExpiry().isAfter(LocalDateTime.now().minusMinutes(2))) {
            return ApiResponse.error("Please wait before requesting a new OTP");
        }

        String newOtp = generateNumericOtp(OTP_LENGTH);
        appointment.setOtpHash(passwordEncoder.encode(newOtp));
        appointment.setOtpExpiry(LocalDateTime.now().plus(OTP_TTL));
        appointment.setOtpAttempts(0);
        appointmentRepository.save(appointment);

        Doctor doctor = null;
        if (appointment.getDoctor() != null) {
            doctor = appointment.getDoctor();
        }

        String subject = "Your appointment OTP (resend)";
        String body = "Your new OTP for appointment with Dr. " + (doctor != null ? doctor.getFullname() : "") +
                " on " + appointment.getScheduledAt().toString() + " is: " + newOtp;

        emailUtil.sendSimpleEmail(patient.getEmail(), subject, body);

        Map<String, Object> resp = new HashMap<>();
        resp.put("otpSent", true);

        if (isDevMode()) resp.put("devOtp", newOtp);

        return ApiResponse.success("OTP resent", resp);
    }

    @Transactional
    public ApiResponse<Object> resolveAppointment(String doctorEmail, Long appointmentId, String otpProvided) {
        Optional<Doctor> docOpt = doctorRepository.findByEmail(doctorEmail);
        Doctor doctor = docOpt.orElse(null);
        if (doctor == null) return ApiResponse.error("Doctor not found");

        Appointment appointment = appointmentRepository.findByIdForUpdate(appointmentId);
        if (appointment == null) return ApiResponse.error("Appointment not found");

        if (!appointment.getDoctor().getId().equals(doctor.getId())) return ApiResponse.error("Not authorized");

        if (appointment.getStatus() != Status.PENDING) {
            return ApiResponse.error("Appointment not in pending state");
        }

        if (appointment.getOtpExpiry() == null || LocalDateTime.now().isAfter(appointment.getOtpExpiry())) {
            return ApiResponse.error("OTP expired");
        }

        if (appointment.getOtpAttempts() >= appointment.getMaxOtpAttempts()) {
            appointment.setStatus(Status.OTP_LOCKED);
            appointmentRepository.save(appointment);
            return ApiResponse.error("OTP attempts exhausted; appointment locked");
        }

        boolean ok = passwordEncoder.matches(otpProvided, appointment.getOtpHash());
        if (!ok) {
            appointment.setOtpAttempts(appointment.getOtpAttempts() + 1);
            appointmentRepository.save(appointment);
            if (appointment.getOtpAttempts() >= appointment.getMaxOtpAttempts()) {
                appointment.setStatus(Status.OTP_LOCKED);
                appointmentRepository.save(appointment);
                return ApiResponse.error("Wrong OTP. Attempts exhausted; appointment locked");
            }
            return ApiResponse.error("Wrong OTP");
        }

        appointment.setStatus(Status.RESOLVED);
        appointment.setResolvedBy(doctor.getId());
        appointment.setResolvedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        Optional<User> patientOpt = userRepository.findById(appointment.getPatient().getId());
        User patient = patientOpt.orElse(null);

        if (patient != null) {
            String sub = "Appointment completed";
            String body = "Your appointment with Dr. " + doctor.getFullname() + " on " + appointment.getScheduledAt() + " is marked as completed.";
            emailUtil.sendSimpleEmail(patient.getEmail(), sub, body);
        }

        return ApiResponse.success("Appointment resolved successfully", Map.of("appointment", sanitize(appointment)));
    }

    @Transactional
    public ApiResponse<Object> cancelAppointment(String requesterEmail, Long appointmentId, String reason) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return ApiResponse.error("Appointment not found");
        Appointment appointment = appointmentOpt.get();

        Optional<User> userOpt = userRepository.findByEmail(requesterEmail);
        User user = userOpt.orElse(null);

        Optional<Doctor> doctorOpt = doctorRepository.findByEmail(requesterEmail);
        Doctor doctor = doctorOpt.orElse(null);

        boolean isPatient = user != null && user.getId().equals(appointment.getPatient().getId());
        boolean isDoctor = doctor != null && appointment.getDoctor() != null && doctor.getId().equals(appointment.getDoctor().getId());

        if (!isPatient && !isDoctor) return ApiResponse.error("Not authorized to cancel this appointment");

        if (appointment.getStatus() != Status.PENDING) {
            return ApiResponse.error("Only pending appointments can be cancelled");
        }

        appointment.setStatus(Status.CANCELLED);
        appointment.setCancelledBy(isDoctor ? "DOCTOR" : "PATIENT");
        appointment.setCancelReason(reason);
        appointmentRepository.save(appointment);

        if (isDoctor) {
            Optional<User> pat = userRepository.findById(appointment.getPatient().getId());
            User p = pat.orElse(null);
            if (p != null) {
                emailUtil.sendSimpleEmail(
                        p.getEmail(),
                        "Appointment cancelled by doctor",
                        "Your appointment with Dr. " + doctor.getFullname() + " was cancelled.\n\nReason: " + reason
                );
            }
        } else {
            Optional<Doctor> d = doctorRepository.findById(appointment.getDoctor().getId());
            Doctor doc = d.orElse(null);
            if (doc != null) {
                emailUtil.sendSimpleEmail(
                        doc.getEmail(),
                        "Appointment cancelled by patient",
                        "Appointment with patient Name " + appointment.getPatient().getUserName() + " was cancelled.\n\nReason: " + reason
                );
            }
        }

        return ApiResponse.success("Appointment cancelled", Map.of("appointment", sanitize(appointment)));
    }

    public ApiResponse<Object> getPatientUpcoming(String patientEmail, int page, int size) {
        Optional<User> patientOpt = userRepository.findByEmail(patientEmail);
        User patient = patientOpt.orElse(null);
        if (patient == null) return ApiResponse.error("Patient not found");

        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> result = appointmentRepository.findByPatient_IdAndStatusAndScheduledAtAfterOrderByScheduledAtAsc(
                patient.getId(), Status.PENDING, LocalDateTime.now(), pageable);

        List<Appointment> sanitized = result.getContent().stream().map(this::sanitize).toList();

        return ApiResponse.success("Upcoming appointments", Map.of("appointments", sanitized, "page", result.getNumber(), "totalPages", result.getTotalPages()));
    }

    public ApiResponse<Object> getPatientHistory(String patientEmail, int page, int size) {
        Optional<User> patientOpt = userRepository.findByEmail(patientEmail);
        User patient = patientOpt.orElse(null);
        if (patient == null) return ApiResponse.error("Patient not found");

        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> result = appointmentRepository.findByPatient_IdAndStatusInOrderByScheduledAtDesc(
                patient.getId(), List.of(Status.RESOLVED, Status.CANCELLED, Status.OTP_LOCKED), pageable);

        List<Appointment> sanitized = result.getContent().stream().map(this::sanitize).toList();

        return ApiResponse.success("Appointment history", Map.of("appointments", sanitized, "page", result.getNumber(), "totalPages", result.getTotalPages()));
    }

    public ApiResponse<Object> getDoctorUpcoming(String doctorEmail, int page, int size) {
        Optional<Doctor> doctorOpt = doctorRepository.findByEmail(doctorEmail);
        Doctor doctor = doctorOpt.orElse(null);
        if (doctor == null) return ApiResponse.error("Doctor not found");

        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> result = appointmentRepository.findByDoctor_IdAndStatusAndScheduledAtAfterOrderByScheduledAtAsc(
                doctor.getId(), Status.PENDING, LocalDateTime.now(), pageable);

        List<Appointment> sanitized = result.getContent().stream().map(this::sanitize).toList();

        return ApiResponse.success("Doctor upcoming appointments", Map.of("appointments", sanitized, "page", result.getNumber(), "totalPages", result.getTotalPages()));
    }

    public ApiResponse<Object> getDoctorHistory(String doctorEmail, int page, int size) {
        Optional<Doctor> doctorOpt = doctorRepository.findByEmail(doctorEmail);
        Doctor doctor = doctorOpt.orElse(null);
        if (doctor == null) return ApiResponse.error("Doctor not found");

        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> result = appointmentRepository.findByDoctor_IdAndStatusInOrderByScheduledAtDesc(
                doctor.getId(), List.of(Status.RESOLVED, Status.CANCELLED, Status.OTP_LOCKED), pageable);

        List<Appointment> sanitized = result.getContent().stream().map(this::sanitize).toList();

        return ApiResponse.success("Doctor appointment history", Map.of("appointments", sanitized, "page", result.getNumber(), "totalPages", result.getTotalPages()));
    }

    private LocalDate findNextAvailableDateForTime(Doctor doctor, LocalTime time) {
        LocalDate today = LocalDate.now();
        for (int i = 0; i < SEARCH_DAYS_AHEAD; i++) {
            LocalDate candidate = today.plusDays(i);

            if (doctor.getWorkingDays() == null || !doctor.getWorkingDays().contains(candidate.getDayOfWeek().toString())) {
                continue;
            }

            boolean isClosed = doctorClosedDateRepository.existsByDoctorIdAndClosedDate(doctor.getId(), candidate);
            if (isClosed) continue;

            if (!isWithinClinicHours(doctor, time)) continue;

            LocalDateTime candDateTime = LocalDateTime.of(candidate, time);
            List<Appointment> conflicts = appointmentRepository.findConflictingForExactStart(doctor.getId(), candDateTime);

            if (!conflicts.isEmpty()) continue;

            return candidate;
        }
        return null;
    }

    private boolean isWithinClinicHours(Doctor doctor, LocalTime time) {
        if (doctor.getClinicOpenTime() == null || doctor.getClinicCloseTime() == null) return false;
        return !time.isBefore(doctor.getClinicOpenTime()) && time.isBefore(doctor.getClinicCloseTime());
    }

    private String generateNumericOtp(int length) {
        String digits = "0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(digits.charAt(random.nextInt(digits.length())));
        }
        return sb.toString();
    }

    private Long parseLong(String s) {
        if (s == null) return null;
        try {
            return Long.parseLong(s);
        } catch (Exception e) { return null; }
    }


    private Appointment sanitize(Appointment src) {
        if (src == null) return null;

        Appointment safe = new Appointment();
        safe.setId(src.getId());
        safe.setScheduledAt(src.getScheduledAt());
        safe.setDurationMinutes(src.getDurationMinutes());
        safe.setStatus(src.getStatus());
        safe.setMessage(src.getMessage());
        safe.setCancelledBy(src.getCancelledBy());
        safe.setCancelReason(src.getCancelReason());
        safe.setResolvedBy(src.getResolvedBy());
        safe.setResolvedAt(src.getResolvedAt());
        safe.setCreatedAt(src.getCreatedAt());
        safe.setUpdatedAt(src.getUpdatedAt());

        Doctor doc = src.getDoctor();
        if (doc != null) {
            Doctor safeDoctor = new Doctor();
            safeDoctor.setId(doc.getId());
            safeDoctor.setFullname(doc.getFullname());
            safeDoctor.setEmail(doc.getEmail());
            safeDoctor.setPhoneNumber(doc.getPhoneNumber());
            safeDoctor.setSpecialization(doc.getSpecialization());
            safeDoctor.setClinicName(doc.getClinicName());
            safeDoctor.setClinicAddress(doc.getClinicAddress());
            safeDoctor.setCity(doc.getCity());
            safeDoctor.setState(doc.getState());
            safeDoctor.setAbout(doc.getAbout());
            safeDoctor.setRegNumber(doc.getRegNumber());
            safeDoctor.setProfileImageUrl(doc.getProfileImageUrl());
            safeDoctor.setClinicOpenTime(doc.getClinicOpenTime());
            safeDoctor.setClinicCloseTime(doc.getClinicCloseTime());
            safeDoctor.setWorkingDays(doc.getWorkingDays());
            safeDoctor.setVerified(doc.getVerified());
            safeDoctor.setRole(doc.getRole());
            safe.setDoctor(safeDoctor);
        }

        User pat = src.getPatient();
        if (pat != null) {
            User safePatient = new User();
            safePatient.setId(pat.getId());
            safePatient.setUserName(pat.getUserName());
            safePatient.setEmail(pat.getEmail());
            safePatient.setCity(pat.getCity());
            safePatient.setState(pat.getState());
            safePatient.setVerified(pat.isVerified());
            safePatient.setRole(pat.getRole());
            safePatient.setCreatedAt(pat.getCreatedAt());
            safePatient.setUpdatedAt(pat.getUpdatedAt());
            safe.setPatient(safePatient);
        }

        return safe;
    }
}
