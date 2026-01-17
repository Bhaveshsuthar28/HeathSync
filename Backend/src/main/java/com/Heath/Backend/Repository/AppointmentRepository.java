package com.Heath.Backend.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Heath.Backend.Models.Appointment;

import jakarta.persistence.LockModeType;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment , Long> {

    @Query("select a from Appointment a where a.doctor.id = :doctorId and a.status = 'PENDING' and a.scheduledAt = :scheduledAt")
    List<Appointment> findConflictingForExactStart(@Param("doctorId") Long doctorId , @Param("scheduledAt") LocalDateTime scheduledAt);

    Page<Appointment> findByPatient_IdAndStatusAndScheduledAtAfterOrderByScheduledAtAsc(Long patientId, Appointment.Status status, LocalDateTime after, Pageable pageable);

    Page<Appointment> findByPatient_IdAndStatusInOrderByScheduledAtDesc(Long patientId, java.util.List<Appointment.Status> statuses, Pageable pageable);

    Page<Appointment> findByDoctor_IdAndStatusAndScheduledAtAfterOrderByScheduledAtAsc(Long doctorId, Appointment.Status status, LocalDateTime after, Pageable pageable);

    Page<Appointment> findByDoctor_IdAndStatusInOrderByScheduledAtDesc(Long doctorId, java.util.List<Appointment.Status> statuses, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Appointment a where a.id = :id")
    Appointment findByIdForUpdate(@Param("id") Long id);
}
