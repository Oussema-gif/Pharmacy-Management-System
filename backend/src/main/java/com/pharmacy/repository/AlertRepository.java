package com.pharmacy.repository;

import com.pharmacy.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByIsReadFalse();

    List<Alert> findByBranchIdAndIsReadFalse(Long branchId);

    List<Alert> findByIsReadFalseOrderByCreatedAtDesc();

    List<Alert> findByBranchIdAndIsReadFalseOrderByCreatedAtDesc(Long branchId);
}