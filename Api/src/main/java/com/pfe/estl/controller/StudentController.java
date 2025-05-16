package com.pfe.estl.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pfe.estl.dto.StudentDTO;
import com.pfe.estl.service.StudentService;

@RestController
@RequestMapping("/api/students")
// @CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;
    
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping()
    public ResponseEntity<StudentDTO> createStudent(@RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.saveStudent(studentDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/department/{departmentName}")
    public ResponseEntity<List<StudentDTO>> getStudentsByDepartment(
            @PathVariable String departmentName) {
        return ResponseEntity.ok(studentService.getStudentsByDepartmentName(departmentName));
    }

    @GetMapping("/department/{departmentName}/semester/{semesterId}")
    public ResponseEntity<List<StudentDTO>> getStudentsByDepartmentAndSemester(
            @PathVariable String departmentName,
            @PathVariable Long semesterId) {
        return ResponseEntity.ok(studentService.getStudentsByDepartmentAndSemester(departmentName, semesterId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id, 
            @RequestBody StudentDTO studentDTO) {
        studentDTO.setId(id);
        return ResponseEntity.ok(studentService.updateStudent(studentDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/find/{studentId}")
    public ResponseEntity<StudentDTO> findByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(studentService.findByStudentId(studentId));
    }
}
