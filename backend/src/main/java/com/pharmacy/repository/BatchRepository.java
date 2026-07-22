package com.pharmacy.repository;

import com.pharmacy.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByBranchId(Long branchId);
    List<Batch> findByMedicationIdAndBranchIdOrderByExpiryDateAsc(Long medicationId, Long branchId);
}