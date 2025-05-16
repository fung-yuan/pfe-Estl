package com.pfe.estl.controller;

import com.pfe.estl.dto.ChangePasswordRequest;
import com.pfe.estl.dto.UserDTO;
import com.pfe.estl.model.User; 
import com.pfe.estl.repository.UserRepository;
import com.pfe.estl.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Autowired
    public UserController(UserRepository userRepository, 
                          PasswordEncoder passwordEncoder,
                          UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    /**
     * Gets the details of the currently authenticated user.
     * @param userDetails The UserDetails object automatically injected by Spring Security.
     * @return A ResponseEntity containing the username.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            // This shouldn't happen if the endpoint is properly secured,
            // but it's good practice to handle it.
            return ResponseEntity.status(401).body("User not authenticated");
        }
        
        // Get the complete user information including email
        String username = userDetails.getUsername();
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        
        User user = userOptional.get();
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("id", user.getId());
        
        // Add roles information
        List<Map<String, Object>> roles = user.getRoles().stream()
            .map(role -> {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("name", role.getName());
                return roleMap;
            })
            .collect(Collectors.toList());
        
        userMap.put("roles", roles);

        return ResponseEntity.ok(userMap);
    }

    /**
     * Changes the password for the currently authenticated user.
     * @param changePasswordRequest DTO containing current and new passwords.
     * @param userDetails The UserDetails object automatically injected by Spring Security.
     * @return A ResponseEntity indicating success or failure.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        String username = userDetails.getUsername();
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            // Should not happen if token is valid, but good to check
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOptional.get();

        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(400).body("Incorrect current password");
        }

        // Check if new password is provided and not empty
        if (changePasswordRequest.getNewPassword() == null || changePasswordRequest.getNewPassword().isBlank()) {
            return ResponseEntity.status(400).body("New password cannot be empty");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }
    
    // ============= Admin User Management Endpoints =================
    
    /**
     * Create a new user (admin only)
     */
    @PostMapping("/admin/users")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.createUser(userDTO), HttpStatus.CREATED);
    }
    
    /**
     * Update an existing user (admin only)
     */
    @PutMapping("/admin/users/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }
    
    /**
     * Delete a user (admin only)
     */
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get a user by ID (admin only)
     */
    @GetMapping("/admin/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    /**
     * Get all users (admin only)
     */
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    /**
     * Get users by department (admin only)
     */
    @GetMapping("/admin/users/department/{department}")
    public ResponseEntity<List<UserDTO>> getUsersByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(userService.getUsersByDepartment(department));
    }
    
    /**
     * Get users by role (admin only)
     */
    @GetMapping("/admin/users/role/{roleName}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String roleName) {
        return ResponseEntity.ok(userService.getUsersByRole(roleName));
    }
    
    /**
     * Assign a role to a user (admin only)
     */
    @PostMapping("/admin/users/{userId}/roles/{roleId}")
    public ResponseEntity<UserDTO> assignRoleToUser(   
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        return ResponseEntity.ok(userService.assignRoleToUser(userId, roleId));
    }
    
    /**
     * Remove a role from a user (admin only)
     */
    @DeleteMapping("/admin/users/{userId}/roles/{roleId}")
    public ResponseEntity<UserDTO> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable Long roleId) {
        return ResponseEntity.ok(userService.removeRoleFromUser(userId, roleId));
    }
    
    /**
     * Enable or disable a user (admin only)
     */
    @PutMapping("/admin/users/{userId}/status")
    public ResponseEntity<UserDTO> setUserEnabled(
            @PathVariable Long userId,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(userService.setUserEnabled(userId, enabled));
    }
    
    /**
     * Reset a user's password (admin only)
     */
    @PostMapping("/admin/users/{userId}/reset-password")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable Long userId,
            @RequestParam String newPassword) {
        userService.resetPassword(userId, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }
    
    /**
     * Get all permissions for a user (admin only)
     */
    @GetMapping("/admin/users/{userId}/permissions")
    public ResponseEntity<Set<String>> getUserPermissions(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserPermissions(userId));
    }
    
    /**
     * Check if a user has a specific permission (admin only)
     */
    @GetMapping("/admin/users/{userId}/permissions/{permission}")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable Long userId,
            @PathVariable String permission) {
        return ResponseEntity.ok(userService.hasPermission(userId, permission));
    }
}
