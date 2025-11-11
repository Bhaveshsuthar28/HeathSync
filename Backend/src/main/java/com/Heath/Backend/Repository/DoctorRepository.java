package com.Heath.Backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Heath.Backend.Models.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor , Long>{
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);
    
    List<Doctor> findByRoleAndCityAndSpecialization(String role, String city, String specialization);
}
