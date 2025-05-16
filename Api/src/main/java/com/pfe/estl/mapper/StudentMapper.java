package com.pfe.estl.mapper;

import com.pfe.estl.dto.DepartmentDTO;
import com.pfe.estl.dto.SemesterDTO;
import com.pfe.estl.dto.StudentDTO;
import com.pfe.estl.model.Department;
import com.pfe.estl.model.Semester;
import com.pfe.estl.model.Student;

public class StudentMapper {
    
    public static StudentDTO toDTO(Student student) {
        if (student == null) return null;
        
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFullName(student.getFullName());
        dto.setStudentId(student.getStudentId());
        dto.setEmail(student.getEmail());
        
        if (student.getDepartment() != null) {
            DepartmentDTO departmentDTO = new DepartmentDTO();
            departmentDTO.setId(student.getDepartment().getId());
            departmentDTO.setName(student.getDepartment().getName());
            dto.setDepartment(departmentDTO);
        }
        
        if (student.getSemester() != null) {
            SemesterDTO semesterDTO = new SemesterDTO();
            semesterDTO.setId(student.getSemester().getId());
            semesterDTO.setName(student.getSemester().getName());
            dto.setSemester(semesterDTO);
        }
        
        return dto;
    }
    
    public static Student toEntity(StudentDTO dto, Department department, Semester semester) {
        if (dto == null) return null;
        
        Student student = new Student();
        student.setId(dto.getId());
        student.setFullName(dto.getFullName());
        student.setStudentId(dto.getStudentId());
        student.setEmail(dto.getEmail());
        student.setDepartment(department);
        student.setSemester(semester);
        
        return student;
    }
}