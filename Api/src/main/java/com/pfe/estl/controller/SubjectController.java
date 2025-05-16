package com.pfe.estl.controller;

import com.pfe.estl.dto.SubjectDTO;
import com.pfe.estl.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
// @CrossOrigin(origins = "*")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    // Method to get all subjects
    @GetMapping
    public List<SubjectDTO> getAllSubjects() {
        return subjectService.getAllSubjects(); // Assuming subjectService has this method
    }

    @GetMapping("/department/{departmentName}/semester/{semesterId}")
    public List<SubjectDTO> getSubjectsByDepartmentAndSemester(@PathVariable String departmentName, @PathVariable Long semesterId) {
        return subjectService.getSubjectsByDepartmentAndSemester(departmentName, semesterId);
    }
    
    // Method to create a new subject
    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@RequestBody SubjectDTO subjectDTO) {
        SubjectDTO createdSubject = subjectService.createSubject(subjectDTO);
        return ResponseEntity.ok(createdSubject);
    }

    // Method to delete a subject by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id); // Assuming subjectService has this method
        return ResponseEntity.noContent().build();
    }
}
