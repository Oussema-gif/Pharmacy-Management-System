package com.pharmacy.service;

import com.pharmacy.dto.MedicationDto;
import com.pharmacy.model.Medication;
import com.pharmacy.repository.MedicationRepository;
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
class MedicationServiceTest {

    @Mock
    private MedicationRepository medicationRepository;

    @InjectMocks
    private MedicationService medicationService;

    private Medication medication;
    private MedicationDto medicationDto;

    @BeforeEach
    void setUp() {
        medication = new Medication();
        medication.setId(1L);
        medication.setName("Paracetamol");
        medication.setGenericName("Acetaminophen");
        medication.setCategory("Pain Relief");
        medication.setUnit("Tablet");
        medication.setBarcode("123456789");

        medicationDto = new MedicationDto();
        medicationDto.setId(1L);
        medicationDto.setName("Paracetamol");
        medicationDto.setGenericName("Acetaminophen");
        medicationDto.setCategory("Pain Relief");
        medicationDto.setUnit("Tablet");
        medicationDto.setBarcode("123456789");
    }

    @Test
    void getAll_shouldReturnAllMedications() {
        when(medicationRepository.findAll()).thenReturn(List.of(medication));

        List<MedicationDto> result = medicationService.getAll();

        assertEquals(1, result.size());
        assertEquals("Paracetamol", result.get(0).getName());
        verify(medicationRepository).findAll();
    }

    @Test
    void getById_shouldReturnMedication_whenFound() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));

        MedicationDto result = medicationService.getById(1L);

        assertNotNull(result);
        assertEquals("Paracetamol", result.getName());
        verify(medicationRepository).findById(1L);
    }

    @Test
    void getById_shouldThrow_whenNotFound() {
        when(medicationRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> medicationService.getById(99L));
        assertEquals("Medication not found", ex.getMessage());
    }

    @Test
    void create_shouldSaveMedication() {
        when(medicationRepository.save(any(Medication.class))).thenReturn(medication);

        MedicationDto result = medicationService.create(medicationDto);

        assertNotNull(result);
        assertEquals("Paracetamol", result.getName());
        verify(medicationRepository).save(any(Medication.class));
    }

    @Test
    void update_shouldModifyMedication_whenFound() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));
        when(medicationRepository.save(any(Medication.class))).thenReturn(medication);

        MedicationDto result = medicationService.update(1L, medicationDto);

        assertNotNull(result);
        assertEquals("Paracetamol", result.getName());
        verify(medicationRepository).findById(1L);
        verify(medicationRepository).save(any(Medication.class));
    }

    @Test
    void delete_shouldRemoveMedication_whenFound() {
        when(medicationRepository.findById(1L)).thenReturn(Optional.of(medication));

        medicationService.delete(1L);

        verify(medicationRepository).findById(1L);
        verify(medicationRepository).delete(medication);
    }

    @Test
    void delete_shouldThrow_whenMedicationNotFound() {
        when(medicationRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> medicationService.delete(99L));
        assertEquals("Medication not found", ex.getMessage());
    }
}