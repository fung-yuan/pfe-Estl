package com.pfe.estl.mapper;

import com.pfe.estl.dto.DepartmentDTO;
import com.pfe.estl.model.Department;

public class DepartmentMapper {
    
    public static DepartmentDTO toDTO(Department department) {
        if (department == null) return null;
        
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        
        return dto;
    }
    
    public static Department toEntity(DepartmentDTO dto) {
        if (dto == null) return null;
        
        Department department = new Department();
        department.setId(dto.getId());
        department.setName(dto.getName());
        
        return department;
    }
}