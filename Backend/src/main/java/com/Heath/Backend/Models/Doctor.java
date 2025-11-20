package com.Heath.Backend.Models;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Doctor")
@Getter
@Setter
@JsonIgnoreProperties({"appointments"})
public class Doctor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullname;

    @Column(unique = true , nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private Boolean verified = false;

    @Enumerated(EnumType.STRING)
    private Role role = Role.DOCTOR;

    private String otpCode;
    private LocalDateTime otpExpiry;
    private boolean otpUsed = false;
    
    private String phoneNumber;

    private String specialization;

    private String clinicName;

    private String clinicAddress;

    private String city;       

    private String state;

    private String about;

    private String RegNumber;

    private String profileImageUrl;

    private LocalTime clinicOpenTime;

    private LocalTime clinicCloseTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "doctor_working_days", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "day_of_week")
    private Set<String> workingDays;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
