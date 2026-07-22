package com.pharmacy.controller;

import com.pharmacy.model.Batch;
import com.pharmacy.model.Sale;
import com.pharmacy.model.SaleItem;
import com.pharmacy.model.User;
import com.pharmacy.repository.AlertRepository;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.SaleRepository;
import com.pharmacy.repository.UserRepository;
import com.pharmacy.security.BranchAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private BranchAccessService branchAccessService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        String currentUserEmail = authentication.getName();
        User currentUser = branchAccessService.getCurrentUser(currentUserEmail);
        boolean admin = branchAccessService.isAdmin(currentUserEmail);
        Long currentBranchId = currentUser.getBranch() != null ? currentUser.getBranch().getId() : null;

        Map<String, Object> stats = new HashMap<>();

        long totalBranches = admin ? branchRepository.count() : (currentBranchId != null ? 1 : 0);
        long totalUsers = admin
                ? userRepository.count()
                : userRepository.findAll().stream()
                        .filter(user -> user.getBranch() != null && user.getBranch().getId().equals(currentBranchId))
                        .count();

        List<Sale> visibleSales = saleRepository.findAll().stream()
                .filter(sale -> admin || belongsToBranch(sale, currentBranchId))
                .toList();

        List<Batch> visibleBatches = batchRepository.findAll().stream()
                .filter(batch -> admin || belongsToBranch(batch, currentBranchId))
                .toList();

        long lowStock = visibleBatches.stream()
                .filter(batch -> batch.getQuantity() != null && batch.getQuantity() < 10)
                .count();

        long alerts = admin
                ? alertRepository.findByIsReadFalse().size()
                : alertRepository.findByIsReadFalse().stream()
                        .filter(alert -> alert.getBranch() != null
                                && currentBranchId != null
                                && alert.getBranch().getId().equals(currentBranchId))
                        .count();

        stats.put("totalBranches", totalBranches);
        stats.put("totalUsers", totalUsers);
        stats.put("totalSales", visibleSales.size());
        stats.put("lowStockItems", lowStock);
        stats.put("activeAlerts", alerts);

        List<Map<String, Object>> recentSales = new ArrayList<>();

        visibleSales.stream()
                .sorted(Comparator.comparing(Sale::getSaleDate).reversed())
                .limit(5)
                .forEach(sale -> {
                    Map<String, Object> saleMap = new HashMap<>();
                    saleMap.put("id", sale.getId());
                    saleMap.put("saleDate", sale.getSaleDate().toString());
                    saleMap.put(
                            "patientName",
                            sale.getPatient() != null
                                    ? sale.getPatient().getFullName()
                                    : "Walk-in customer"
                    );
                    saleMap.put("totalAmount", sale.getTotalAmount());
                    saleMap.put("branchName", sale.getBranch() != null ? sale.getBranch().getName() : null);

                    recentSales.add(saleMap);
                });

        stats.put("recentSales", recentSales);

        List<Map<String, String>> alertList = new ArrayList<>();

        alertRepository.findByIsReadFalse().stream()
                .filter(alert -> admin || (
                        alert.getBranch() != null
                                && currentBranchId != null
                                && alert.getBranch().getId().equals(currentBranchId)
                ))
                .limit(5)
                .forEach(alert -> {
                    Map<String, String> alertMap = new HashMap<>();
                    alertMap.put("type", alert.getType());
                    alertMap.put("message", alert.getMessage());
                    alertList.add(alertMap);
                });

        stats.put("alerts", alertList);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication
    ) {
        int selectedDays = normalizeDays(days);
        LocalDate startDate = LocalDate.now().minusDays(selectedDays - 1);

        String currentUserEmail = authentication.getName();
        User currentUser = branchAccessService.getCurrentUser(currentUserEmail);
        boolean admin = branchAccessService.isAdmin(currentUserEmail);
        Long currentBranchId = currentUser.getBranch() != null ? currentUser.getBranch().getId() : null;

        Map<LocalDate, BigDecimal> revenueByDate = new LinkedHashMap<>();
        Map<LocalDate, Long> transactionsByDate = new LinkedHashMap<>();
        Map<String, MedicationTotals> totalsByMedication = new HashMap<>();

        for (int index = 0; index < selectedDays; index++) {
            LocalDate date = startDate.plusDays(index);
            revenueByDate.put(date, BigDecimal.ZERO);
            transactionsByDate.put(date, 0L);
        }

        List<Sale> sales = saleRepository.findAll().stream()
                .filter(sale -> admin || belongsToBranch(sale, currentBranchId))
                .toList();

        for (Sale sale : sales) {
            if (sale.getSaleDate() == null) {
                continue;
            }

            LocalDate saleDate = sale.getSaleDate().toLocalDate();

            if (saleDate.isBefore(startDate) || saleDate.isAfter(LocalDate.now())) {
                continue;
            }

            BigDecimal saleTotal = sale.getTotalAmount() != null
                    ? sale.getTotalAmount()
                    : BigDecimal.ZERO;

            revenueByDate.merge(saleDate, saleTotal, BigDecimal::add);
            transactionsByDate.merge(saleDate, 1L, Long::sum);

            if (sale.getItems() == null) {
                continue;
            }

            for (SaleItem item : sale.getItems()) {
                if (item.getBatch() == null
                        || item.getBatch().getMedication() == null
                        || item.getBatch().getMedication().getName() == null) {
                    continue;
                }

                String medicationName = item.getBatch().getMedication().getName();
                int quantity = item.getQuantity() != null ? item.getQuantity() : 0;

                BigDecimal unitPrice = item.getUnitPrice() != null
                        ? item.getUnitPrice()
                        : BigDecimal.ZERO;

                BigDecimal itemRevenue = unitPrice.multiply(BigDecimal.valueOf(quantity));

                MedicationTotals totals = totalsByMedication.computeIfAbsent(
                        medicationName,
                        ignored -> new MedicationTotals()
                );

                totals.quantitySold += quantity;
                totals.revenue = totals.revenue.add(itemRevenue);
            }
        }

        List<Map<String, Object>> salesTrend = new ArrayList<>();

        revenueByDate.forEach((date, revenue) -> {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", date.toString());
            point.put("revenue", revenue);
            point.put("transactions", transactionsByDate.get(date));
            salesTrend.add(point);
        });

        List<Map<String, Object>> topMedications = totalsByMedication.entrySet()
                .stream()
                .sorted((first, second) -> second.getValue().revenue.compareTo(first.getValue().revenue))
                .limit(8)
                .map(entry -> {
                    Map<String, Object> medication = new LinkedHashMap<>();
                    medication.put("medicationName", entry.getKey());
                    medication.put("quantitySold", entry.getValue().quantitySold);
                    medication.put("revenue", entry.getValue().revenue);
                    return medication;
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("days", selectedDays);
        response.put("salesTrend", salesTrend);
        response.put("topMedications", topMedications);
        response.put("scope", admin ? "ALL_BRANCHES" : "MY_BRANCH");
        response.put("branchName", currentUser.getBranch() != null ? currentUser.getBranch().getName() : null);

        return ResponseEntity.ok(response);
    }

    private int normalizeDays(int days) {
        if (days == 7 || days == 30 || days == 90) {
            return days;
        }

        return 30;
    }

    private boolean belongsToBranch(Sale sale, Long branchId) {
        return sale.getBranch() != null
                && branchId != null
                && sale.getBranch().getId().equals(branchId);
    }

    private boolean belongsToBranch(Batch batch, Long branchId) {
        return batch.getBranch() != null
                && branchId != null
                && batch.getBranch().getId().equals(branchId);
    }

    private static class MedicationTotals {
        private int quantitySold = 0;
        private BigDecimal revenue = BigDecimal.ZERO;
    }
}