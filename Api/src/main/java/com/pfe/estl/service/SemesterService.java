package com.pfe.estl.service;

import com.pfe.estl.dto.SemesterDTO;

import java.util.List;

public interface SemesterService {
    List<SemesterDTO> getAllSemesters();
    
    List<SemesterDTO> getSemestersByDepartment(String departmentName);
}
