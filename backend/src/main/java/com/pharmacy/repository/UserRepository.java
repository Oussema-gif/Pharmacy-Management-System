package com.pharmacy.repository;

import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByEmailAndIdNot(String email, Long id);
    List<User> findByRoleIn(List<Role> roles);
}