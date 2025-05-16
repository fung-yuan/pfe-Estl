package com.pfe.estl.service;

import java.util.List;

import com.pfe.estl.dto.StudentDTO;

public interface StudentService {
    StudentDTO saveStudent(StudentDTO studentDTO);
    StudentDTO getStudentById(Long id);
    List<StudentDTO> getAllStudents();
    StudentDTO updateStudent(StudentDTO studentDTO);
    void deleteStudent(Long id);
    StudentDTO findByStudentId(String studentId);
    List<StudentDTO> getStudentsByDepartmentName(String departmentName);
    List<StudentDTO> getStudentsByDepartmentAndSemester(String departmentName, Long semesterId);
}