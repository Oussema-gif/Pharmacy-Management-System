package com.pharmacy.config;

import com.pharmacy.model.Branch;
import com.pharmacy.model.Role;
import com.pharmacy.model.User;
import com.pharmacy.repository.BranchRepository;
import com.pharmacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    BranchRepository branchRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@pharmacy.com")) {
            // Ensure default branch exists (Hibernate usually creates one if not)
            Branch defaultBranch = branchRepository.findById(1L).orElse(null);

            User admin = new User();
            admin.setFullName("System Administrator");
            admin.setEmail("admin@pharmacy.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            admin.setBranch(defaultBranch);          // ✅ assign branch
            userRepository.save(admin);
            System.out.println("Default admin created: admin@pharmacy.com / admin123");
        }
    }
}