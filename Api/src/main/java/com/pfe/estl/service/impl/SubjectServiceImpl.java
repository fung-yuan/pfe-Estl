package com.pfe.estl.service.impl;

import com.pfe.estl.dto.SubjectDTO;
import com.pfe.estl.model.Department;
import com.pfe.estl.model.Semester;
import com.pfe.estl.model.Subject;
import com.pfe.estl.repository.DepartmentRepository;
import com.pfe.estl.repository.SemesterRepository;
import com.pfe.estl.repository.SubjectRepository;
import com.pfe.estl.service.SubjectService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;

    public SubjectServiceImpl(
            SubjectRepository subjectRepository,
            DepartmentRepository departmentRepository,
            SemesterRepository semesterRepository) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.semesterRepository = semesterRepository;
    }

    @Override
    public List<SubjectDTO> getSubjectsByDepartmentAndSemester(String departmentName, Long semesterId) {
        List<Subject> subjects = subjectRepository.findByDepartmentNameAndSemesterId(departmentName, semesterId);
        return subjects.stream()
                .map(subject -> {
                    SubjectDTO dto = new SubjectDTO();
                    dto.setId(subject.getId());
                    dto.setName(subject.getName());
                    dto.setCode(subject.getCode());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectDTO> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        return subjects.stream()
                .map(subject -> {
                    SubjectDTO dto = new SubjectDTO();
                    dto.setId(subject.getId());
                    dto.setName(subject.getName());
                    dto.setCode(subject.getCode());
                    // Map department and semester if they exist in Subject entity and DTO
                    if (subject.getDepartment() != null) {
                        SubjectDTO.DepartmentInfo deptInfo = new SubjectDTO.DepartmentInfo();
                        deptInfo.setId(subject.getDepartment().getId());
                        deptInfo.setName(subject.getDepartment().getName());
                        dto.setDepartment(deptInfo);
                    }
                    if (subject.getSemester() != null) {
                        SubjectDTO.SemesterInfo semInfo = new SubjectDTO.SemesterInfo();
                        semInfo.setId(subject.getSemester().getId());
                        semInfo.setName(subject.getSemester().getName()); // Assuming Semester has a name
                        dto.setSemester(semInfo);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        // Create a new Subject entity
        Subject subject = new Subject();
        subject.setName(subjectDTO.getName());
        subject.setCode(subjectDTO.getCode());
        
        // Set department if provided
        if (subjectDTO.getDepartment() != null && subjectDTO.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(subjectDTO.getDepartment().getId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + subjectDTO.getDepartment().getId()));
            subject.setDepartment(department);
        }
        
        // Set semester if provided
        if (subjectDTO.getSemester() != null && subjectDTO.getSemester().getId() != null) {
            Semester semester = semesterRepository.findById(subjectDTO.getSemester().getId())
                .orElseThrow(() -> new RuntimeException("Semester not found with id: " + subjectDTO.getSemester().getId()));
            subject.setSemester(semester);
        }
        
        // Save the new subject
        Subject savedSubject = subjectRepository.save(subject);
        
        // Convert back to DTO and return
        SubjectDTO savedDTO = new SubjectDTO();
        savedDTO.setId(savedSubject.getId());
        savedDTO.setName(savedSubject.getName());
        savedDTO.setCode(savedSubject.getCode());
        
        // Set department info
        if (savedSubject.getDepartment() != null) {
            SubjectDTO.DepartmentInfo deptInfo = new SubjectDTO.DepartmentInfo();
            deptInfo.setId(savedSubject.getDepartment().getId());
            deptInfo.setName(savedSubject.getDepartment().getName());
            savedDTO.setDepartment(deptInfo);
        }
        
        // Set semester info
        if (savedSubject.getSemester() != null) {
            SubjectDTO.SemesterInfo semInfo = new SubjectDTO.SemesterInfo();
            semInfo.setId(savedSubject.getSemester().getId());
            semInfo.setName(savedSubject.getSemester().getName());
            savedDTO.setSemester(semInfo);
        }
        
        return savedDTO;
    }

    @Override
    public void deleteSubject(Long id) {
        // Optional: Add check to see if subject exists before deleting
        // if (!subjectRepository.existsById(id)) {
        //     throw new RuntimeException("Subject not found with id: " + id); // Or a custom exception
        // }
        subjectRepository.deleteById(id);
    }
}
