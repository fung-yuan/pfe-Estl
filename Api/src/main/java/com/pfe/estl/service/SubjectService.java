package com.pfe.estl.service;

import com.pfe.estl.dto.SubjectDTO;

import java.util.List;

public interface SubjectService {
    List<SubjectDTO> getSubjectsByDepartmentAndSemester(String departmentName, Long semesterId);
    List<SubjectDTO> getAllSubjects();
    void deleteSubject(Long id);
    SubjectDTO createSubject(SubjectDTO subjectDTO);
}
