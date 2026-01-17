package com.Heath.Backend.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Heath.Backend.Models.DoctorCloseddate;

@Repository
public interface DoctorCloseDateRepository extends JpaRepository<DoctorCloseddate , Long>{
    boolean existsByDoctorIdAndClosedDate(Long doctorId, LocalDate date);
    List<DoctorCloseddate> findByDoctorIdAndClosedDateBetween(Long doctorId, LocalDate start, LocalDate end);
}
