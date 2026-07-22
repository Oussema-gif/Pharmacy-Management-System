package com.pharmacy.repository;

import com.pharmacy.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByBranchIdOrderByFullNameAsc(Long branchId);
    List<Patient> findByBranchId(Long branchId);
}