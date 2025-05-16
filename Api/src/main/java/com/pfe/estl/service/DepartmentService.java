package com.pfe.estl.service;

import java.util.List;

import com.pfe.estl.dto.DepartmentDTO;

public interface DepartmentService {
    DepartmentDTO saveDepartment(DepartmentDTO departmentDTO);
    DepartmentDTO getDepartmentById(Long id);
    List<DepartmentDTO> getAllDepartments();
    DepartmentDTO updateDepartment(DepartmentDTO departmentDTO);
    void deleteDepartment(Long id);
}