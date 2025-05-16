package com.pfe.estl.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.pfe.estl.dto.AttendanceRecordDTO;

public interface AttendanceRecordService {
    AttendanceRecordDTO saveAttendanceRecord(AttendanceRecordDTO attendanceRecordDTO);
    AttendanceRecordDTO getAttendanceRecordById(Long id);
    List<AttendanceRecordDTO> getAllAttendanceRecords();
    List<AttendanceRecordDTO> getAttendanceRecordsByStudent(String studentId);
    List<AttendanceRecordDTO> getAttendanceRecordsByDepartment(String departmentName);
    List<AttendanceRecordDTO> getAttendanceRecordsByDate(LocalDate date);
    List<AttendanceRecordDTO> getAttendanceRecordsByStudentAndDateRange(
        String studentId, LocalDate startDate, LocalDate endDate);
    List<AttendanceRecordDTO> getAttendanceRecordsByDateRange(LocalDate startDate, LocalDate endDate);
    AttendanceRecordDTO updateAttendanceRecord(AttendanceRecordDTO attendanceRecordDTO);
    void deleteAttendanceRecord(Long id);
    Map<String, Object> getDepartmentStatistics(String departmentName, LocalDate startDate, LocalDate endDate);
    Map<String, Object> getStudentStatistics(String studentId, LocalDate startDate, LocalDate endDate);
    
    Map<String, List<AttendanceRecordDTO>> getDailyAttendanceReport(LocalDate date);
    List<AttendanceRecordDTO> saveBulkAttendanceRecords(List<AttendanceRecordDTO> records);
    
    List<Map<String, Object>> getStudentsExceedingAbsenceThreshold(int thresholdHours);
    Map<String, Object> getStudentAbsenceHours(String studentId);
    List<Map<String, Object>> getAbsenceReport(LocalDate startDate, LocalDate endDate);
    List<Map<String, Object>> getAbsenceReport(LocalDate startDate, LocalDate endDate, 
        String departmentId, String semesterId, String subjectId, boolean showExceededOnly);

    double getAverageAttendance(LocalDate startDate, LocalDate endDate);
    double getDepartmentAverageAttendance(String departmentName, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecordDTO> getRecentAttendanceRecords(int limit);

    List<Map<String, Object>> getDepartmentComparison(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getDashboardStats(LocalDate startDate, LocalDate endDate);

    Integer getStudentTotalAbsenceHours(Long studentId);
}