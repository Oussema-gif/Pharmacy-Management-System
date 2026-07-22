package com.pharmacy.service;

import com.pharmacy.dto.*;
import com.pharmacy.model.*;
import com.pharmacy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private BatchRepository batchRepository;
    @Autowired
    private BranchRepository branchRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Transactional
    public SaleDto createSale(SaleRequestDto request, String cashierEmail) {
        User cashier = userRepository.findByEmail(cashierEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        Sale sale = new Sale();
        sale.setBranch(branch);
        sale.setUser(cashier);
        sale.setSaleDate(LocalDateTime.now());
        sale.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        sale.setPaymentMethod(request.getPaymentMethod());

        if (request.getPatientId() != null) {
            Patient patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            sale.setPatient(patient);
        }
        if (request.getPrescriptionId() != null) {
            Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                    .orElseThrow(() -> new RuntimeException("Prescription not found"));
            sale.setPrescription(prescription);
        }

        BigDecimal total = BigDecimal.ZERO;

        for (SaleItemRequest itemReq : request.getItems()) {
            Batch batch = batchRepository.findById(itemReq.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found"));

            if (batch.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for batch " + batch.getBatchNumber());
            }

            batch.setQuantity(batch.getQuantity() - itemReq.getQuantity());
            batchRepository.save(batch);

            BigDecimal lineTotal = batch.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setBatch(batch);
            saleItem.setQuantity(itemReq.getQuantity());
            saleItem.setUnitPrice(batch.getSellingPrice());
            sale.getItems().add(saleItem);
        }

        if (request.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            total = total.subtract(request.getDiscount());
        }

        sale.setTotalAmount(total);
        sale = saleRepository.save(sale);
        return toDto(sale);
    }

    public List<SaleDto> getSalesByBranch(Long branchId) {
        return saleRepository.findAll().stream()
                .filter(s -> s.getBranch().getId().equals(branchId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SaleDto toDto(Sale s) {
        SaleDto dto = new SaleDto();
        dto.setId(s.getId());
        dto.setBranchName(s.getBranch().getName());
        dto.setCashierName(s.getUser().getFullName());
        if (s.getPatient() != null) {
            dto.setPatientName(s.getPatient().getFullName());
        }
        if (s.getPrescription() != null) {
            dto.setDoctorName(s.getPrescription().getDoctorName());
        }
        dto.setSaleDate(s.getSaleDate());
        dto.setTotalAmount(s.getTotalAmount());
        dto.setDiscount(s.getDiscount());
        dto.setPaymentMethod(s.getPaymentMethod());
        dto.setItems(s.getItems().stream().map(i -> {
            SaleItemDto itemDto = new SaleItemDto();
            itemDto.setBatchId(i.getBatch().getId());
            itemDto.setMedicationName(i.getBatch().getMedication().getName());
            itemDto.setBatchNumber(i.getBatch().getBatchNumber());
            itemDto.setQuantity(i.getQuantity());
            itemDto.setUnitPrice(i.getUnitPrice());
            return itemDto;
        }).collect(Collectors.toList()));
        return dto;
    }
}