package com.pharmacy.controller;

import com.pharmacy.dto.MedicationDto;
import com.pharmacy.service.UserDetailsImpl;
import com.pharmacy.service.MedicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    @Autowired
    private MedicationService medicationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
    public ResponseEntity<List<MedicationDto>> getAll(
            @RequestParam(required = false) Long branchId,
            Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (branchId != null) {
            return ResponseEntity.ok(medicationService.getByBranch(branchId));
        }

        if (!isAdmin) {
            Long userBranchId = getCurrentBranchId(authentication);
            if (userBranchId != null) {
                return ResponseEntity.ok(medicationService.getByBranch(userBranchId));
            }
        }

        return ResponseEntity.ok(medicationService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
    public ResponseEntity<MedicationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicationService.getById(id));
    }

    @GetMapping("/barcode/{barcode}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
    public ResponseEntity<MedicationDto> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(medicationService.getByBarcode(barcode));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST')")
    public ResponseEntity<MedicationDto> create(@Valid @RequestBody MedicationDto dto) {
        return ResponseEntity.ok(medicationService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST')")
    public ResponseEntity<MedicationDto> update(@PathVariable Long id, @Valid @RequestBody MedicationDto dto) {
        return ResponseEntity.ok(medicationService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicationService.delete(id);
        return ResponseEntity.ok().build();
    }

    private Long getCurrentBranchId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userDetails.getBranch() != null ? userDetails.getBranch().getId() : null;
        }
        return null;
    }
}