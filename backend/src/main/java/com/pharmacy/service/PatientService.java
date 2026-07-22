package com.pharmacy.service;

import com.pharmacy.dto.PatientDto;
import com.pharmacy.model.Branch;
import com.pharmacy.model.Patient;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BranchRepository branchRepository;

    public List<PatientDto> getAll() {
        return patientRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PatientDto getById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return toDto(patient);
    }

    public PatientDto create(PatientDto dto) {
        Patient patient = new Patient();
        patient.setFullName(dto.getFullName());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());

        Branch branch = branchRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Default branch not found"));
        patient.setBranch(branch);

        patient = patientRepository.save(patient);
        return toDto(patient);
    }

    public PatientDto update(Long id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setFullName(dto.getFullName());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());

        if (dto.getBranchId() != null) {
            Branch branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
            patient.setBranch(branch);
        }

        patient = patientRepository.save(patient);
        return toDto(patient);
    }

    public void delete(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.delete(patient);
    }

    private PatientDto toDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
        dto.setFullName(patient.getFullName());
        dto.setPhone(patient.getPhone());
        dto.setEmail(patient.getEmail());
        dto.setAddress(patient.getAddress());

        if (patient.getBranch() != null) {
            dto.setBranchId(patient.getBranch().getId());
            dto.setBranchName(patient.getBranch().getName());
        }

        return dto;
    }
}