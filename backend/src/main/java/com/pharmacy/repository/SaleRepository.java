package com.pharmacy.repository;

import com.pharmacy.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByBranchIdOrderBySaleDateDescIdDesc(Long branchId);
}