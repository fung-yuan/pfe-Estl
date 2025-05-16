package com.pfe.estl.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pfe.estl.model.AttendanceRecord;
import com.pfe.estl.model.Student;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudent(Student student);
    List<AttendanceRecord> findByDate(LocalDate date);
    List<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<AttendanceRecord> findByStudentAndDateBetween(Student student, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM AttendanceRecord a WHERE a.student.department.name = :departmentName")
    List<AttendanceRecord> findByStudentDepartmentName(@Param("departmentName") String departmentName);
    
    @Query("SELECT a FROM AttendanceRecord a WHERE a.student.department.name = :departmentName " +
           "AND a.date BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findByStudentDepartmentNameAndDateBetween(
            @Param("departmentName") String departmentName,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    /**
     * Count the total number of attendance records for a specific student.
     * We'll use this as a simple indicator of absence hours until we have the actual field.
     * 
     * @param studentId The ID of the student
     * @return The count of attendance records (as an Integer)
     */
    @Query(value = "SELECT COUNT(*) FROM attendance_record WHERE student_id = :studentId", nativeQuery = true)
    Integer countAttendanceRecordsByStudentId(@Param("studentId") Long studentId);
    
    @Query(value = "SELECT COALESCE(SUM(duration), 0) / 60 FROM attendance_records WHERE student_reference_id = :studentId AND is_present = false", nativeQuery = true)
    Integer calculateTotalAbsenceHoursByStudentId(@Param("studentId") Long studentId);
    
    // Methods for email announcements
    
    /**
     * Find attendance records for absent students within a date range
     */
    @Query("SELECT a FROM AttendanceRecord a WHERE a.isPresent = false AND a.date BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findByStatusAndDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
            
    /**
     * Count attendance records by student and presence status
     */
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.student = :student AND a.isPresent = false")
    Long countByStudentAndStatus(@Param("student") Student student);
    
    /**
     * Find students who have absence count above threshold
     */
    @Query("SELECT a.student FROM AttendanceRecord a WHERE a.isPresent = false GROUP BY a.student HAVING COUNT(a) >= :threshold")
    List<Student> findStudentsWithAbsenceCountAboveThreshold(@Param("threshold") int threshold);
}