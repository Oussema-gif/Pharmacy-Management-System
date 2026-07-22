package com.pharmacy.service;

import com.pharmacy.dto.JwtResponse;
import com.pharmacy.dto.LoginRequest;
import com.pharmacy.dto.SignupRequest;
import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import com.pharmacy.repository.UserRepository;
import com.pharmacy.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private SignupRequest signupRequest;
    private User user;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("admin@pharmacy.com");
        loginRequest.setPassword("admin123");

        user = new User();
        user.setId(1L);
        user.setFullName("System Administrator");
        user.setEmail("admin@pharmacy.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.ADMIN);
        user.setEnabled(true);

        userDetails = new UserDetailsImpl(user);

        signupRequest = new SignupRequest();
        signupRequest.setFullName("New User");
        signupRequest.setEmail("new@pharmacy.com");
        signupRequest.setPassword("password");
        signupRequest.setRole(Role.CASHIER);
    }

    @Test
    @DisplayName("Should authenticate user and return JWT response")
    void authenticateUser_ShouldReturnJwtResponse() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateToken("admin@pharmacy.com", "ADMIN", "System Administrator", null))
                .thenReturn("mocked-jwt-token");

        JwtResponse response = authService.authenticateUser(loginRequest);

        assertThat(response.getToken()).isEqualTo("mocked-jwt-token");
        assertThat(response.getEmail()).isEqualTo("admin@pharmacy.com");
        assertThat(response.getRole()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Should register a new user")
    void registerUser_ShouldSaveUser() {
        when(userRepository.existsByEmail("new@pharmacy.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        authService.registerUser(signupRequest);

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with existing email")
    void registerUser_ShouldThrowException_WhenEmailExists() {
        when(userRepository.existsByEmail("new@pharmacy.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerUser(signupRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email is already in use!");
    }
}