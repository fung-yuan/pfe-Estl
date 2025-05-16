package com.pfe.estl.controller;

import com.pfe.estl.dto.SemesterDTO;
import com.pfe.estl.service.SemesterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    @GetMapping
    public List<SemesterDTO> getAllSemesters() {
        return semesterService.getAllSemesters();
    }

    @GetMapping("/department/{departmentName}")
    public List<SemesterDTO> getSemestersByDepartment(@PathVariable String departmentName) {
        return semesterService.getSemestersByDepartment(departmentName);
    }
}
