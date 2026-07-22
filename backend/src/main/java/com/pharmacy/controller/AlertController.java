package com.pharmacy.controller;

import com.pharmacy.dto.AlertDto;
import com.pharmacy.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock/alerts")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','PHARMACIST','CASHIER')")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertDto>> getCurrentScopeAlerts(Authentication authentication) {
        return ResponseEntity.ok(
                alertService.getUnreadAlertsForCurrentScope(authentication.getName())
        );
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<AlertDto>> getByBranch(
            @PathVariable Long branchId,
            Authentication authentication
    ) {
        alertService.refreshAlertsForBranch(branchId, authentication.getName());

        return ResponseEntity.ok(
                alertService.getUnreadAlertsByBranch(branchId, authentication.getName())
        );
    }

    @PutMapping("/{alertId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long alertId,
            Authentication authentication
    ) {
        alertService.markAsRead(alertId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}