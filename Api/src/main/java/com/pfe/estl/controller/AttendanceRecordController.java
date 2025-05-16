package com.pfe.estl.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.pfe.estl.dto.AttendanceRecordDTO;
import com.pfe.estl.repository.StudentRepository;
import com.pfe.estl.service.AttendanceRecordService;
import com.pfe.estl.service.ExcelExportService;
import com.pfe.estl.service.PdfExportService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceRecordController {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceRecordController.class);
    private final AttendanceRecordService attendanceRecordService;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    @Autowired
    public AttendanceRecordController(
            AttendanceRecordService attendanceRecordService,
            ExcelExportService excelExportService,
            PdfExportService pdfExportService,
            StudentRepository studentRepository) {
        this.attendanceRecordService = attendanceRecordService;
        this.excelExportService = excelExportService;
        this.pdfExportService = pdfExportService;
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveAttendance(@RequestBody Map<String, Object> attendanceData) {
        try {
            logger.info("Received attendance data: {}", attendanceData);
            
            // Extract data from the request
            String dateStr = (String) attendanceData.get("date");
            LocalDate date = LocalDate.parse(dateStr);
            // Note: departmentId and semesterId are available in the request but not currently used
            // Uncomment if needed later:
            // Integer departmentId = (Integer) attendanceData.get("departmentId");
            // Integer semesterId = (Integer) attendanceData.get("semesterId");
            Integer subjectId = (Integer) attendanceData.get("subjectId");
            Integer duration = (Integer) attendanceData.get("duration");
            
            // Extract attendance records array
            List<Map<String, Object>> recordsList = (List<Map<String, Object>>) attendanceData.get("records");
            
            // Process each attendance record
            List<AttendanceRecordDTO> attendanceRecords = new ArrayList<>();
            for (Map<String, Object> record : recordsList) {
                AttendanceRecordDTO dto = new AttendanceRecordDTO();
                dto.setDate(date);
                dto.setSubjectId(Long.valueOf(subjectId));
                dto.setDuration(duration);
                
                // Get student ID and presence status
                Long studentId = Long.valueOf((Integer) record.get("studentId"));
                dto.setStudentId(studentId);
                dto.setPresent((Boolean) record.get("isPresent"));
                
                attendanceRecords.add(dto);
            }
            
            // Save the attendance records to the database using the service
            List<AttendanceRecordDTO> savedRecords = attendanceRecordService.saveBulkAttendanceRecords(attendanceRecords);
            
            logger.info("Successfully saved {} attendance records", savedRecords.size());
            return ResponseEntity.ok("Successfully saved " + savedRecords.size() + " attendance records");
        } catch (Exception e) {
            logger.error("Error saving attendance data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error saving attendance: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = attendanceRecordService.getDashboardStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/department/{departmentName}/averageAttendance")
    public ResponseEntity<Double> getDepartmentAverageAttendance(
            @PathVariable String departmentName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        double averageAttendance = attendanceRecordService.getDepartmentAverageAttendance(departmentName, startDate, endDate);
        return ResponseEntity.ok(averageAttendance);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AttendanceRecordDTO>> getRecentActivity() {
        List<AttendanceRecordDTO> recentActivity = attendanceRecordService.getRecentAttendanceRecords(10);
        return ResponseEntity.ok(recentActivity);
    }

    @GetMapping("/department/comparison")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentComparison(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // If start and end dates are not provided, default to last 7 days
        if (startDate == null || endDate == null) {
            endDate = LocalDate.now();
            startDate = endDate.minus(7, ChronoUnit.DAYS);
        }

        List<Map<String, Object>> departmentComparison = attendanceRecordService.getDepartmentComparison(startDate, endDate);
        return ResponseEntity.ok(departmentComparison);
    }

    @PostMapping
    public ResponseEntity<AttendanceRecordDTO> createAttendanceRecord(
            @RequestBody AttendanceRecordDTO attendanceRecordDTO) {
        return ResponseEntity.ok(attendanceRecordService.saveAttendanceRecord(attendanceRecordDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecordDTO> getAttendanceRecord(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceRecordService.getAttendanceRecordById(id));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRecordDTO>> getAllAttendanceRecords() {
        return ResponseEntity.ok(attendanceRecordService.getAllAttendanceRecords());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRecordDTO>> getAttendanceRecordsByStudent(
            @PathVariable String studentId) {
        return ResponseEntity.ok(attendanceRecordService.getAttendanceRecordsByStudent(studentId));
    }

    @GetMapping("/department/{departmentName}")
    public ResponseEntity<List<AttendanceRecordDTO>> getAttendanceRecordsByDepartment(
            @PathVariable String departmentName) {
        return ResponseEntity.ok(attendanceRecordService.getAttendanceRecordsByDepartment(departmentName));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceRecordDTO>> getAttendanceRecordsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceRecordService.getAttendanceRecordsByDate(date));
    }

    @GetMapping("/student/{studentId}/dateRange")
    public ResponseEntity<List<AttendanceRecordDTO>> getAttendanceRecordsByStudentAndDateRange(
            @PathVariable String studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(
            attendanceRecordService.getAttendanceRecordsByStudentAndDateRange(studentId, startDate, endDate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRecordDTO> updateAttendanceRecord(
            @PathVariable Long id,
            @RequestBody AttendanceRecordDTO attendanceRecordDTO) {
        attendanceRecordDTO.setId(id);
        return ResponseEntity.ok(attendanceRecordService.updateAttendanceRecord(attendanceRecordDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendanceRecord(@PathVariable Long id) {
        attendanceRecordService.deleteAttendanceRecord(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics/department/{departmentName}")
    public ResponseEntity<Map<String, Object>> getDepartmentStatistics(
            @PathVariable String departmentName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceRecordService.getDepartmentStatistics(departmentName, startDate, endDate));
    }

    @GetMapping("/statistics/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentAttendanceStatistics(
            @PathVariable String studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceRecordService.getStudentStatistics(studentId, startDate, endDate));
    }

    @GetMapping("/report/daily/{date}")
    public ResponseEntity<Map<String, List<AttendanceRecordDTO>>> getDailyAttendanceReport(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceRecordService.getDailyAttendanceReport(date));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AttendanceRecordDTO>> createBulkAttendanceRecords(
            @RequestBody List<AttendanceRecordDTO> attendanceRecords) {
        return ResponseEntity.ok(attendanceRecordService.saveBulkAttendanceRecords(attendanceRecords));
    }

    @GetMapping("/absence/threshold")
    public ResponseEntity<List<Map<String, Object>>> getStudentsExceedingThreshold(
            @RequestParam(defaultValue = "9") int thresholdHours) {
        return ResponseEntity.ok(attendanceRecordService.getStudentsExceedingAbsenceThreshold(thresholdHours));
    }

    @GetMapping("/absence/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentAbsenceHours(
            @PathVariable String studentId) {
        return ResponseEntity.ok(attendanceRecordService.getStudentAbsenceHours(studentId));
    }

    @GetMapping("/student/{studentId}/absence-hours")
    public ResponseEntity<?> getStudentAbsenceHours(@PathVariable Long studentId) {
        try {
            // Check if student exists first
            // This may be causing the error if the student doesn't exist
            Integer totalHours = attendanceRecordService.getStudentTotalAbsenceHours(studentId);
            
            Map<String, Integer> response = new HashMap<>();
            response.put("totalAbsenceHours", totalHours != null ? totalHours : 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error for debugging
            logger.error("Error getting absence hours for student " + studentId, e);
            
            // Return a simplified error response
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve absence hours");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/export/attendance")
    public ResponseEntity<byte[]> exportAttendanceToExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        List<AttendanceRecordDTO> records;
        if (startDate != null && endDate != null) {
            // Get records for date range
            records = attendanceRecordService.getAttendanceRecordsByDateRange(startDate, endDate);
        } else {
            // Get all records
            records = attendanceRecordService.getAllAttendanceRecords();
        }
        
        byte[] excelContent = excelExportService.exportAttendanceToExcel(records);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "attendance_report.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelContent);
    }

    @GetMapping("/export/absence-report")
    public ResponseEntity<byte[]> exportAbsenceReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "all") String departmentId,
            @RequestParam(defaultValue = "all") String semesterId,
            @RequestParam(defaultValue = "all") String subjectId,
            @RequestParam(defaultValue = "false") boolean showExceededOnly) throws IOException {

        // --- Add Logging ---
        logger.info("Controller: exportAbsenceReportToExcel called with showExceededOnly = {}", showExceededOnly);

        List<Map<String, Object>> absenceReportData = attendanceRecordService.getAbsenceReport(
            startDate, endDate, departmentId, semesterId, subjectId, showExceededOnly); // Pass the received value

        // --- Add Logging ---
        logger.info("Controller: Service returned {} records for Excel export.", absenceReportData.size());

        byte[] excelContent = excelExportService.exportAbsenceReportToExcel(absenceReportData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        String filename = String.format("absence_report_%s_to_%s%s.xlsx",
            startDate, endDate, showExceededOnly ? "_exceeded_only" : "");
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelContent);
    }

    @GetMapping("/export/absence-report-pdf")
    public ResponseEntity<byte[]> exportAbsenceReportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "all") String departmentId,
            @RequestParam(defaultValue = "all") String semesterId,
            @RequestParam(defaultValue = "all") String subjectId,
            @RequestParam(defaultValue = "false") boolean showExceededOnly) throws IOException, DocumentException {

        // --- Add Logging ---
        logger.info("Controller: exportAbsenceReportPdf called with showExceededOnly = {}", showExceededOnly);

        List<Map<String, Object>> absenceReportData = attendanceRecordService.getAbsenceReport(
            startDate, endDate, departmentId, semesterId, subjectId, showExceededOnly); // Pass the received value

        // --- Add Logging ---
        logger.info("Controller: Service returned {} records for PDF export.", absenceReportData.size());

        byte[] pdfContent = pdfExportService.exportAbsenceReportToPdf(absenceReportData, startDate, endDate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = String.format("absence_report_%s_to_%s%s.pdf",
            startDate, endDate, showExceededOnly ? "_exceeded_only" : "");
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }

    @GetMapping("/report/absence")
    public ResponseEntity<List<Map<String, Object>>> getAbsenceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "all") String departmentId,
            @RequestParam(required = false, defaultValue = "all") String semesterId,
            @RequestParam(required = false, defaultValue = "all") String subjectId,
            @RequestParam(defaultValue = "false") boolean showExceededOnly) {

        // --- Add Logging ---
        logger.info("Controller: getAbsenceReport (for UI) called with showExceededOnly = {}", showExceededOnly);

        List<Map<String, Object>> absenceReport = attendanceRecordService.getAbsenceReport(
            startDate,
            endDate,
            departmentId,
            semesterId,
            subjectId,
            showExceededOnly
        );

        // --- Add Logging ---
        logger.info("Controller: Service returned {} records for UI report.", absenceReport.size());

        return ResponseEntity.ok(absenceReport);
    }

    @GetMapping("/export/student/{studentId}/absence-report")
    public ResponseEntity<byte[]> exportStudentAbsenceReportPdf(
            @PathVariable String studentId) throws IOException, DocumentException {

        try {
            // Get the student's absence records
            Map<String, Object> studentAbsence = attendanceRecordService.getStudentAbsenceHours(studentId);
            
            // Check if we got a valid response or an error
            if (studentAbsence == null) {
                throw new RuntimeException("Unable to retrieve student data: Unknown error");
            }
            
            if (studentAbsence.containsKey("error")) {
                throw new RuntimeException("Unable to retrieve student data: " + studentAbsence.get("error"));
            }
            
            List<AttendanceRecordDTO> studentRecords = attendanceRecordService.getAttendanceRecordsByStudent(studentId);
            
            // Filter to only show absence records
            List<AttendanceRecordDTO> absenceRecords = studentRecords.stream()
                    .filter(record -> !record.isPresent())
                    .collect(Collectors.toList());

            // Create a new document
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            
            // Open the document
            document.open();
            
            // Add header and logo
            document.addTitle("Student Absence Report");
            document.addAuthor("ESTL Attendance System");
            document.addCreationDate();
            
            // Add title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Student Absence Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Student info section
            Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.DARK_GRAY);
            Paragraph studentInfo = new Paragraph("Student Information", sectionFont);
            studentInfo.setSpacingAfter(10);
            document.add(studentInfo);
            
            // Student details table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20);
            
            // Style for info headers
            Font infoHeaderFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            // Style for info values
            Font infoValueFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);
            
            // Add student information rows - handle potential null values safely
            addInfoRow(infoTable, "Student Name:", 
                studentAbsence.get("studentName") != null ? studentAbsence.get("studentName").toString() : "N/A", 
                infoHeaderFont, infoValueFont);
            
            addInfoRow(infoTable, "Student ID:", 
                studentAbsence.get("studentId") != null ? studentAbsence.get("studentId").toString() : "N/A", 
                infoHeaderFont, infoValueFont);
            
            addInfoRow(infoTable, "Department:", 
                studentAbsence.get("departmentName") != null ? studentAbsence.get("departmentName").toString() : "N/A", 
                infoHeaderFont, infoValueFont);
            
            addInfoRow(infoTable, "Semester:", 
                studentAbsence.get("semesterName") != null ? studentAbsence.get("semesterName").toString() : "N/A", 
                infoHeaderFont, infoValueFont);
            
            // Safely handle the total absence hours which might be an Integer or a String
            Object totalAbsenceHoursObj = studentAbsence.get("totalAbsenceHours");
            String totalAbsenceHoursStr = "0";
            int totalAbsenceHoursInt = 0;
            
            if (totalAbsenceHoursObj != null) {
                if (totalAbsenceHoursObj instanceof Integer) {
                    totalAbsenceHoursInt = (Integer) totalAbsenceHoursObj;
                    totalAbsenceHoursStr = String.valueOf(totalAbsenceHoursInt);
                } else if (totalAbsenceHoursObj instanceof String) {
                    totalAbsenceHoursStr = (String) totalAbsenceHoursObj;
                    try {
                        totalAbsenceHoursInt = Integer.parseInt(totalAbsenceHoursStr);
                    } catch (NumberFormatException e) {
                        // Use defaults if parsing fails
                    }
                }
            }
            
            addInfoRow(infoTable, "Total Absence Hours:", totalAbsenceHoursStr, infoHeaderFont, infoValueFont);
            
            // Add threshold warning if needed
            document.add(infoTable);
            if (totalAbsenceHoursInt >= 9) {
                Font warningFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.RED);
                Paragraph warning = new Paragraph("Warning: Student has exceeded the absence threshold!", warningFont);
                warning.setSpacingBefore(10);
                warning.setSpacingAfter(20);
                document.add(warning);
            }
            
            // Add detailed absence records section
            Paragraph absenceSection = new Paragraph("Detailed Absence Records", sectionFont);
            absenceSection.setSpacingBefore(10);
            absenceSection.setSpacingAfter(10);
            document.add(absenceSection);
            
            if (absenceRecords.isEmpty()) {
                Paragraph noRecords = new Paragraph("No absence records found for this student.");
                noRecords.setSpacingAfter(20);
                document.add(noRecords);
            } else {
                // Create absence records table
                PdfPTable table = new PdfPTable(3);
                table.setWidthPercentage(100);
                table.setSpacingBefore(10);
                table.setSpacingAfter(20);
                
                try {
                    table.setWidths(new int[]{3, 5, 2});
                } catch (DocumentException e) {
                    e.printStackTrace();
                }
                
                // Table header style
                Font tableHeaderFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
                BaseColor headerColor = new BaseColor(41, 128, 185); // Blue color
                
                // Add table headers
                PdfPCell dateHeader = new PdfPCell(new Phrase("Date", tableHeaderFont));
                dateHeader.setBackgroundColor(headerColor);
                dateHeader.setPadding(8);
                dateHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
                dateHeader.setVerticalAlignment(Element.ALIGN_MIDDLE);
                
                PdfPCell subjectHeader = new PdfPCell(new Phrase("Subject ID", tableHeaderFont));
                subjectHeader.setBackgroundColor(headerColor);
                subjectHeader.setPadding(8);
                subjectHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
                subjectHeader.setVerticalAlignment(Element.ALIGN_MIDDLE);
                
                PdfPCell hoursHeader = new PdfPCell(new Phrase("Hours", tableHeaderFont));
                hoursHeader.setBackgroundColor(headerColor);
                hoursHeader.setPadding(8);
                hoursHeader.setHorizontalAlignment(Element.ALIGN_CENTER);
                hoursHeader.setVerticalAlignment(Element.ALIGN_MIDDLE);
                
                table.addCell(dateHeader);
                table.addCell(subjectHeader);
                table.addCell(hoursHeader);
                
                // Add all absence records to the table
                Font cellFont = new Font(Font.FontFamily.HELVETICA, 11);
                BaseColor altColor = new BaseColor(240, 240, 240); // Light gray for alternating rows
                
                boolean isAltRow = false;
                for (AttendanceRecordDTO record : absenceRecords) {
                    // Date cell - handle potential null safely
                    PdfPCell dateCell = new PdfPCell(new Phrase(
                        record.getDate() != null ? record.getDate().toString() : "N/A", 
                        cellFont));
                    dateCell.setPadding(7);
                    dateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    if (isAltRow) dateCell.setBackgroundColor(altColor);
                    
                    // Subject cell - handle potential null safely
                    PdfPCell subjectCell = new PdfPCell(new Phrase(
                        record.getSubjectId() != null ? record.getSubjectId().toString() : "N/A", 
                        cellFont));
                    subjectCell.setPadding(7);
                    subjectCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    if (isAltRow) subjectCell.setBackgroundColor(altColor);
                    
                    // Hours cell - handle potential null duration safely
                    int hours = 0;
                    if (record.getDuration() != null) {
                        hours = record.getDuration() / 60; // Convert minutes to hours
                    }
                    PdfPCell hoursCell = new PdfPCell(new Phrase(String.valueOf(hours), cellFont));
                    hoursCell.setPadding(7);
                    hoursCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    if (isAltRow) hoursCell.setBackgroundColor(altColor);
                    
                    table.addCell(dateCell);
                    table.addCell(subjectCell);
                    table.addCell(hoursCell);
                    
                    isAltRow = !isAltRow; // Toggle for alternating row colors
                }
                
                document.add(table);
            }
            
            // Add footer with timestamp
            Paragraph footer = new Paragraph("Generated on: " + LocalDate.now());
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);
            
            // Close the document
            document.close();
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String fileName = studentAbsence.get("studentName") != null ? 
                studentAbsence.get("studentName") + "_absence_report.pdf" : 
                "student_absence_report.pdf";
            headers.setContentDispositionFormData("attachment", fileName);
            
            // Return the PDF as a byte array
            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            // Log the error
            e.printStackTrace();
            
            // Create a simple error PDF to show the issue
            Document document = new Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, baos);
            document.open();
            document.add(new Paragraph("Error generating student absence report: " + e.getMessage()));
            document.close();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "error_report.pdf");
            
            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);
        }
    }

    // Helper method to add info rows to the table
    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}