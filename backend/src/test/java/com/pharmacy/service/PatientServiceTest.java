package com.pharmacy.service;

import com.pharmacy.dto.PatientDto;
import com.pharmacy.model.Patient;
import com.pharmacy.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private Patient patient;
    private PatientDto patientDto;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setId(1L);
        patient.setFullName("John Doe");
        patient.setPhone("123456789");
        patient.setAddress("Main Street");

        patientDto = new PatientDto();
        patientDto.setId(1L);
        patientDto.setFullName("John Doe");
        patientDto.setPhone("123456789");
        patientDto.setAddress("Main Street");
    }

    @Test
    void getAll_shouldReturnPatients() {
        when(patientRepository.findAll()).thenReturn(List.of(patient));

        List<PatientDto> result = patientService.getAll();

        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getFullName());
        verify(patientRepository).findAll();
    }

    @Test
    void getById_shouldReturnPatient_whenFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        PatientDto result = patientService.getById(1L);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        verify(patientRepository).findById(1L);
    }

    @Test
    void create_shouldSavePatient() {
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        PatientDto result = patientService.create(patientDto);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void update_shouldModifyPatient_whenFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        PatientDto result = patientService.update(1L, patientDto);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        verify(patientRepository).findById(1L);
        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void delete_shouldRemovePatient_whenFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        patientService.delete(1L);

        verify(patientRepository).findById(1L);
        verify(patientRepository).delete(patient);
    }

    @Test
    void delete_shouldThrow_whenNotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> patientService.delete(99L));
        assertEquals("Patient not found", ex.getMessage());
    }
}