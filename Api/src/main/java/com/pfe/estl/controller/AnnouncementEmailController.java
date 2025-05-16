package com.pfe.estl.controller;

import com.pfe.estl.dto.EmailAnnouncementDto;
import com.pfe.estl.dto.AnnouncementDto;
import com.pfe.estl.service.AnnouncementEmailService;
import com.pfe.estl.service.EmailService;
import com.pfe.estl.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/email-announcements")
@PreAuthorize("hasRole('ADMIN')")
public class AnnouncementEmailController {

    private static final Logger logger = LoggerFactory.getLogger(AnnouncementEmailController.class);
    private final AnnouncementEmailService announcementEmailService;
    private final EmailService emailService;
    private final StudentRepository studentRepository;

    @Autowired
    public AnnouncementEmailController(AnnouncementEmailService announcementEmailService, 
                                     EmailService emailService,
                                     StudentRepository studentRepository) {
        this.announcementEmailService = announcementEmailService;
        this.emailService = emailService;
        this.studentRepository = studentRepository;
    }

    /**
     * Send an email announcement to students based on the specified filter criteria
     * Supports combined filtering options
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendEmailAnnouncement(@RequestBody EmailAnnouncementDto emailAnnouncementDto) {
        try {
            logger.info("Received email announcement request: {}", emailAnnouncementDto);
            
            // Create AnnouncementDto from EmailAnnouncementDto
            AnnouncementDto announcementDto = new AnnouncementDto();
            announcementDto.setTitle(emailAnnouncementDto.getTitle());
            announcementDto.setContent(emailAnnouncementDto.getContent());
            
            logger.info("Created announcement DTO with title: {}", announcementDto.getTitle());
            
            // Get filter options
            EmailAnnouncementDto.FilterOptions filterOptions = emailAnnouncementDto.getFilterOptions();
            
            // If no filter options provided, default to all students
            if (filterOptions == null) {
                logger.info("No filter options provided, sending to all students");
                int recipientCount = announcementEmailService.sendAnnouncementToAllStudents(announcementDto);
                return createSuccessResponse(recipientCount);
            }
            
            // Apply combined filters
            Long departmentId = filterOptions.getDepartmentId();
            Long semesterId = filterOptions.getSemesterId();
            Integer absenceThreshold = filterOptions.getAbsenceThreshold();
            LocalDate startDate = filterOptions.getStartDate();
            LocalDate endDate = filterOptions.getEndDate();
            
            logger.info("Filter options: departmentId={}, semesterId={}, absenceThreshold={}, startDate={}, endDate={}",
                    departmentId, semesterId, absenceThreshold, startDate, endDate);
            
            try {
                // Build dynamic query based on filter combinations
                int recipientCount = announcementEmailService.sendAnnouncementWithCombinedFilters(
                    announcementDto,
                    departmentId,
                    semesterId,
                    absenceThreshold,
                    startDate,
                    endDate
                );
                
                logger.info("Successfully sent announcement to {} recipients", recipientCount);
                return createSuccessResponse(recipientCount);
            } catch (Exception e) {
                logger.error("Error in service layer when sending announcement with combined filters", e);
                throw e;
            }
            
        } catch (Exception e) {
            logger.error("Failed to send email announcement", e);
            return ResponseEntity.internalServerError()
                    .body("Failed to send email announcement: " + e.getMessage());
        }
    }
    
    @GetMapping("/test-smtp")
    public ResponseEntity<?> testSmtpConnection() {
        try {
            // Try sending a test email to yourself
            emailService.sendSimpleEmail(
                "khalidharrat678@gmail.com", 
                "SMTP Test", 
                "This is a test email from the ESTL application"
            );
            return ResponseEntity.ok("Test email sent successfully");
        } catch (Exception e) {
            logger.error("SMTP test failed", e);
            return ResponseEntity.status(500)
                .body("SMTP test failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/verify-email/{email:.+}")
    public ResponseEntity<?> checkEmailExistence(@PathVariable String email) {
        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body("Email parameter is required");
            }
            
            boolean exists = studentRepository.existsByEmail(email);
            
            if (!exists) {
                logger.warn("Email not found in database: {}", email);
            }
            
            return ResponseEntity.ok(Map.of(
                "email", email,
                "exists", exists
            ));
        } catch (Exception e) {
            logger.error("Error verifying email existence", e);
            return ResponseEntity.internalServerError().body("Error checking email existence");
        }
    }
    
    @GetMapping("/debug-emails")
    public ResponseEntity<?> debugEmails() {
        try {
            List<String> allEmails = studentRepository.findAllEmails();
            return ResponseEntity.ok(Map.of(
                "count", allEmails.size(),
                "emails", allEmails
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error retrieving emails: " + e.getMessage());
        }
    }
    
    private ResponseEntity<?> createSuccessResponse(int recipientCount) {
        // Return success response with recipient count
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Email announcement sent successfully");
        response.put("recipientCount", recipientCount);
        response.put("sentAt", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }
}
