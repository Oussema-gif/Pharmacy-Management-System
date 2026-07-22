package com.pharmacy.controller;

import com.pharmacy.dto.PatientDto;
import com.pharmacy.service.UserDetailsImpl;
import com.pharmacy.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAll(
            @RequestParam(required = false) Long branchId,
            Authentication authentication) {

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (branchId != null) {
            return ResponseEntity.ok(patientService.getByBranch(branchId));
        }

        if (!isAdmin) {
            Long userBranchId = getCurrentBranchId(authentication);
            if (userBranchId != null) {
                return ResponseEntity.ok(patientService.getByBranch(userBranchId));
            }
        }

        return ResponseEntity.ok(patientService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PatientDto> create(
            @Valid @RequestBody PatientDto dto,
            Authentication authentication) {

        // Non‑admin: auto‑assign their own branch if none is given
        if (dto.getBranchId() == null) {
            Long userBranchId = getCurrentBranchId(authentication);
            dto.setBranchId(userBranchId);
        }

        return ResponseEntity.ok(patientService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> update(@PathVariable Long id, @Valid @RequestBody PatientDto dto) {
        return ResponseEntity.ok(patientService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.ok().build();
    }

    private Long getCurrentBranchId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userDetails.getBranch() != null ? userDetails.getBranch().getId() : null;
        }
        return null;
    }
}