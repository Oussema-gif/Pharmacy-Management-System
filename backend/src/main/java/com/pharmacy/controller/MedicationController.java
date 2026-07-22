package com.pharmacy.controller;

import com.pharmacy.dto.MedicationDto;
import com.pharmacy.service.MedicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
public class MedicationController {

    @Autowired
    private MedicationService medicationService;

    @GetMapping
    public ResponseEntity<List<MedicationDto>> getAll() {
        return ResponseEntity.ok(medicationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medicationService.getById(id));
    }

    @GetMapping("/barcode/{barcode}")
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
}