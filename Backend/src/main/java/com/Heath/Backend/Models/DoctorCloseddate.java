package com.Heath.Backend.Models;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor_closed_dates",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"doctor_id", "closed_date"})})
@Getter
@Setter
public class DoctorCloseddate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "closed_date", nullable = false)
    private LocalDate closedDate;

    private String reason;
}
