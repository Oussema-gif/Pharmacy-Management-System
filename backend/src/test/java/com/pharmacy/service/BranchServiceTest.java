package com.pharmacy.service;

import com.pharmacy.dto.BranchDto;
import com.pharmacy.model.Branch;
import com.pharmacy.repository.BranchRepository;
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
class BranchServiceTest {

    @Mock
    private BranchRepository branchRepository;

    @InjectMocks
    private BranchService branchService;

    private Branch branch;
    private BranchDto branchDto;

    @BeforeEach
    void setUp() {
        branch = new Branch();
        branch.setId(1L);
        branch.setName("Main Branch");
        branch.setAddress("123 Main St");
        branch.setPhone("111-1111");

        branchDto = new BranchDto();
        branchDto.setName("Main Branch");
        branchDto.setAddress("123 Main St");
        branchDto.setPhone("111-1111");
    }

    @Test
    @DisplayName("Should return all branches")
    void getAllBranches_ShouldReturnList() {
        when(branchRepository.findAll()).thenReturn(List.of(branch));

        List<BranchDto> result = branchService.getAllBranches();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Main Branch");
    }

    @Test
    @DisplayName("Should return branch by id")
    void getBranchById_ShouldReturnBranch() {
        when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));

        BranchDto result = branchService.getBranchById(1L);

        assertThat(result.getName()).isEqualTo("Main Branch");
    }

    @Test
    @DisplayName("Should throw exception when branch not found")
    void getBranchById_ShouldThrowException_WhenNotFound() {
        when(branchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> branchService.getBranchById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Branch not found");
    }

    @Test
    @DisplayName("Should create a new branch")
    void createBranch_ShouldSaveAndReturnDto() {
        when(branchRepository.existsByName(branchDto.getName())).thenReturn(false);
        when(branchRepository.save(any(Branch.class))).thenReturn(branch);

        BranchDto result = branchService.createBranch(branchDto);

        assertThat(result.getName()).isEqualTo("Main Branch");
        verify(branchRepository, times(1)).save(any(Branch.class));
    }

    @Test
    @DisplayName("Should throw exception when branch name already exists")
    void createBranch_ShouldThrowException_WhenNameExists() {
        when(branchRepository.existsByName(branchDto.getName())).thenReturn(true);

        assertThatThrownBy(() -> branchService.createBranch(branchDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Branch name already exists");
    }

    @Test
    @DisplayName("Should update an existing branch")
    void updateBranch_ShouldModifyAndReturnDto() {
        when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
        when(branchRepository.save(any(Branch.class))).thenReturn(branch);

        branchDto.setName("Updated Branch");
        BranchDto result = branchService.updateBranch(1L, branchDto);

        assertThat(result.getName()).isEqualTo("Updated Branch");
        verify(branchRepository, times(1)).save(branch);
    }

    @Test
    @DisplayName("Should delete branch by id")
    void deleteBranch_ShouldCallRepositoryDelete() {
        doNothing().when(branchRepository).deleteById(1L);

        branchService.deleteBranch(1L);

        verify(branchRepository, times(1)).deleteById(1L);
    }
}