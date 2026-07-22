package com.pharmacy.service;

import com.pharmacy.dto.UserDto;
import com.pharmacy.model.Branch;
import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toDto(user);
    }

    public UserDto createUser(UserDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        validateBranchRequirement(dto);

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setEnabled(true);

        if (dto.getBranchId() != null) {
            Branch branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
            user.setBranch(branch);
        } else {
            user.setBranch(null);
        }

        user = userRepository.save(user);

        auditService.log(
                "User",
                user.getId(),
                "CREATE",
                "User account created for " + user.getEmail(),
                "system"
        );

        return toDto(user);
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new RuntimeException("Email already in use");
        }

        validateBranchRequirement(dto);

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getBranchId() != null) {
            Branch branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
            user.setBranch(branch);
        } else {
            user.setBranch(null);
        }

        user = userRepository.save(user);

        auditService.log(
                "User",
                user.getId(),
                "UPDATE",
                "Admin updated user " + user.getEmail(),
                "system"
        );

        return toDto(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.deleteById(id);

        auditService.log(
                "User",
                id,
                "DELETE",
                "Deleted user " + user.getEmail(),
                "system"
        );
    }

    public UserDto getCurrentUserProfile(String email) {
        User user = getUserByEmail(email);
        return toDto(user);
    }

    public UserDto updateCurrentUserProfile(String email, Map<String, String> payload) {
        User user = getUserByEmail(email);

        String fullName = safeValue(payload.get("fullName"));
        String newEmail = safeValue(payload.get("email"));

        if (fullName.isEmpty()) {
            throw new RuntimeException("Full name is required");
        }

        if (newEmail.isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        if (userRepository.existsByEmailAndIdNot(newEmail, user.getId())) {
            throw new RuntimeException("Email already in use");
        }

        user.setFullName(fullName);
        user.setEmail(newEmail);

        user = userRepository.save(user);

        auditService.log(
                "User",
                user.getId(),
                "PROFILE_UPDATE",
                "Updated own profile",
                user.getEmail()
        );

        return toDto(user);
    }

    public void changePassword(String email, Map<String, String> payload) {
        User user = getUserByEmail(email);

        String currentPassword = safeValue(payload.get("currentPassword"));
        String newPassword = safeValue(payload.get("newPassword"));
        String confirmPassword = safeValue(payload.get("confirmPassword"));

        if (currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
            throw new RuntimeException("All password fields are required");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("New password and confirmation do not match");
        }

        if (newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditService.log(
                "User",
                user.getId(),
                "PASSWORD_CHANGE",
                "Changed own password",
                user.getEmail()
        );
    }

    private void validateBranchRequirement(UserDto dto) {
        if (dto.getRole() == null) {
            throw new RuntimeException("Role is required");
        }

        if (dto.getRole() != Role.ADMIN && dto.getBranchId() == null) {
            throw new RuntimeException("Branch is required for non-admin users");
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private String safeValue(String value) {
        return value == null ? "" : value.trim();
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        if (user.getBranch() != null) {
            dto.setBranchId(user.getBranch().getId());
            dto.setBranchName(user.getBranch().getName());
        }

        return dto;
    }
}