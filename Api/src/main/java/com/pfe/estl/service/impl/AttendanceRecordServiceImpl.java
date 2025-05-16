package com.pfe.estl.service.impl;

import com.pfe.estl.dto.AttendanceRecordDTO;
import com.pfe.estl.model.AttendanceRecord;
import com.pfe.estl.model.Department;
import com.pfe.estl.model.Student;
import com.pfe.estl.model.Subject;
import com.pfe.estl.model.Semester;
import com.pfe.estl.repository.AttendanceRecordRepository;
import com.pfe.estl.repository.DepartmentRepository;
import com.pfe.estl.repository.StudentRepository;
import com.pfe.estl.repository.SubjectRepository;
import com.pfe.estl.service.AttendanceRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AttendanceRecordServiceImpl implements AttendanceRecordService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceRecordServiceImpl.class);

    @Override
    public Map<String, Object> getDashboardStats(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get total students count
        long totalStudents = studentRepository.count();
        
        // Calculate overall average attendance rate using the existing service method
        double averageAttendanceRate = getAverageAttendance(startDate, endDate);
         
        // Get students exceeding absence threshold (9 hours is commonly used threshold)
        List<Map<String, Object>> absencesExceedingThreshold = getStudentsExceedingAbsenceThreshold(9);
        int absenceAlerts = absencesExceedingThreshold.size();
         
        // Set the stats with expected field names
        stats.put("totalStudents", totalStudents);
        stats.put("exceededAbsenceStudents", absenceAlerts); // Use key expected by frontend
        stats.put("averageAttendanceRate", averageAttendanceRate); // Add the calculated average rate
        stats.put("reportsGenerated", 0); // Add placeholder as frontend might expect it
         
        return stats;
    }

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;

    @Autowired
    public AttendanceRecordServiceImpl(
            AttendanceRecordRepository attendanceRecordRepository,
            StudentRepository studentRepository,
            DepartmentRepository departmentRepository,
            SubjectRepository subjectRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
    }

    private AttendanceRecord toEntity(AttendanceRecordDTO dto) {
        AttendanceRecord record = new AttendanceRecord();
        record.setId(dto.getId());
        record.setDate(dto.getDate());
        record.setDuration(dto.getDuration());
        record.setPresent(dto.isPresent());

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + dto.getSubjectId()));

        record.setStudent(student);
        record.setSubject(subject);
        return record;
    }

    private AttendanceRecordDTO toDTO(AttendanceRecord record) {
        AttendanceRecordDTO dto = new AttendanceRecordDTO();
        dto.setId(record.getId());
        dto.setStudentId(record.getStudent().getId());
        dto.setSubjectId(record.getSubject().getId());
        dto.setDate(record.getDate());
        dto.setDuration(record.getDuration());
        dto.setPresent(record.isPresent());
        return dto;
    }

    @Override
    public AttendanceRecordDTO saveAttendanceRecord(AttendanceRecordDTO attendanceRecordDTO) {
        AttendanceRecord record = toEntity(attendanceRecordDTO);
        record = attendanceRecordRepository.save(record);
        return toDTO(record);
    }

    @Override
    public List<AttendanceRecordDTO> saveBulkAttendanceRecords(List<AttendanceRecordDTO> records) {
        return records.stream()
                .map(this::saveAttendanceRecord)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceRecordDTO getAttendanceRecordById(Long id) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        return toDTO(record);
    }

    @Override
    public List<AttendanceRecordDTO> getAllAttendanceRecords() {
        return attendanceRecordRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDTO> getAttendanceRecordsByStudent(String studentId) {
        Student student = studentRepository.findByStudentId(studentId);
        return attendanceRecordRepository.findByStudent(student).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDTO> getAttendanceRecordsByDate(LocalDate date) {
        return attendanceRecordRepository.findByDate(date).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDTO> getAttendanceRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRecordRepository.findByDateBetween(startDate, endDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDTO> getAttendanceRecordsByStudentAndDateRange(
            String studentId, LocalDate startDate, LocalDate endDate) {
        Student student = studentRepository.findByStudentId(studentId);
        return attendanceRecordRepository.findByStudentAndDateBetween(student, startDate, endDate)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AttendanceRecordDTO updateAttendanceRecord(AttendanceRecordDTO attendanceRecordDTO) {
        if (attendanceRecordDTO.getId() == null) {
            throw new RuntimeException("Attendance record ID cannot be null for update");
        }
        AttendanceRecord record = toEntity(attendanceRecordDTO);
        record = attendanceRecordRepository.save(record);
        return toDTO(record);
    }

    @Override
    public void deleteAttendanceRecord(Long id) {
        attendanceRecordRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getDepartmentStatistics(String departmentName, LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> records = attendanceRecordRepository
                .findByStudentDepartmentNameAndDateBetween(departmentName, startDate, endDate);

        long totalRecords = records.size();
        long presentCount = records.stream().filter(AttendanceRecord::isPresent).count();
        double attendanceRate = totalRecords > 0 ? (double) presentCount / totalRecords * 100 : 0;

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("departmentName", departmentName);
        statistics.put("startDate", startDate);
        statistics.put("endDate", endDate);
        statistics.put("totalClasses", totalRecords);
        statistics.put("presentCount", presentCount);
        statistics.put("attendanceRate", String.format("%.2f%%", attendanceRate));

        return statistics;
    }

    @Override
    public Map<String, Object> getStudentStatistics(String studentId, LocalDate startDate, LocalDate endDate) {
        Student student = studentRepository.findByStudentId(studentId);
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentAndDateBetween(
                student, startDate, endDate);

        long totalClasses = records.size();
        long presentCount = records.stream().filter(AttendanceRecord::isPresent).count();
        double attendanceRate = totalClasses > 0 ? (double) presentCount / totalClasses * 100 : 0;
        int totalHours = records.stream()
                .filter(AttendanceRecord::isPresent)
                .mapToInt(AttendanceRecord::getDuration)
                .sum() / 60;

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("studentName", student.getFullName());
        statistics.put("studentId", studentId);
        statistics.put("totalClasses", totalClasses);
        statistics.put("presentCount", presentCount);
        statistics.put("attendanceRate", String.format("%.2f%%", attendanceRate));
        statistics.put("totalHoursAttended", totalHours);

        return statistics;
    }

    @Override
    public Map<String, List<AttendanceRecordDTO>> getDailyAttendanceReport(LocalDate date) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByDate(date);

        return records.stream()
                .map(this::toDTO)
                .collect(Collectors.groupingBy(record -> String.valueOf(record.getStudentId())));
    }

    @Override
    public List<Map<String, Object>> getStudentsExceedingAbsenceThreshold(int thresholdHours) {
        List<Student> allStudents = studentRepository.findAll();
        return allStudents.stream()
                .map(student -> {
                    int totalAbsenceHours = calculateTotalAbsenceHours(student);
                    if (totalAbsenceHours >= thresholdHours) {
                        Map<String, Object> report = new HashMap<>();
                        report.put("studentName", student.getFullName());
                        report.put("studentId", student.getStudentId());
                        report.put("departmentName", student.getDepartment().getName());
                        report.put("totalAbsenceHours", totalAbsenceHours);
                        return report;
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getStudentAbsenceHours(String studentId) {
        try {
            Student student = studentRepository.findByStudentId(studentId);
            if (student == null) {
                Map<String, Object> errorReport = new HashMap<>();
                errorReport.put("error", "Student not found");
                errorReport.put("studentId", studentId);
                errorReport.put("totalAbsenceHours", 0); // Always include this field
                return errorReport;
            }
            int totalAbsenceHours = calculateTotalAbsenceHours(student);
            Map<String, Object> report = new HashMap<>();
            report.put("studentName", student.getFullName());
            report.put("studentId", studentId);
            report.put("departmentName", student.getDepartment().getName());
            report.put("semesterName", student.getSemester().getName());
            report.put("totalAbsenceHours", totalAbsenceHours);
            report.put("exceedsThreshold", totalAbsenceHours >= 9);
            return report;
        } catch (Exception e) {
            // Log the error
            e.printStackTrace();
            // Return a meaningful error response
            Map<String, Object> errorReport = new HashMap<>();
            errorReport.put("error", "Failed to retrieve student absence hours");
            errorReport.put("message", e.getMessage());
            errorReport.put("studentId", studentId);
            errorReport.put("totalAbsenceHours", 0); // Always include this field
            return errorReport;
        }
    }

    private int calculateTotalAbsenceHours(Student student) {
        List<AttendanceRecord> absences = attendanceRecordRepository.findByStudent(student)
                .stream()
                .filter(record -> !record.isPresent())
                .collect(Collectors.toList());

        // Debug log to verify absences are being found
        logger.info("Found " + absences.size() + " absence records for student " + student.getId());
        
        // Log individual absence records to verify durations
        absences.forEach(absence -> 
            logger.info("Absence record: date=" + absence.getDate() + 
                       ", duration=" + absence.getDuration() + 
                       ", subject=" + absence.getSubject().getName())
        );

        int totalMinutes = absences.stream()
                .mapToInt(AttendanceRecord::getDuration)
                .sum();
                
        logger.info("Total absence minutes: " + totalMinutes + ", hours: " + (totalMinutes / 60));
        
        return totalMinutes / 60; // Convert minutes to hours
    }

    @Override
    public List<Map<String, Object>> getAbsenceReport(LocalDate startDate, LocalDate endDate) {
        // Get all students
        List<Student> allStudents = studentRepository.findAll();
        
        return allStudents.stream()
                .map(student -> {
                    // Get all absence records for this student in the date range
                    List<AttendanceRecord> absences = attendanceRecordRepository
                            .findByStudentAndDateBetween(student, startDate, endDate)
                            .stream()
                            .filter(record -> !record.isPresent())
                            .collect(Collectors.toList());

                    int totalMinutes = absences.stream()
                            .mapToInt(AttendanceRecord::getDuration)
                            .sum();

                    Map<String, Object> report = new HashMap<>();
                    report.put("studentName", student.getFullName());
                    report.put("studentId", student.getStudentId());
                    report.put("departmentName", student.getDepartment().getName());
                    report.put("totalAbsenceHours", totalMinutes / 60);
                    report.put("absenceDates", absences.stream()
                            .map(AttendanceRecord::getDate)
                            .collect(Collectors.toList()));
                    return report;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getAbsenceReport(LocalDate startDate, LocalDate endDate,
            String departmentId, String semesterId, String subjectId, boolean showExceededOnly) {

        logger.info("Generating absence report from {} to {} for Dept: {}, Sem: {}, Sub: {}, ExceededOnly: {}",
            startDate, endDate, departmentId, semesterId, subjectId, showExceededOnly);

        List<Student> students;
        try {
            if ("all".equals(departmentId)) {
                students = studentRepository.findAll();
            } else {
                // Validate departmentId format before parsing
                long deptId = Long.parseLong(departmentId);
                Department department = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + deptId));
                students = studentRepository.findByDepartment(department);
            }
        } catch (NumberFormatException e) {
             logger.error("Invalid departmentId format: {}", departmentId, e);
             throw new IllegalArgumentException("Invalid department ID format: " + departmentId);
        } catch (RuntimeException e) {
             logger.error("Error fetching students for report: {}", e.getMessage(), e);
             throw e; // Re-throw other runtime exceptions
        }


        Stream<Map<String, Object>> reportStream = students.stream()
                .map(student -> {
                    try {
                        List<AttendanceRecord> absences = attendanceRecordRepository
                                .findByStudentAndDateBetween(student, startDate, endDate)
                                .stream()
                                .filter(record -> {
                                    // --- Robust Filtering ---
                                    if (record == null || record.isPresent()) {
                                        return false; // Skip present records or null records
                                    }

                                    Subject recordSubject = record.getSubject();
                                    Semester recordSemester = (recordSubject != null) ? recordSubject.getSemester() : null;

                                    boolean matchesSemester = "all".equals(semesterId) ||
                                        (recordSemester != null && recordSemester.getId() != null &&
                                         recordSemester.getId().toString().equals(semesterId));

                                    boolean matchesSubject = "all".equals(subjectId) ||
                                        (recordSubject != null && recordSubject.getId() != null &&
                                         recordSubject.getId().toString().equals(subjectId));

                                    return matchesSemester && matchesSubject;
                                    // --- End Robust Filtering ---
                                })
                                .collect(Collectors.toList());

                        int totalMinutes = absences.stream()
                                .filter(Objects::nonNull) // Ensure record is not null
                                .mapToInt(record -> record.getDuration() != null ? record.getDuration() : 0) // Handle null duration
                                .sum();
                        int totalHours = totalMinutes / 60;

                        Map<String, Object> report = new HashMap<>();
                        report.put("studentName", student.getFullName());
                        report.put("studentId", student.getStudentId());
                        // Safely get department name
                        report.put("departmentName", student.getDepartment() != null ? student.getDepartment().getName() : "N/A");
                        report.put("totalAbsenceHours", totalHours);
                        return report;
                    } catch (Exception e) {
                         logger.error("Error processing student {} for report: {}", student.getId(), e.getMessage(), e);
                         return null; // Return null if processing fails for one student
                    }
                })
                .filter(Objects::nonNull); // Filter out any null maps caused by errors

        if (showExceededOnly) {
            logger.info("Applying 'showExceededOnly' filter (threshold >= 9 hours).");
            reportStream = reportStream.filter(report -> {
                Object hoursObj = report.get("totalAbsenceHours");
                boolean shouldKeep = false;
                if (hoursObj instanceof Number) {
                    int hours = ((Number) hoursObj).intValue();
                    shouldKeep = hours >= 9;
                    logger.debug("Filtering student '{}': Hours = {}, Keep = {}", report.get("studentId"), hours, shouldKeep);
                } else {
                    logger.warn("Filtering student '{}': Unexpected type for totalAbsenceHours: {}", report.get("studentId"), (hoursObj != null ? hoursObj.getClass().getName() : "null"));
                }
                return shouldKeep;
            });
        } else {
             logger.info("Skipping 'showExceededOnly' filter.");
        }

        List<Map<String, Object>> finalReport = reportStream.collect(Collectors.toList());
        logger.info("Generated report with {} entries after filtering.", finalReport.size());
        return finalReport;
    }

    @Override
    public double getAverageAttendance(LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByDateBetween(startDate, endDate);
        long totalRecords = records.size();
        long presentCount = records.stream().filter(AttendanceRecord::isPresent).count();
        return totalRecords > 0 ? (double) presentCount / totalRecords * 100 : 0;
    }

    @Override
    public double getDepartmentAverageAttendance(String departmentName, LocalDate startDate, LocalDate endDate) {
        List<AttendanceRecord> records = attendanceRecordRepository
                .findByStudentDepartmentNameAndDateBetween(departmentName, startDate, endDate);

        long totalRecords = records.size();
        long presentCount = records.stream().filter(AttendanceRecord::isPresent).count();
        return totalRecords > 0 ? (double) presentCount / totalRecords * 100 : 0;
    }

    @Override
    public List<AttendanceRecordDTO> getRecentAttendanceRecords(int limit) {
        return attendanceRecordRepository.findAll().stream()
                .map(this::toDTO)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getDepartmentComparison(LocalDate startDate, LocalDate endDate) {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream()
                .map(department -> {
                    double averageAttendance = getDepartmentAverageAttendance(department.getName(), startDate, endDate);
                    Map<String, Object> comparison = new HashMap<>();
                    comparison.put("departmentName", department.getName());
                    comparison.put("averageAttendance", (int) Math.round(averageAttendance)); // Convert to integer
                    return comparison;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDTO> getAttendanceRecordsByDepartment(String departmentName) {
        // Fetch attendance records by department name using the repository
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentDepartmentName(departmentName);

        // Convert the list of AttendanceRecord entities to AttendanceRecordDTOs
        return records.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Integer getStudentTotalAbsenceHours(Long studentId) {
        try {
            // First, check if the student exists
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (!studentOpt.isPresent()) {
                logger.warn("Student with ID " + studentId + " not found");
                return 0;
            }
            
            // Use the repository method to calculate total absence hours
            Integer hours = attendanceRecordRepository.calculateTotalAbsenceHoursByStudentId(studentId);
            
            // Debug log to verify the calculation
            logger.info("Calculated absence hours for student " + studentId + ": " + hours);
            
            return hours != null ? hours : 0;
        } catch (Exception e) {
            logger.error("Error calculating absence hours for student " + studentId, e);
            return 0;
        }
    }
}