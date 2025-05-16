package com.pfe.estl.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${announcement.email.from.name:ESTL Platform}") // Default name if not set
    private String fromName;
    
    @Value("${announcement.email.subject.prefix:[ESTL Annonce]}") // Subject prefix
    private String subjectPrefix;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Helper to check for dummy/placeholder email config
    private boolean isDummyEmailConfig() {
        return "YOUR_EMAIL@example.com".equals(fromEmail) || "example@example.com".equals(fromEmail);
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        // In development mode or with dummy config, log but still attempt to send
        // to rely on JavaMailSender's configuration for actual behavior.
        if ("dev".equals(activeProfile) || isDummyEmailConfig()) {
            logger.info("NOTE: Dev mode or dummy config detected for 'sendSimpleEmail'. Email sending will be attempted using configured JavaMailSender.");
            logger.info("Original behavior might have logged and skipped sending to: {}", to);
            logger.info("Intended Subject: {}", subjectPrefix + " " + subject);
            logger.info("Intended Content: {}", text);
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8"); // false for plain text

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subjectPrefix + " " + subject);
            helper.setText(text);

            mailSender.send(message);
            logger.info("Successfully sent simple email to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send simple email to: {}. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send simple email: " + e.getMessage(), e);
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        // In development mode or with dummy config, log but still attempt to send.
        if ("dev".equals(activeProfile) || isDummyEmailConfig()) {
            logger.info("NOTE: Dev mode or dummy config detected for 'sendHtmlEmail'. Email sending will be attempted using configured JavaMailSender.");
            logger.info("Original behavior might have logged and skipped sending HTML Email to: {}", to);
            logger.info("Intended Subject: {}", subjectPrefix + " " + subject);
            // logger.info("Intended HTML Content: {}", htmlContent); // Content can be large
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true for HTML

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subjectPrefix + " " + subject);
            helper.setText(htmlContent, true); // true indicates HTML

            mailSender.send(message);
            logger.info("Successfully sent HTML email to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send HTML email to: {}. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send HTML email: " + e.getMessage(), e);
        }
    }

    public void sendBulkHtmlEmail(List<String> recipients, String subject, String htmlContent) {
        if (recipients == null || recipients.isEmpty()) {
            logger.warn("No recipients specified for bulk email. Skipping.");
            return;
        }

        // Log if dev mode or dummy config, but proceed to attempt sending.
        if ("dev".equals(activeProfile) || isDummyEmailConfig()) {
            logger.info("NOTE: Dev mode or dummy config detected for 'sendBulkHtmlEmail'. Email sending will be attempted using configured JavaMailSender.");
            logger.info("Intended Subject for bulk email: {}", subjectPrefix + " " + subject);
            logger.info("Intending to send to {} recipients.", recipients.size());
        }

        logger.info("Preparing to send bulk HTML email to {} recipients. Subject: {}", recipients.size(), subjectPrefix + " " + subject);
        int successfulSends = 0;
        int attemptedSends = 0;

        try {
            // It's often better to create a MimeMessage per recipient or use batch features if available,
            // but for simplicity, we'll reuse the helper and set 'To' repeatedly if the mailSender supports it.
            // For robust batching, consider creating a new MimeMessage or MimeMessageHelper inside the loop
            // or using specific batch sending capabilities of your mail library if available.

            for (String recipient : recipients) {
                if (recipient == null || recipient.trim().isEmpty() || !recipient.contains("@")) {
                    logger.warn("Skipping invalid or empty recipient email address: '{}'", recipient);
                    continue;
                }
                attemptedSends++;
                try {
                    MimeMessage message = mailSender.createMimeMessage(); // Create new message for each recipient for safety
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    
                    helper.setFrom(fromEmail, fromName);
                    helper.setTo(recipient);
                    helper.setSubject(subjectPrefix + " " + subject);
                    helper.setText(htmlContent, true);

                    mailSender.send(message);
                    logger.info("Successfully sent bulk email to: {}", recipient);
                    successfulSends++;
                } catch (Exception e) {
                    // Log specific error for this recipient but continue with others
                    logger.error("Failed to send bulk email to: {}. Error: {}", recipient, e.getMessage(), e);
                }
            }

            if (attemptedSends > 0 && successfulSends == 0) {
                logger.error("No emails were successfully sent out of {} attempted recipients for subject: {}", attemptedSends, subject);
                throw new RuntimeException("Email sending failed for all " + attemptedSends + " recipients. Please check SMTP configuration and application logs for details.");
            } else if (attemptedSends > 0) {
                logger.info("Bulk email summary: Successfully sent to {} out of {} attempted recipients for subject: {}", successfulSends, attemptedSends, subject);
            } else {
                logger.warn("No valid recipients found to attempt sending bulk email for subject: {}", subject);
            }

        } catch (Exception e) { // Catch unexpected errors during the overall process (e.g., initial MimeMessage setup if done outside loop)
            logger.error("An unexpected error occurred during bulk email processing for subject: {}. Error: {}", subject, e.getMessage(), e);
            // This generic catch might be too broad if MimeMessage is created inside the loop.
            // The primary exception related to overall failure would be the one thrown if successfulSends is 0.
            throw new RuntimeException("Unexpected error during bulk email processing: " + e.getMessage(), e);
        }
    }
}
