package com.pharmacy.scheduler;

import com.pharmacy.model.Alert;
import com.pharmacy.model.Batch;
import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import com.pharmacy.repository.AlertRepository;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.UserRepository;
import com.pharmacy.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class AlertScheduler {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "0 0 8 * * *")   // runs every day at 8 AM
    @Transactional
    public void checkInventoryAlerts() {
        LocalDate today = LocalDate.now();
        LocalDate upcomingExpiry = today.plusDays(30);

        for (Batch batch : batchRepository.findAll()) {
            if (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(upcomingExpiry)) {
                String message = "Batch " + batch.getBatchNumber() + " of " +
                        batch.getMedication().getName() + " expires on " + batch.getExpiryDate();
                createAlertAndNotify(batch, "EXPIRY", message);
            }

            if (batch.getQuantity() != null && batch.getQuantity() <= 10) {
                String message = "Low stock: " + batch.getMedication().getName() +
                        " (Batch " + batch.getBatchNumber() + ") only " + batch.getQuantity() + " left";
                createAlertAndNotify(batch, "LOW_STOCK", message);
            }
        }
    }

    private void createAlertAndNotify(Batch batch, String type, String message) {
        // Avoid duplicate alerts
        boolean alreadyExists = alertRepository.findByBranchIdAndIsReadFalse(batch.getBranch().getId())
                .stream().anyMatch(a -> a.getMessage().equals(message));
        if (!alreadyExists) {
            Alert alert = new Alert();
            alert.setBranch(batch.getBranch());
            alert.setType(type);
            alert.setMessage(message);
            alert.setRead(false);
            alert.setCreatedAt(LocalDateTime.now());
            alertRepository.save(alert);

            // Send email to all admins and managers
            List<User> recipients = userRepository.findByRoleIn(
                    List.of(Role.ADMIN, Role.MANAGER)
            );
            for (User user : recipients) {
                if (user.getEmail() != null && !user.getEmail().isBlank()) {
                    emailService.sendAlert(
                            user.getEmail(),
                            "Pharmacy Alert: " + type,
                            message
                    );
                }
            }
        }
    }
}