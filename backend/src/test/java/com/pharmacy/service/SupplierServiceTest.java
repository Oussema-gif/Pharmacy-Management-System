package com.pharmacy.service;

import com.pharmacy.dto.SupplierDto;
import com.pharmacy.model.Supplier;
import com.pharmacy.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier supplier;
    private SupplierDto supplierDto;

    @BeforeEach
    void setUp() {
        supplier = new Supplier();
        supplier.setId(1L);
        supplier.setName("MediSupply Co");
        supplier.setContactPerson("John Doe");
        supplier.setPhone("222-2222");
        supplier.setEmail("supplier@example.com");
        supplier.setAddress("456 Supplier St");

        supplierDto = new SupplierDto();
        supplierDto.setName("MediSupply Co");
        supplierDto.setContactPerson("John Doe");
        supplierDto.setPhone("222-2222");
        supplierDto.setEmail("supplier@example.com");
        supplierDto.setAddress("456 Supplier St");
    }

    @Test
    @DisplayName("Should return all suppliers")
    void getAll_ShouldReturnList() {
        when(supplierRepository.findAll()).thenReturn(List.of(supplier));

        List<SupplierDto> result = supplierService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("MediSupply Co");
    }

    @Test
    @DisplayName("Should return supplier by id")
    void getById_ShouldReturnSupplier() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));

        SupplierDto result = supplierService.getById(1L);

        assertThat(result.getName()).isEqualTo("MediSupply Co");
    }

    @Test
    @DisplayName("Should create a new supplier")
    void create_ShouldSaveAndReturnDto() {
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        SupplierDto result = supplierService.create(supplierDto);

        assertThat(result.getName()).isEqualTo("MediSupply Co");
        verify(supplierRepository, times(1)).save(any(Supplier.class));
    }

    @Test
    @DisplayName("Should update an existing supplier")
    void update_ShouldModifyAndReturnDto() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
        when(supplierRepository.save(any(Supplier.class))).thenReturn(supplier);

        supplierDto.setPhone("333-3333");
        SupplierDto result = supplierService.update(1L, supplierDto);

        assertThat(result.getPhone()).isEqualTo("333-3333");
    }

    @Test
    @DisplayName("Should delete supplier by id")
    void delete_ShouldCallRepositoryDelete() {
        doNothing().when(supplierRepository).deleteById(1L);

        supplierService.delete(1L);

        verify(supplierRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception on delete if supplier is in use")
    void delete_ShouldThrowException_WhenInUse() {
        doThrow(new org.springframework.dao.DataIntegrityViolationException("constraint violation"))
                .when(supplierRepository).deleteById(1L);

        assertThatThrownBy(() -> supplierService.delete(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Supplier is in use and cannot be deleted.");
    }
}