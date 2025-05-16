package com.pfe.estl.controller;

import com.pfe.estl.dto.RoleDTO;
import com.pfe.estl.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    @Autowired
    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping
    public ResponseEntity<RoleDTO> createRole(@RequestBody RoleDTO roleDTO) {
        return new ResponseEntity<>(roleService.createRole(roleDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> updateRole(@PathVariable Long id, @RequestBody RoleDTO roleDTO) {
        return ResponseEntity.ok(roleService.updateRole(id, roleDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRoleById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<RoleDTO> getRoleByName(@PathVariable String name) {
        return ResponseEntity.ok(roleService.getRoleByName(name));
    }

    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PostMapping("/{roleId}/permissions/{permission}")
    public ResponseEntity<RoleDTO> addPermission(
            @PathVariable Long roleId,
            @PathVariable String permission) {
        return ResponseEntity.ok(roleService.addPermission(roleId, permission));
    }

    @DeleteMapping("/{roleId}/permissions/{permission}")
    public ResponseEntity<RoleDTO> removePermission(
            @PathVariable Long roleId,
            @PathVariable String permission) {
        return ResponseEntity.ok(roleService.removePermission(roleId, permission));
    }

    @PutMapping("/{roleId}/permissions")
    public ResponseEntity<RoleDTO> setPermissions(
            @PathVariable Long roleId,
            @RequestBody Set<String> permissions) {
        return ResponseEntity.ok(roleService.setPermissions(roleId, permissions));
    }

    @GetMapping("/{roleId}/permissions")
    public ResponseEntity<Set<String>> getPermissions(@PathVariable Long roleId) {
        return ResponseEntity.ok(roleService.getPermissions(roleId));
    }
}
