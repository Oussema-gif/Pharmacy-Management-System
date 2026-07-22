package com.pharmacy.service;

import com.pharmacy.dto.PrescriptionDto;
import com.pharmacy.dto.PrescriptionItemDto;
import com.pharmacy.model.*;
import com.pharmacy.repository.*;
import com.pharmacy.security.BranchAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private BranchAccessService branchAccessService;

    public PrescriptionDto create(PrescriptionDto dto, String currentUserEmail) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Long accessibleBranchId = branchAccessService.resolveAccessibleBranchId(
                currentUserEmail,
                patient.getBranch() != null ? patient.getBranch().getId() : null
        );

        if (!patient.getBranch().getId().equals(accessibleBranchId)) {
            throw new RuntimeException("You are not allowed to create a prescription for this patient");
        }

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setBranch(patient.getBranch());
        prescription.setDoctorName(dto.getDoctorName());
        prescription.setDate(dto.getDate());
        prescription.setNotes(dto.getNotes());

        final Prescription finalPrescription = prescription;
        List<PrescriptionItem> items = dto.getItems().stream().map(itemDto -> {
            Medication med = medicationRepository.findById(itemDto.getMedicationId())
                    .orElseThrow(() -> new RuntimeException("Medication not found"));
            PrescriptionItem item = new PrescriptionItem();
            item.setPrescription(finalPrescription);
            item.setMedication(med);
            item.setDosage(itemDto.getDosage());
            item.setDuration(itemDto.getDuration());
            return item;
        }).collect(Collectors.toList());

        prescription.setItems(items);
        prescription = prescriptionRepository.save(prescription);
        return toDto(prescription);
    }

    public List<PrescriptionDto> getAll(String currentUserEmail) {
        if (branchAccessService.isAdmin(currentUserEmail)) {
            return prescriptionRepository.findAll().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        Branch userBranch = branchAccessService.getCurrentUserBranch(currentUserEmail);
        if (userBranch == null) {
            throw new RuntimeException("You are not assigned to any branch");
        }

        return prescriptionRepository.findByBranchIdOrderByDateDescIdDesc(userBranch.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void delete(Long id, String currentUserEmail) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        Long accessibleBranchId = branchAccessService.resolveAccessibleBranchId(
                currentUserEmail,
                prescription.getBranch() != null ? prescription.getBranch().getId() : null
        );

        if (!prescription.getBranch().getId().equals(accessibleBranchId)) {
            throw new RuntimeException("You are not allowed to delete this prescription");
        }

        prescriptionRepository.delete(prescription);
    }

    private PrescriptionDto toDto(Prescription p) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(p.getId());
        dto.setPatientId(p.getPatient().getId());
        dto.setPatientName(p.getPatient().getFullName());
        dto.setDoctorName(p.getDoctorName());
        dto.setDate(p.getDate());
        dto.setNotes(p.getNotes());

        dto.setItems(p.getItems().stream().map(i -> {
            PrescriptionItemDto itemDto = new PrescriptionItemDto();
            itemDto.setMedicationId(i.getMedication().getId());
            itemDto.setMedicationName(i.getMedication().getName());
            itemDto.setDosage(i.getDosage());
            itemDto.setDuration(i.getDuration());
            return itemDto;
        }).collect(Collectors.toList()));

        return dto;
    }
}