package com.pfe.estl.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pfe.estl.model.Department;
import com.pfe.estl.model.Semester;
import com.pfe.estl.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByStudentId(String studentId);
    List<Student> findByStudentIdContaining(String studentIdPart);
    Student findByEmail(String email);
    List<Student> findByEmailContaining(String emailPart);
    List<Student> findByFullNameContainingIgnoreCase(String name);
    List<Student> findByDepartment(Department department);
    List<Student> findByDepartmentAndSemester(Department department, Semester semester);
    
    @Query("SELECT s FROM Student s WHERE s.department.name = :departmentName AND s.semester.id = :semesterId")
    List<Student> findByDepartmentNameAndSemesterId(@Param("departmentName") String departmentName, 
                                                   @Param("semesterId") Long semesterId);
    
    // Methods for email announcements
    List<Student> findBySemesterId(Long semesterId);
    
    @Query("SELECT s FROM Student s WHERE s.department.id = :departmentId")
    List<Student> findByDepartmentId(@Param("departmentId") Long departmentId);
    
    @Query("SELECT s FROM Student s WHERE s.department.id = :departmentId AND s.semester.id = :semesterId")
    List<Student> findByDepartmentIdAndSemesterId(@Param("departmentId") Long departmentId, @Param("semesterId") Long semesterId);
    
    @Query("SELECT s.email FROM Student s")
    List<String> findAllEmails();
    
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN TRUE ELSE FALSE END FROM Student s WHERE LOWER(s.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);
    
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN TRUE ELSE FALSE END FROM Student s WHERE s.studentId = :studentId")
    boolean existsByStudentId(@Param("studentId") String studentId);
}