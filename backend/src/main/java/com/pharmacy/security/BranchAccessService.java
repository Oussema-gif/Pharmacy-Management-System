package com.pharmacy.security;

import com.pharmacy.model.Branch;
import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BranchAccessService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    public boolean isAdmin(String email) {
        User user = getCurrentUser(email);
        return user.getRole() == Role.ADMIN;
    }

    public Branch getCurrentUserBranch(String email) {
        User user = getCurrentUser(email);

        if (user.getBranch() == null) {
            throw new RuntimeException("Authenticated user is not assigned to any branch");
        }

        return user.getBranch();
    }

    public Long resolveAccessibleBranchId(String email, Long requestedBranchId) {
        User user = getCurrentUser(email);

        if (user.getRole() == Role.ADMIN) {
            if (requestedBranchId == null) {
                throw new RuntimeException("Branch id is required for admin access");
            }

            branchRepository.findById(requestedBranchId)
                    .orElseThrow(() -> new RuntimeException("Branch not found"));

            return requestedBranchId;
        }

        if (user.getBranch() == null) {
            throw new RuntimeException("Authenticated user is not assigned to any branch");
        }

        Long userBranchId = user.getBranch().getId();

        if (requestedBranchId != null && !userBranchId.equals(requestedBranchId)) {
            throw new RuntimeException("You are not allowed to access another branch");
        }

        return userBranchId;
    }
}