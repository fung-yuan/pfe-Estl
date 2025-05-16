package com.pfe.estl.repository;

import com.pfe.estl.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    // This method should work if your Subject entity has department and semester relationships
    List<Subject> findByDepartmentNameAndSemesterId(String departmentName, Long semesterId);
    
    // Find if a subject with the given code already exists (for Excel import functionality)
    boolean existsByCode(String code);
    
    // Find subject by code
    Subject findByCode(String code);
}
