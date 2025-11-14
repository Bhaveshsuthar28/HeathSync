package com.Heath.Backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Heath.Backend.Models.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor , Long>{
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);
    
    List<Doctor> findByRoleAndCityAndSpecialization(String role, String city, String specialization);

    Page<Doctor> findByCityIgnoreCaseAndVerifiedTrue(String city, Pageable pageable);

    Page<Doctor> findByStateIgnoreCaseAndVerifiedTrue(String state, Pageable pageable);

    Page<Doctor> findByCityIgnoreCaseAndStateIgnoreCaseAndSpecializationIgnoreCaseAndVerifiedTrue(String city,String state,String specialization,Pageable pageable);
}
