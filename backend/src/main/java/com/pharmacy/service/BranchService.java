package com.pharmacy.service;

import com.pharmacy.dto.BranchDto;
import com.pharmacy.model.Branch;
import com.pharmacy.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BranchDto getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        return toDto(branch);
    }

    public BranchDto createBranch(BranchDto dto) {
        if (branchRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Branch name already exists");
        }
        Branch branch = new Branch();
        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setPhone(dto.getPhone());
        branch = branchRepository.save(branch);
        return toDto(branch);
    }

    public BranchDto updateBranch(Long id, BranchDto dto) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setPhone(dto.getPhone());
        branch = branchRepository.save(branch);
        return toDto(branch);
    }

    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    private BranchDto toDto(Branch branch) {
        BranchDto dto = new BranchDto();
        dto.setId(branch.getId());
        dto.setName(branch.getName());
        dto.setAddress(branch.getAddress());
        dto.setPhone(branch.getPhone());
        return dto;
    }
}