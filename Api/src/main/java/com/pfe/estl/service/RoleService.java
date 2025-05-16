package com.pfe.estl.service;

import com.pfe.estl.dto.RoleDTO;

import java.util.List;
import java.util.Set;

public interface RoleService {
    
    /**
     * Create a new role
     */
    RoleDTO createRole(RoleDTO roleDTO);
    
    /**
     * Update an existing role
     */
    RoleDTO updateRole(Long id, RoleDTO roleDTO);
    
    /**
     * Delete a role by its id
     */
    void deleteRole(Long id);
    
    /**
     * Get a role by its id
     */
    RoleDTO getRoleById(Long id);
    
    /**
     * Get a role by its name
     */
    RoleDTO getRoleByName(String name);
    
    /**
     * Get all roles
     */
    List<RoleDTO> getAllRoles();
    
    /**
     * Add a permission to a role
     */
    RoleDTO addPermission(Long roleId, String permission);
    
    /**
     * Remove a permission from a role
     */
    RoleDTO removePermission(Long roleId, String permission);
    
    /**
     * Set all permissions for a role
     */
    RoleDTO setPermissions(Long roleId, Set<String> permissions);
    
    /**
     * Get all permissions for a role
     */
    Set<String> getPermissions(Long roleId);
    
    /**
     * Check if the role exists
     */
    boolean existsById(Long id);
    
    /**
     * Check if the role exists by name
     */
    boolean existsByName(String name);
}
