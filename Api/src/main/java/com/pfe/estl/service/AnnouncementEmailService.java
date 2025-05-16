package com.pfe.estl.service;

import com.pfe.estl.dto.AnnouncementDto;
import com.pfe.estl.model.Announcement;
import com.pfe.estl.model.AttendanceRecord;
import com.pfe.estl.model.AudienceType;
import com.pfe.estl.model.DeliveryType;
import com.pfe.estl.model.Student;
import com.pfe.estl.model.User;
import com.pfe.estl.repository.AnnouncementRepository;
import com.pfe.estl.repository.AttendanceRecordRepository;
import com.pfe.estl.repository.DepartmentRepository;
import com.pfe.estl.repository.StudentRepository;
import com.pfe.estl.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementEmailService {

    private final EmailService emailService;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Autowired
    public AnnouncementEmailService(
            EmailService emailService,
            StudentRepository studentRepository,
            DepartmentRepository departmentRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            AnnouncementRepository announcementRepository,
            UserRepository userRepository) {
        this.emailService = emailService;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
    }

    /**
     * Send an announcement to all students
     * @return number of students who received the email
     */
    public int sendAnnouncementToAllStudents(AnnouncementDto announcementDto) {
        List<Student> students = studentRepository.findAll();
        return sendAnnouncementToStudents(announcementDto, students);
    }

    /**
     * Send an announcement to students in a specific department
     * @return number of students who received the email
     */
    public int sendAnnouncementByDepartment(AnnouncementDto announcementDto, Long departmentId) {
        // We still verify the department exists but don't need to store it
        departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));
        
        List<Student> students = studentRepository.findByDepartmentId(departmentId);
        return sendAnnouncementToStudents(announcementDto, students);
    }

    /**
     * Send an announcement to students in a specific semester
     * @return number of students who received the email
     */
    public int sendAnnouncementBySemester(AnnouncementDto announcementDto, Long semesterId) {
        List<Student> students = studentRepository.findBySemesterId(semesterId);
        return sendAnnouncementToStudents(announcementDto, students);
    }

    /**
     * Send an announcement to students who were absent in a specific date range
     * @return number of students who received the email
     */
    public int sendAnnouncementByAbsenceDateRange(
            AnnouncementDto announcementDto, 
            LocalDate startDate, 
            LocalDate endDate) {
        
        List<AttendanceRecord> allRecords = attendanceRecordRepository
                .findByDateBetween(
                    startDate, 
                    endDate);
        
        // Filter to only get records where the student was absent (isPresent = false)
        List<Student> absentStudents = allRecords.stream()
                .filter(record -> !record.isPresent())
                .map(AttendanceRecord::getStudent)
                .distinct()
                .collect(Collectors.toList());
        
        return sendAnnouncementToStudents(announcementDto, absentStudents);
    }

    /**
     * Send an announcement to students who have absences above a threshold
     * @return number of students who received the email
     */
    public int sendAnnouncementByAbsenceThreshold(AnnouncementDto announcementDto, int absenceThreshold) {
        List<Student> studentsAboveThreshold = attendanceRecordRepository
                .findStudentsWithAbsenceCountAboveThreshold(absenceThreshold);
        
        return sendAnnouncementToStudents(announcementDto, studentsAboveThreshold);
    }

    /**
     * Send an announcement to students based on combined filter criteria
     * Allows applying multiple filters simultaneously
     * @return number of students who received the email
     */
    public int sendAnnouncementWithCombinedFilters(
            AnnouncementDto announcementDto,
            Long departmentId,
            Long semesterId,
            Integer absenceThreshold,
            LocalDate startDate,
            LocalDate endDate) {
        
        // Start with all students or filtered by basic criteria
        List<Student> filteredStudents;
        
        // Apply department and semester filters first if specified
        if (departmentId != null && semesterId != null) {
            // Filter by both department and semester
            filteredStudents = studentRepository.findByDepartmentIdAndSemesterId(departmentId, semesterId);
        } else if (departmentId != null) {
            // Filter by department only
            filteredStudents = studentRepository.findByDepartmentId(departmentId);
        } else if (semesterId != null) {
            // Filter by semester only
            filteredStudents = studentRepository.findBySemesterId(semesterId);
        } else {
            // No department or semester filters, get all students
            filteredStudents = studentRepository.findAll();
        }
        
        // If we have no students after basic filtering, return early
        if (filteredStudents.isEmpty()) {
            return 0;
        }
        
        // Apply absence date range filter if specified
        if (startDate != null && endDate != null) {
            List<AttendanceRecord> absenceRecords = attendanceRecordRepository
                    .findByStatusAndDateBetween(startDate, endDate);
            
            // Get student IDs who were absent in the date range
            List<Long> absentStudentIds = absenceRecords.stream()
                    .map(record -> record.getStudent().getId())
                    .distinct()
                    .collect(Collectors.toList());
            
            // Filter the student list to only include those with absences in the range
            if (!absentStudentIds.isEmpty()) {
                filteredStudents = filteredStudents.stream()
                        .filter(student -> absentStudentIds.contains(student.getId()))
                        .collect(Collectors.toList());
            } else {
                // If no students were absent in the range, we have an empty result
                return 0;
            }
        }
        
        // Apply absence threshold filter if specified
        if (absenceThreshold != null && absenceThreshold > 0) {
            List<Student> studentsAboveThreshold = attendanceRecordRepository
                    .findStudentsWithAbsenceCountAboveThreshold(absenceThreshold);
            
            // Get IDs of students above threshold
            List<Long> studentsAboveThresholdIds = studentsAboveThreshold.stream()
                    .map(Student::getId)
                    .collect(Collectors.toList());
            
            // Filter the student list to only include those above the threshold
            filteredStudents = filteredStudents.stream()
                    .filter(student -> studentsAboveThresholdIds.contains(student.getId()))
                    .collect(Collectors.toList());
        }
        
        // Send the announcement to the filtered list of students
        return sendAnnouncementToStudents(announcementDto, filteredStudents);
    }

    /**
     * Helper method to send an announcement to a list of students
     * @return number of students who received the email
     */
    private int sendAnnouncementToStudents(AnnouncementDto announcementDto, List<Student> students) {
        if (students.isEmpty()) {
            return 0;
        }
        
        // Prepare the HTML content for the email
        String htmlContent = formatAnnouncementAsHtml(announcementDto);
        
        // Extract student emails
        List<String> recipientEmails = students.stream()
                .map(Student::getEmail)
                .collect(Collectors.toList());
        
        try {
            // Send the emails
            emailService.sendBulkHtmlEmail(recipientEmails, announcementDto.getTitle(), htmlContent);
            
            // Record announcement in the database
            Announcement announcement = new Announcement();
            announcement.setTitle(announcementDto.getTitle());
            announcement.setContent(announcementDto.getContent());
            announcement.setPublished(true);
            announcement.setDeliveryType(DeliveryType.EMAIL);
            announcement.setEmailSent(true);
            announcement.setEmailSentAt(LocalDateTime.now());
            announcement.setPublishedAt(LocalDateTime.now());
            
            // Get the currently authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current authenticated user not found"));
            
            announcement.setAuthor(currentUser);
            announcement.setTargetAudienceType(AudienceType.BY_ROLE);
            announcement.setTargetAudienceValue("STUDENT");
            
            // Save recipient count
            announcement.setRecipientCount(students.size());
            
            // Save the announcement
            announcementRepository.save(announcement);
            
            return students.size();
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email announcement: " + e.getMessage(), e);
        }
    }

    /**
     * Format the announcement as HTML for emails
     */
    private String formatAnnouncementAsHtml(AnnouncementDto announcementDto) {
        StringBuilder htmlBuilder = new StringBuilder();
        
        htmlBuilder.append("<!DOCTYPE html>")
                .append("<html>")
                .append("<head>")
                .append("<style>")
                .append("body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }")
                .append(".announcement-container { max-width: 600px; margin: 0 auto; background: #f9f9f9; border: 1px solid #ddd; border-radius: 5px; padding: 20px; }")
                .append(".announcement-title { color: #1a73e8; margin-top: 0; }")
                .append(".announcement-content { line-height: 1.6; }")
                .append(".announcement-footer { margin-top: 30px; font-size: 12px; color: #777; }")
                .append("</style>")
                .append("</head>")
                .append("<body>")
                .append("<div class='announcement-container'>")
                .append("<h2 class='announcement-title'>").append(announcementDto.getTitle()).append("</h2>")
                .append("<div class='announcement-content'>").append(announcementDto.getContent().replace("\n", "<br/>")).append("</div>")
                .append("<div class='announcement-footer'>")
                .append("<p>This is an official notification from ESTL.</p>")
                .append("<p>Please do not reply to this email.</p>")
                .append("</div>")
                .append("</div>")
                .append("</body>")
                .append("</html>");
        
        return htmlBuilder.toString();
    }
}
