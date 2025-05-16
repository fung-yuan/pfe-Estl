package com.pfe.estl.repository;

import com.pfe.estl.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    
    // --- Corrected Query ---
    // Find distinct semesters that have students belonging to the specified department name.
    @Query("SELECT DISTINCT s FROM Semester s JOIN s.students stu WHERE stu.department.name = :departmentName")
    List<Semester> findByDepartmentName(@Param("departmentName") String departmentName);
    
    // Find semester by name for Excel import functionality
    Semester findByName(String name);
}