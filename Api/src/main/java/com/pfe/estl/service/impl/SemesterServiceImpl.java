package com.pfe.estl.service.impl;

import com.pfe.estl.dto.SemesterDTO;
import com.pfe.estl.model.Semester;
import com.pfe.estl.repository.SemesterRepository;
import com.pfe.estl.service.SemesterService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;

    public SemesterServiceImpl(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    @Override
    public List<SemesterDTO> getAllSemesters() {
        List<Semester> semesters = semesterRepository.findAll();
        return semesters.stream()
                .map(semester -> {
                    SemesterDTO dto = new SemesterDTO();
                    dto.setId(semester.getId());
                    dto.setName(semester.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SemesterDTO> getSemestersByDepartment(String departmentName) {
        List<Semester> semesters = semesterRepository.findByDepartmentName(departmentName);
        return semesters.stream()
                .map(semester -> {
                    SemesterDTO dto = new SemesterDTO();
                    dto.setId(semester.getId());
                    dto.setName(semester.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
