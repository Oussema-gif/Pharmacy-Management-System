package com.pharmacy.service;

import com.pharmacy.dto.MedicationDto;
import com.pharmacy.model.Batch;
import com.pharmacy.model.Branch;
import com.pharmacy.model.Medication;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.MedicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicationService {

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BatchRepository batchRepository;

    public List<MedicationDto> getAll() {
        return medicationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /** Returns distinct medications that have stock in the given branch */
    public List<MedicationDto> getByBranch(Long branchId) {
        return batchRepository.findByBranchId(branchId).stream()
                .filter(b -> b.getQuantity() > 0)
                .map(Batch::getMedication)
                .distinct()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public MedicationDto getById(Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));
        return toDto(medication);
    }

    public MedicationDto getByBarcode(String barcode) {
        Medication medication = medicationRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Medication not found"));
        return toDto(medication);
    }

    public MedicationDto create(MedicationDto dto) {
        Medication medication = new Medication();
        medication.setName(dto.getName());
        medication.setGenericName(dto.getGenericName());
        medication.setCategory(dto.getCategory());
        medication.setUnit(dto.getUnit());
        medication.setBarcode(dto.getBarcode());

        Branch branch = branchRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Default branch not found"));
        medication.setBranch(branch);

        medication = medicationRepository.save(medication);
        return toDto(medication);
    }

    public MedicationDto update(Long id, MedicationDto dto) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));

        medication.setName(dto.getName());
        medication.setGenericName(dto.getGenericName());
        medication.setCategory(dto.getCategory());
        medication.setUnit(dto.getUnit());
        medication.setBarcode(dto.getBarcode());

        if (dto.getBranchId() != null) {
            Branch branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
            medication.setBranch(branch);
        }

        medication = medicationRepository.save(medication);
        return toDto(medication);
    }

    public void delete(Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medication not found"));
        medicationRepository.delete(medication);
    }

    private MedicationDto toDto(Medication medication) {
        MedicationDto dto = new MedicationDto();
        dto.setId(medication.getId());
        dto.setName(medication.getName());
        dto.setGenericName(medication.getGenericName());
        dto.setCategory(medication.getCategory());
        dto.setUnit(medication.getUnit());
        dto.setBarcode(medication.getBarcode());

        if (medication.getBranch() != null) {
            dto.setBranchId(medication.getBranch().getId());
            dto.setBranchName(medication.getBranch().getName());
        }

        return dto;
    }
}