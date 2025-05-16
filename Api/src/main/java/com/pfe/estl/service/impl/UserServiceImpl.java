package com.pfe.estl.service.impl;

import com.pfe.estl.dto.RoleDTO;
import com.pfe.estl.dto.UserDTO;
import com.pfe.estl.model.Role;
import com.pfe.estl.model.User;
import com.pfe.estl.repository.RoleRepository;
import com.pfe.estl.repository.UserRepository;
import com.pfe.estl.ResourceNotFoundException;

import com.pfe.estl.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, 
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username is already taken: " + userDTO.getUsername());
        }
        
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + userDTO.getEmail());
        }
        
        // Create new user entity
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        // Department field removed as it's no longer needed
        user.setEnabled(userDTO.isEnabled());
        
        // Save user first to get user ID
        user = userRepository.save(user);
        
        // Assign roles if provided
        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            for (RoleDTO roleDTO : userDTO.getRoles()) {
                Role role = roleRepository.findById(roleDTO.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleDTO.getId()));
                user.addRole(role);
            }
            user = userRepository.save(user);
        }
        
        return mapToDTO(user);
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Check if username is being changed and if it would conflict
        if (!user.getUsername().equals(userDTO.getUsername()) && userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username is already taken: " + userDTO.getUsername());
        }
        
        // Check if email is being changed and if it would conflict
        if (!user.getEmail().equals(userDTO.getEmail()) && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + userDTO.getEmail());
        }
        
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        // Department field removed as it's no longer needed
        user.setEnabled(userDTO.isEnabled());
        
        // Only update password if it's provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        // Update roles if provided
        if (userDTO.getRoles() != null) {
            // Clear existing roles and add new ones
            user.getRoles().clear();
            
            for (RoleDTO roleDTO : userDTO.getRoles()) {
                Role role = roleRepository.findById(roleDTO.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleDTO.getId()));
                user.addRole(role);
            }
        }
        
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getUsersByDepartment(String department) {
        // Department field has been removed from User entity
        // Return empty list as users no longer have departments
        logger.warn("getUsersByDepartment called but department field has been removed from User entity");
        return new ArrayList<>();
    }

    @Override
    public List<UserDTO> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        user.addRole(role);
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Override
    public UserDTO removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        user.removeRole(role);
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Override
    public UserDTO setUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setEnabled(enabled);
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Admin function to reset password without knowing current password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public boolean hasPermission(Long userId, String permission) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Check if any of the user's roles has the requested permission
        for (Role role : user.getRoles()) {
            if (role.getPermissions().contains(permission)) {
                return true;
            }
        }
        
        return false;
    }

    @Override
    public Set<String> getUserPermissions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Collect all unique permissions from all roles
        Set<String> allPermissions = new HashSet<>();
        for (Role role : user.getRoles()) {
            allPermissions.addAll(role.getPermissions());
        }
        
        return allPermissions;
    }
    
    // Helper method to map User entity to UserDTO
    private UserDTO mapToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        // Department field removed as it's no longer needed
        userDTO.setEnabled(user.isEnabled());
        
        // Map roles (without passwords for security)
        if (user.getRoles() != null) {
            Set<RoleDTO> roleDTOs = user.getRoles().stream()
                    .map(role -> {
                        RoleDTO roleDTO = new RoleDTO();
                        roleDTO.setId(role.getId());
                        roleDTO.setName(role.getName());
                        roleDTO.setDescription(role.getDescription());
                        roleDTO.setPermissions(new HashSet<>(role.getPermissions()));
                        return roleDTO;
                    })
                    .collect(Collectors.toSet());
            
            userDTO.setRoles(roleDTOs);
        }
        
        return userDTO;
    }
}
