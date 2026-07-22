package com.pharmacy.controller;

import com.pharmacy.dto.BatchDto;
import com.pharmacy.dto.PurchaseDto;
import com.pharmacy.dto.PurchaseRequestDto;
import com.pharmacy.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class PurchaseController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<PurchaseDto> createPurchase(
            @Valid @RequestBody PurchaseRequestDto request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                inventoryService.createPurchase(request, authentication.getName())
        );
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<PurchaseDto>> getPurchasesByBranch(
            @PathVariable Long branchId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                inventoryService.getPurchasesByBranch(branchId, authentication.getName())
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
}