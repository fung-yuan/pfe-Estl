package com.pfe.estl.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.pfe.estl.dto.StudentDTO;
import com.pfe.estl.mapper.StudentMapper;
import com.pfe.estl.model.Department;
import com.pfe.estl.model.Semester;
import com.pfe.estl.model.Student;
import com.pfe.estl.repository.DepartmentRepository;
import com.pfe.estl.repository.SemesterRepository;
import com.pfe.estl.repository.StudentRepository;
import com.pfe.estl.service.StudentService;

@Service
public class StudentServiceImpl implements StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentServiceImpl.class);

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;

    public StudentServiceImpl(StudentRepository studentRepository, 
                             DepartmentRepository departmentRepository,
                             SemesterRepository semesterRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.semesterRepository = semesterRepository;
    }

    @Override
    public StudentDTO saveStudent(StudentDTO studentDTO) {
        Department department = departmentRepository.findById(studentDTO.getDepartment().getId())
            .orElseThrow(() -> new RuntimeException("Department not found with id: " 
                + studentDTO.getDepartment().getId()));
        
        Semester semester = semesterRepository.findById(studentDTO.getSemester().getId())
            .orElseThrow(() -> new RuntimeException("Semester not found with id: " 
                + studentDTO.getSemester().getId()));
        
        Student student = StudentMapper.toEntity(studentDTO, department, semester);
        student = studentRepository.save(student);
        return StudentMapper.toDTO(student);
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        return StudentMapper.toDTO(student);
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
            .map(StudentMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public StudentDTO updateStudent(StudentDTO studentDTO) {
        logger.info("Attempting to update student with ID: {}", studentDTO.getId());
        logger.debug("Incoming StudentDTO: {}", studentDTO);

        if (studentDTO.getId() == null) {
            logger.error("Student ID cannot be null for update");
            throw new RuntimeException("Student id cannot be null for update");
        }

        Student existingStudent = studentRepository.findById(studentDTO.getId())
            .orElseThrow(() -> {
                logger.error("Student not found with id: {}", studentDTO.getId());
                return new RuntimeException("Student not found with id: " + studentDTO.getId());
            });

        Department department = null;
        if (studentDTO.getDepartment() != null && studentDTO.getDepartment().getId() != null) {
            department = departmentRepository.findById(studentDTO.getDepartment().getId())
                .orElseThrow(() -> {
                    logger.error("Department not found with id: {}", studentDTO.getDepartment().getId());
                    return new RuntimeException("Department not found with id: " + studentDTO.getDepartment().getId());
                });
            logger.debug("Found department: {}", department.getName());
        } else {
            logger.error("Department ID is missing in the request DTO for student update");
            throw new RuntimeException("Department ID cannot be null for student update");
        }

        Semester semester = null;
        if (studentDTO.getSemester() != null && studentDTO.getSemester().getId() != null) {
            semester = semesterRepository.findById(studentDTO.getSemester().getId())
                .orElseThrow(() -> {
                    logger.error("Semester not found with id: {}", studentDTO.getSemester().getId());
                    return new RuntimeException("Semester not found with id: " + studentDTO.getSemester().getId());
                });
            logger.debug("Found semester: {}", semester.getName());
        } else {
            logger.error("Semester ID is missing in the request DTO for student update");
            throw new RuntimeException("Semester ID cannot be null for student update");
        }

        existingStudent.setFullName(studentDTO.getFullName());
        existingStudent.setStudentId(studentDTO.getStudentId());
        existingStudent.setEmail(studentDTO.getEmail());
        existingStudent.setDepartment(department);
        existingStudent.setSemester(semester);

        try {
            Student updatedStudent = studentRepository.save(existingStudent);
            logger.info("Successfully updated student with ID: {}", updatedStudent.getId());
            return StudentMapper.toDTO(updatedStudent);
        } catch (Exception e) {
            logger.error("Error saving updated student with ID: {}", studentDTO.getId(), e);
            throw new RuntimeException("Failed to update student: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    @Override
    public StudentDTO findByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId);
        if (student == null) {
            throw new RuntimeException("Student not found with studentId: " + studentId);
        }
        return StudentMapper.toDTO(student);
    }

    @Override
    public List<StudentDTO> getStudentsByDepartmentName(String departmentName) {
        Department department = departmentRepository.findByName(departmentName)
            .orElseThrow(() -> new RuntimeException("Department not found with name: " + departmentName));
            
        return studentRepository.findByDepartment(department).stream()
            .map(StudentMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByDepartmentAndSemester(String departmentName, Long semesterId) {
        List<Student> students = studentRepository.findByDepartmentNameAndSemesterId(departmentName, semesterId);
        return students.stream()
                .map(StudentMapper::toDTO)
                .collect(Collectors.toList());
    }
}