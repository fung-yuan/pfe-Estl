package com.pfe.estl.controller;

import com.pfe.estl.dto.DepartmentDTO;
import com.pfe.estl.dto.NLQueryRequest;
import com.pfe.estl.dto.NLQueryResponse;
import com.pfe.estl.dto.SemesterDTO;
import com.pfe.estl.dto.StudentDTO;
import com.pfe.estl.model.AttendanceRecord;
import com.pfe.estl.model.Student;
import com.pfe.estl.service.NaturalLanguageQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for natural language search functionality
 */
@RestController
@RequestMapping("/api/search")
public class NaturalLanguageSearchController {
    private static final Logger logger = LoggerFactory.getLogger(NaturalLanguageSearchController.class);
    
    private final NaturalLanguageQueryService queryService;
    
    @Autowired
    public NaturalLanguageSearchController(NaturalLanguageQueryService queryService) {
        this.queryService = queryService;
    }
    
    /**
     * Endpoint for natural language search
     * 
     * @param request The natural language query request
     * @return Response with matching students and a summary
     */
    @PostMapping("/natural")
    public ResponseEntity<NLQueryResponse> naturalLanguageSearch(@RequestBody NLQueryRequest request) {
        logger.info("Received natural language query: {}", request.getQuery());
        
        try {
            // Validate the query
            if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new NLQueryResponse(new ArrayList<>(), 
                    "Please provide a valid search query.", 
                    request.getQuery(),
                    null)
                );
            }
            
            // Process the natural language query
            Map<String, Object> queryResult = queryService.processNaturalLanguageQuery(request.getQuery());
            
            // Extract students and JPQL query from result
            @SuppressWarnings("unchecked")
            List<Student> students = (List<Student>) queryResult.get("students");
            String jpqlQuery = (String) queryResult.get("jpqlQuery");
            
            if (students == null) {
                students = new ArrayList<>();
            }
            
            // Debug logging for zero absence query
            if (request.getQuery().toLowerCase().contains("0 absence") || 
                request.getQuery().toLowerCase().contains("zero absence")) {
                logger.info("Zero absence query - controller received {} students from service", students.size());
                for (Student student : students) {
                    logger.info("Controller received zero absence student: ID={}, Name={}, StudentID={}", 
                               student.getId(), student.getFullName(), student.getStudentId());
                }
            }
            
            // Convert students to DTOs
            List<StudentDTO> studentDTOs = convertToDTO(students);
            
            // More debug logging after conversion
            if (request.getQuery().toLowerCase().contains("0 absence") || 
                request.getQuery().toLowerCase().contains("zero absence")) {
                logger.info("Zero absence query - after DTO conversion: {} DTOs", studentDTOs.size());
                for (StudentDTO dto : studentDTOs) {
                    logger.info("Zero absence DTO: ID={}, Name={}, StudentID={}, AbsenceCount={}", 
                               dto.getId(), dto.getFullName(), dto.getStudentId(), dto.getAbsenceCount());
                }
            }
            
            // Generate a natural language summary of the results
            String summary = queryService.generateResultsSummary(students, request.getQuery());
            
            // Create the response
            NLQueryResponse response = new NLQueryResponse(studentDTOs, summary, request.getQuery(), jpqlQuery);
            
            logger.info("Found {} students matching query: {}", students.size(), request.getQuery());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing natural language query: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                new NLQueryResponse(new ArrayList<>(), 
                "Error processing your query. Please try again.", 
                request.getQuery(),
                null)
            );
        }
    }
    
    /**
     * Convert Student entities to StudentDTO objects
     * 
     * @param students List of Student entities
     * @return List of StudentDTO objects
     */
    private List<StudentDTO> convertToDTO(List<Student> students) {
        if (students == null) {
            return new ArrayList<>();
        }
        
        return students.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    private StudentDTO convertToDTO(Student student) {
        logger.info("Converting student {} to DTO", student.getFullName());
        if (student == null) {
            logger.warn("Attempted to convert a null student object.");
            return null;
        }

        List<AttendanceRecord> attendanceRecords = student.getAttendanceRecords();
        if (attendanceRecords == null) {
            logger.warn("Attendance records collection is null for student: {}", student.getFullName());
            attendanceRecords = new ArrayList<>(); // Avoid NullPointerException
        }
        logger.info("Student {} has {} attendance records", student.getFullName(), attendanceRecords.size());

        // Log details of each absence record (duration in minutes)
        logger.info("Student {} raw absence details (in minutes):", student.getFullName());
        List<Integer> absentDurationsInMinutes = new ArrayList<>();
        attendanceRecords.stream()
                .filter(record -> record != null && !record.isPresent())
                .forEach(record -> {
                    int durationInMinutes = record.getDuration();
                    absentDurationsInMinutes.add(durationInMinutes);
                    logger.info("  - Date: {}, Duration: {} minutes, Subject: {}",
                            record.getDate(),
                            durationInMinutes,
                            record.getSubject() != null ? record.getSubject().getName() : "N/A");
                    // Optional: Add logging or capping for unrealistic *minute* values here if needed
                    // e.g., if (durationInMinutes > 1440) log.warn(...);
                });

        // Calculate total absence duration in minutes
        int totalAbsenceMinutes = absentDurationsInMinutes.stream().mapToInt(Integer::intValue).sum();
        logger.info("Student {} total absence minutes: {}", student.getFullName(), totalAbsenceMinutes);

        // Convert total minutes to hours (rounding to nearest hour)
        int absenceHours = (int) Math.round((double) totalAbsenceMinutes / 60.0);
        logger.info("Student {} final calculated absence hours: {}", student.getFullName(), absenceHours);

        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setFullName(student.getFullName());
        dto.setEmail(student.getEmail());
        // Fix: Create and set DepartmentDTO
        if (student.getDepartment() != null) {
            DepartmentDTO departmentDTO = new DepartmentDTO();
            departmentDTO.setId(student.getDepartment().getId());
            departmentDTO.setName(student.getDepartment().getName());
            dto.setDepartment(departmentDTO);
        }
        // Fix: Create and set SemesterDTO
        if (student.getSemester() != null) {
            SemesterDTO semesterDTO = new SemesterDTO();
            semesterDTO.setId(student.getSemester().getId());
            semesterDTO.setName(student.getSemester().getName());
            dto.setSemester(semesterDTO);
        }
        dto.setAbsenceCount(absenceHours); // Set the final calculated hours

        return dto;
    }
}
