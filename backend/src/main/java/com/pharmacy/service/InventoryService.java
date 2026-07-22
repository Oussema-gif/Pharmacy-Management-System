package com.pharmacy.service;

import com.pharmacy.dto.BatchDto;
import com.pharmacy.dto.PurchaseDto;
import com.pharmacy.dto.PurchaseItemDto;
import com.pharmacy.dto.PurchaseItemRequest;
import com.pharmacy.dto.PurchaseRequestDto;
import com.pharmacy.model.Batch;
import com.pharmacy.model.Branch;
import com.pharmacy.model.Medication;
import com.pharmacy.model.Purchase;
import com.pharmacy.model.PurchaseItem;
import com.pharmacy.model.Supplier;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.MedicationRepository;
import com.pharmacy.repository.PurchaseRepository;
import com.pharmacy.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional
    public PurchaseDto createPurchase(PurchaseRequestDto request, String currentUserEmail) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Purchase must contain at least one item");
        }

        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setBranch(branch);
        purchase.setPurchaseDate(LocalDateTime.now());
        purchase.setItems(new ArrayList<>());
        purchase.setTotalAmount(BigDecimal.ZERO);

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseItemRequest itemReq : request.getItems()) {
            Medication med = medicationRepository.findById(itemReq.getMedicationId())
                    .orElseThrow(() -> new RuntimeException("Medication not found"));

            Batch batch = new Batch();
            batch.setMedication(med);
            batch.setBranch(branch);
            batch.setSupplier(supplier);
            batch.setBatchNumber(itemReq.getBatchNumber());
            batch.setQuantity(itemReq.getQuantity());
            batch.setExpiryDate(itemReq.getExpiryDate());
            batch.setPurchasePrice(itemReq.getPurchasePrice());
            batch.setSellingPrice(itemReq.getSellingPrice());
            batch = batchRepository.save(batch);

            BigDecimal lineTotal = itemReq.getPurchasePrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            PurchaseItem item = new PurchaseItem();
            item.setPurchase(purchase);
            item.setBatch(batch);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getPurchasePrice());
            purchase.getItems().add(item);
        }

        purchase.setTotalAmount(total);
        purchase = purchaseRepository.save(purchase);

        return toDto(purchase);
    }

    @Transactional(readOnly = true)
    public List<BatchDto> getStockByBranch(Long branchId, String currentUserEmail) {
        return batchRepository.findByBranchId(branchId).stream()
                .map(this::toBatchDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PurchaseDto> getPurchasesByBranch(Long branchId, String currentUserEmail) {
        return purchaseRepository.findByBranchId(branchId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BatchDto> getBatchesByMedicationAndBranch(
            Long medicationId,
            Long branchId,
            String currentUserEmail
    ) {
        medicationRepository.findById(medicationId)
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        return batchRepository
                .findByMedicationIdAndBranchIdOrderByExpiryDateAsc(medicationId, branchId)
                .stream()
                .map(this::toBatchDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public BatchDto updateBatch(Long batchId, BatchDto dto, String currentUserEmail) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        batch.setQuantity(dto.getQuantity());
        batch.setExpiryDate(dto.getExpiryDate());
        batch.setPurchasePrice(dto.getPurchasePrice());
        batch.setSellingPrice(dto.getSellingPrice());

        batch = batchRepository.save(batch);
        return toBatchDto(batch);
    }

    private PurchaseDto toDto(Purchase p) {
        PurchaseDto dto = new PurchaseDto();
        dto.setId(p.getId());
        dto.setSupplierName(p.getSupplier().getName());
        dto.setBranchName(p.getBranch().getName());
        dto.setPurchaseDate(p.getPurchaseDate());
        dto.setTotalAmount(p.getTotalAmount());

        List<PurchaseItemDto> items = p.getItems().stream().map(i -> {
            PurchaseItemDto itemDto = new PurchaseItemDto();
            itemDto.setBatchId(i.getBatch().getId());
            itemDto.setMedicationName(i.getBatch().getMedication().getName());
            itemDto.setBatchNumber(i.getBatch().getBatchNumber());
            itemDto.setQuantity(i.getQuantity());
            itemDto.setUnitPrice(i.getUnitPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(items);
        return dto;
    }

    private BatchDto toBatchDto(Batch b) {
        BatchDto dto = new BatchDto();
        dto.setId(b.getId());
        dto.setMedicationId(b.getMedication().getId());
        dto.setMedicationName(b.getMedication().getName());
        dto.setBranchId(b.getBranch().getId());
        dto.setBranchName(b.getBranch().getName());

        if (b.getSupplier() != null) {
            dto.setSupplierId(b.getSupplier().getId());
            dto.setSupplierName(b.getSupplier().getName());
        }

        dto.setBatchNumber(b.getBatchNumber());
        dto.setQuantity(b.getQuantity());
        dto.setExpiryDate(b.getExpiryDate());
        dto.setPurchasePrice(b.getPurchasePrice());
        dto.setSellingPrice(b.getSellingPrice());
        return dto;
    }
}