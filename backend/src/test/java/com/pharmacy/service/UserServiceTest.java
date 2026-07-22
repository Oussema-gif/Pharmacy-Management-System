package com.pharmacy.service;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pharmacy.dto.UserDto;
import com.pharmacy.model.Branch;
import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserDto userDto;
    private Branch branch;

    @BeforeEach
    void setUp() {
        branch = new Branch();
        branch.setId(1L);
        branch.setName("Main Branch");

        user = new User();
        user.setId(10L);
        user.setFullName("Jane Doe");
        user.setEmail("jane@pharmacy.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.PHARMACIST);
        user.setEnabled(true);
        user.setBranch(branch);

        userDto = new UserDto();
        userDto.setFullName("Jane Doe");
        userDto.setEmail("jane@pharmacy.com");
        userDto.setPassword("plainPassword");
        userDto.setRole(Role.PHARMACIST);
        userDto.setBranchId(1L);
    }

    @Test
    @DisplayName("Should return all users")
    void getAllUsers_ShouldReturnList() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<UserDto> result = userService.getAllUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("jane@pharmacy.com");
    }

    @Test
    @DisplayName("Should return user by id")
    void getUserById_ShouldReturnUser() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        UserDto result = userService.getUserById(10L);

        assertThat(result.getFullName()).isEqualTo("Jane Doe");
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void getUserById_ShouldThrowException_WhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    @DisplayName("Should create a new user")
    void createUser_ShouldSaveAndReturnDto() {
        when(userRepository.existsByEmail(userDto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDto result = userService.createUser(userDto);

        assertThat(result.getFullName()).isEqualTo("Jane Doe");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email is already in use")
    void createUser_ShouldThrowException_WhenEmailExists() {
        when(userRepository.existsByEmail(userDto.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(userDto))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already in use");
    }

    @Test
    @DisplayName("Should update an existing user")
    void updateUser_ShouldModifyAndReturnDto() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
        when(userRepository.save(any(User.class))).thenReturn(user);

        userDto.setFullName("Jane Updated");
        userDto.setPassword("newPassword");
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncoded");

        UserDto result = userService.updateUser(10L, userDto);

        assertThat(result.getFullName()).isEqualTo("Jane Updated");
        verify(passwordEncoder, times(1)).encode("newPassword");
    }

    @Test
    @DisplayName("Should delete user by id")
    void deleteUser_ShouldCallRepositoryDelete() {
        doNothing().when(userRepository).deleteById(10L);

        userService.deleteUser(10L);

        verify(userRepository, times(1)).deleteById(10L);
    }
}