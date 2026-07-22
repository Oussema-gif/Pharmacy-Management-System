package com.pharmacy.controller;

import com.pharmacy.dto.SaleDto;
import com.pharmacy.dto.SaleRequestDto;
import com.pharmacy.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @PostMapping
    public ResponseEntity<SaleDto> createSale(@Valid @RequestBody SaleRequestDto request,
                                              Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(saleService.createSale(request, email));
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<SaleDto>> getSalesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(saleService.getSalesByBranch(branchId));
    }
}