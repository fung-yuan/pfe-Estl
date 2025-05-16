package com.pfe.estl.service.impl;

import com.pfe.estl.dto.RoleDTO;
import com.pfe.estl.model.Role;
import com.pfe.estl.repository.RoleRepository;
import com.pfe.estl.ResourceNotFoundException;
import com.pfe.estl.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public RoleDTO createRole(RoleDTO roleDTO) {
        if (roleRepository.existsByName(roleDTO.getName())) {
            throw new IllegalArgumentException("Role with name " + roleDTO.getName() + " already exists");
        }
        
        Role role = mapToEntity(roleDTO);
        role = roleRepository.save(role);
        return mapToDTO(role);
    }

    @Override
    public RoleDTO updateRole(Long id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        
        // Check if name is being changed and if it would conflict
        if (!role.getName().equals(roleDTO.getName()) && roleRepository.existsByName(roleDTO.getName())) {
            throw new IllegalArgumentException("Role with name " + roleDTO.getName() + " already exists");
        }
        
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        role.setPermissions(roleDTO.getPermissions());
        
        role = roleRepository.save(role);
        return mapToDTO(role);
    }

    @Override
    public void deleteRole(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
    }

    @Override
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
        return mapToDTO(role);
    }

    @Override
    public RoleDTO getRoleByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + name));
        return mapToDTO(role);
    }

    @Override
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoleDTO addPermission(Long roleId, String permission) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        role.addPermission(permission);
        role = roleRepository.save(role);
        return mapToDTO(role);
    }

    @Override
    public RoleDTO removePermission(Long roleId, String permission) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        role.removePermission(permission);
        role = roleRepository.save(role);
        return mapToDTO(role);
    }

    @Override
    public RoleDTO setPermissions(Long roleId, Set<String> permissions) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        role.setPermissions(permissions);
        role = roleRepository.save(role);
        return mapToDTO(role);
    }

    @Override
    public Set<String> getPermissions(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return new HashSet<>(role.getPermissions());
    }

    @Override
    public boolean existsById(Long id) {
        return roleRepository.existsById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }
    
    // Helper method to map Role entity to RoleDTO
    private RoleDTO mapToDTO(Role role) {
        RoleDTO roleDTO = new RoleDTO();
        roleDTO.setId(role.getId());
        roleDTO.setName(role.getName());
        roleDTO.setDescription(role.getDescription());
        roleDTO.setPermissions(new HashSet<>(role.getPermissions()));
        return roleDTO;
    }
    
    // Helper method to map RoleDTO to Role entity
    private Role mapToEntity(RoleDTO roleDTO) {
        Role role = new Role();
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        if (roleDTO.getPermissions() != null) {
            role.setPermissions(roleDTO.getPermissions());
        }
        return role;
    }
}
