package com.pfe.estl.config;

import com.pfe.estl.model.User;
import com.pfe.estl.model.Role;
import com.pfe.estl.repository.UserRepository;
import com.pfe.estl.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.HashSet;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Create admin role with ADMIN_ALL permission if it doesn't exist
            Role adminRole;
            if (roleRepository.findByName("ADMIN").isEmpty()) {
                logger.info("Creating ADMIN role with ADMIN_ALL permission...");
                adminRole = new Role();
                adminRole.setName("ADMIN");
                adminRole.setDescription("Administrator role with all permissions");
                adminRole.setPermissions(new HashSet<>(Collections.singletonList("ADMIN_ALL")));
                adminRole = roleRepository.save(adminRole);
                logger.info("ADMIN role created with ADMIN_ALL permission");
            } else {
                adminRole = roleRepository.findByName("ADMIN").get();
                
                // Ensure ADMIN role has ADMIN_ALL permission
                if (!adminRole.getPermissions().contains("ADMIN_ALL")) {
                    adminRole.getPermissions().add("ADMIN_ALL");
                    adminRole = roleRepository.save(adminRole);
                    logger.info("Added ADMIN_ALL permission to existing ADMIN role");
                }
            }
            
            // Check if the default admin user already exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                logger.info("Creating default admin user...");
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@example.com"); 
                // IMPORTANT: Use a secure default password or prompt for one
                adminUser.setPassword(passwordEncoder.encode("password")); 
                
                // Assign the admin role to the user
                adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
                
                userRepository.save(adminUser);
                logger.info("Default admin user created with username 'admin', email 'admin@example.com', and password 'password'. Please change the password.");
            } else {
                User adminUser = userRepository.findByUsername("admin").get();
                
                // Ensure admin user has ADMIN role
                boolean hasAdminRole = adminUser.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("ADMIN"));
                    
                if (!hasAdminRole) {
                    adminUser.getRoles().add(adminRole);
                    userRepository.save(adminUser);
                    logger.info("Added ADMIN role to existing admin user");
                }
            }
        };
    }
}
