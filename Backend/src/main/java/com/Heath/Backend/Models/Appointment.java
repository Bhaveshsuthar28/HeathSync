package com.Heath.Backend.Models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "appointments")
@Getter
@Setter
public class Appointment {

    public enum Status {
        PENDING, CANCELLED, RESOLVED, OTP_LOCKED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id" , referencedColumnName = "id")
    @JsonIgnoreProperties({"appointments"})
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id" , referencedColumnName = "id")
    @JsonIgnoreProperties({"appointments"})
    private User patient;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String otpHash;

    private LocalDateTime otpExpiry;

    private Integer otpAttempts = 0;

    private Integer maxOtpAttempts = 10;

    private String cancelledBy;

    @Column(columnDefinition = "TEXT")
    private String cancelReason;

    private Long resolvedBy;
    private LocalDateTime resolvedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
