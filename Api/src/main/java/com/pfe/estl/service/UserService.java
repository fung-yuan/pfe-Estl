package com.pfe.estl.service;

import com.pfe.estl.dto.UserDTO;

import java.util.List;
import java.util.Set;

public interface UserService {
    
    /**
     * Create a new user
     */
    UserDTO createUser(UserDTO userDTO);
    
    /**
     * Update an existing user
     */
    UserDTO updateUser(Long id, UserDTO userDTO);
    
    /**
     * Delete a user by their id
     */
    void deleteUser(Long id);
    
    /**
     * Get a user by their id
     */
    UserDTO getUserById(Long id);
    
    /**
     * Get a user by their username
     */
    UserDTO getUserByUsername(String username);
    
    /**
     * Get all users
     */
    List<UserDTO> getAllUsers();
    
    /**
     * Get users by department
     */
    List<UserDTO> getUsersByDepartment(String department);
    
    /**
     * Get users by role
     */
    List<UserDTO> getUsersByRole(String roleName);
    
    /**
     * Assign a role to a user
     */
    UserDTO assignRoleToUser(Long userId, Long roleId);
    
    /**
     * Remove a role from a user
     */
    UserDTO removeRoleFromUser(Long userId, Long roleId);
    
    /**
     * Enable or disable a user
     */
    UserDTO setUserEnabled(Long userId, boolean enabled);
    
    /**
     * Change user password
     */
    void changePassword(Long userId, String currentPassword, String newPassword);
    
    /**
     * Reset user password (admin function)
     */
    void resetPassword(Long userId, String newPassword);
    
    /**
     * Check if a user has a specific permission
     */
    boolean hasPermission(Long userId, String permission);
    
    /**
     * Get all permissions for a user (combined from all their roles)
     */
    Set<String> getUserPermissions(Long userId);
}
