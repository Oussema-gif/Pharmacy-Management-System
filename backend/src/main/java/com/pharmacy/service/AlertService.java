package com.pharmacy.service;

import com.pharmacy.dto.AlertDto;
import com.pharmacy.model.Alert;
import com.pharmacy.model.Batch;
import com.pharmacy.repository.AlertRepository;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.security.BranchAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private BranchAccessService branchAccessService;

    @Transactional
    public void refreshAlertsForBranch(Long requestedBranchId, String currentUserEmail) {
        Long branchId = branchAccessService.resolveAccessibleBranchId(currentUserEmail, requestedBranchId);

        List<Batch> batches = batchRepository.findByBranchId(branchId);
        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(30);

        List<Alert> existingUnread = alertRepository.findByBranchIdAndIsReadFalseOrderByCreatedAtDesc(branchId);

        for (Batch batch : batches) {
            if (batch.getQuantity() != null && batch.getQuantity() <= 10) {
                String message = "Low stock: " + batch.getMedication().getName()
                        + " (" + batch.getBatchNumber() + ") – " + batch.getQuantity() + " left";

                boolean alreadyExists = existingUnread.stream()
                        .anyMatch(alert ->
                                "LOW_STOCK".equals(alert.getType())
                                        && message.equals(alert.getMessage())
                        );

                if (!alreadyExists) {
                    Alert alert = new Alert();
                    alert.setBranch(batch.getBranch());
                    alert.setType("LOW_STOCK");
                    alert.setMessage(message);
                    alert.setRead(false);
                    alert.setCreatedAt(LocalDateTime.now());
                    alert = alertRepository.save(alert);
                    existingUnread.add(alert);
                }
            }

            if (batch.getExpiryDate() != null && !batch.getExpiryDate().isAfter(threshold)) {
                String message = "Expiring: " + batch.getMedication().getName()
                        + " (" + batch.getBatchNumber() + ") – " + batch.getExpiryDate();

                boolean alreadyExists = existingUnread.stream()
                        .anyMatch(alert ->
                                "EXPIRY".equals(alert.getType())
                                        && message.equals(alert.getMessage())
                        );

                if (!alreadyExists) {
                    Alert alert = new Alert();
                    alert.setBranch(batch.getBranch());
                    alert.setType("EXPIRY");
                    alert.setMessage(message);
                    alert.setRead(false);
                    alert.setCreatedAt(LocalDateTime.now());
                    alert = alertRepository.save(alert);
                    existingUnread.add(alert);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getUnreadAlertsByBranch(Long requestedBranchId, String currentUserEmail) {
        Long branchId = branchAccessService.resolveAccessibleBranchId(currentUserEmail, requestedBranchId);

        return alertRepository.findByBranchIdAndIsReadFalseOrderByCreatedAtDesc(branchId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getUnreadAlertsForCurrentScope(String currentUserEmail) {
        boolean admin = branchAccessService.isAdmin(currentUserEmail);

        if (admin) {
            return alertRepository.findByIsReadFalseOrderByCreatedAtDesc()
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        Long branchId = branchAccessService.getCurrentUserBranch(currentUserEmail).getId();

        return alertRepository.findByBranchIdAndIsReadFalseOrderByCreatedAtDesc(branchId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long alertId, String currentUserEmail) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        Long accessibleBranchId = branchAccessService.resolveAccessibleBranchId(
                currentUserEmail,
                alert.getBranch().getId()
        );

        if (!alert.getBranch().getId().equals(accessibleBranchId)) {
            throw new RuntimeException("You are not allowed to update this alert");
        }

        alert.setRead(true);
        alertRepository.save(alert);
    }

    private AlertDto toDto(Alert alert) {
        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setBranchId(alert.getBranch() != null ? alert.getBranch().getId() : null);
        dto.setBranchName(alert.getBranch() != null ? alert.getBranch().getName() : null);
        dto.setType(alert.getType());
        dto.setMessage(alert.getMessage());
        dto.setRead(alert.isRead());
        dto.setCreatedAt(alert.getCreatedAt());
        return dto;
    }
}