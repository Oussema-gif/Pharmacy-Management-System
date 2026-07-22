package com.pharmacy.controller;

import com.pharmacy.dto.BatchDto;
import com.pharmacy.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/batch-management")
public class BatchManagementController {

    @Autowired
    private InventoryService inventoryService;

    @PutMapping("/{id}")
    public ResponseEntity<BatchDto> updateBatch(@PathVariable Long id, @RequestBody BatchDto dto) {
        // The existing service method requires a username; pass "system" as the user identifier
        return ResponseEntity.ok(inventoryService.updateBatch(id, dto, "system"));
    }
}