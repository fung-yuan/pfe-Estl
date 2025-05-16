package com.pfe.estl.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pfe.estl.dto.DepartmentDTO;
import com.pfe.estl.mapper.DepartmentMapper;
import com.pfe.estl.model.Department;
import com.pfe.estl.repository.DepartmentRepository;
import com.pfe.estl.service.DepartmentService;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public DepartmentDTO saveDepartment(DepartmentDTO departmentDTO) {
        Department department = DepartmentMapper.toEntity(departmentDTO);
        department = departmentRepository.save(department);
        return DepartmentMapper.toDTO(department);
    }

    @Override
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
        return DepartmentMapper.toDTO(department);
    }

    @Override
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
            .map(DepartmentMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public DepartmentDTO updateDepartment(DepartmentDTO departmentDTO) {
        if (departmentDTO.getId() == null) {
            throw new RuntimeException("Department id cannot be null for update");
        }
        Department department = DepartmentMapper.toEntity(departmentDTO);
        department = departmentRepository.save(department);
        return DepartmentMapper.toDTO(department);
    }

    @Override
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public Department findByName(String departmentName) {
        return departmentRepository.findByName(departmentName)
            .orElseThrow(() -> new RuntimeException("Department not found"));
    }
}
