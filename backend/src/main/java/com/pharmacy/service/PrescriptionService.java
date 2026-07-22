package com.pharmacy.service;

import com.pharmacy.dto.PrescriptionDto;
import com.pharmacy.dto.PrescriptionItemDto;
import com.pharmacy.model.Branch;
import com.pharmacy.model.Medication;
import com.pharmacy.model.Patient;
import com.pharmacy.model.Prescription;
import com.pharmacy.model.PrescriptionItem;
import com.pharmacy.repository.MedicationRepository;
import com.pharmacy.repository.PatientRepository;
import com.pharmacy.repository.PrescriptionRepository;
import com.pharmacy.security.BranchAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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

        Long patientBranchId = patient.getBranch().getId();
        Long accessibleBranchId = branchAccessService.resolveAccessibleBranchId(
                currentUserEmail,
                patientBranchId
        );

        if (!patientBranchId.equals(accessibleBranchId)) {
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
        boolean admin = branchAccessService.isAdmin(currentUserEmail);

        if (admin) {
            return prescriptionRepository.findAll().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        Long branchId = branchAccessService.getCurrentUserBranch(currentUserEmail).getId();

        return prescriptionRepository.findByBranchIdOrderByDateDescIdDesc(branchId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void delete(Long id, String currentUserEmail) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        Long accessibleBranchId = branchAccessService.resolveAccessibleBranchId(
                currentUserEmail,
                prescription.getBranch().getId()
        );

        if (!prescription.getBranch().getId().equals(accessibleBranchId)) {
            throw new RuntimeException("You are not allowed to delete this prescription");
        }

        try {
            prescriptionRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Prescription is in use and cannot be deleted.");
        }
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