package com.pharmacy.controller;

import com.pharmacy.dto.BatchDto;
import com.pharmacy.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
public class StockController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<BatchDto>> getStockByBranch(
            @PathVariable Long branchId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                inventoryService.getStockByBranch(branchId, authentication.getName())
        );
    }

    @GetMapping("/branch/{branchId}/medication/{medicationId}")
    public ResponseEntity<List<BatchDto>> getBatchesByMedication(
            @PathVariable Long branchId,
            @PathVariable Long medicationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                inventoryService.getBatchesByMedicationAndBranch(
                        medicationId,
                        branchId,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/batch/{id}")
    public ResponseEntity<BatchDto> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchDto dto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                inventoryService.updateBatch(id, dto, authentication.getName())
        );
    }

    @GetMapping("/test-auth")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<String> testAuth() {
        return ResponseEntity.ok("Stock auth works");
    }
}