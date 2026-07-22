package com.pharmacy.controller;

import com.pharmacy.dto.PrescriptionDto;
import com.pharmacy.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<PrescriptionDto> create(
            @Valid @RequestBody PrescriptionDto dto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(prescriptionService.create(dto, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST')")
    public ResponseEntity<List<PrescriptionDto>> getAll(Authentication authentication) {
        return ResponseEntity.ok(prescriptionService.getAll(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        prescriptionService.delete(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}