package com.pfe.estl.service;

import com.pfe.estl.model.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service to handle natural language queries about student absences
 * Uses OpenAI API to convert natural language to JPQL/SQL
 */
@Service
public class NaturalLanguageQueryService {
    private static final Logger logger = LoggerFactory.getLogger(NaturalLanguageQueryService.class);
    
    private final RestTemplate restTemplate;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;
    
    @Autowired
    public NaturalLanguageQueryService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Process a natural language query and return matching students
     * 
     * @param query The natural language query string
     * @return List of students matching the query criteria and the generated JPQL query
     */
    public Map<String, Object> processNaturalLanguageQuery(String query) {
        try {
            logger.info("Processing natural language query: {}", query);
            
            // Check if this is a zero absence query and handle it specially
            String lowerQuery = query.toLowerCase();
            boolean isZeroAbsenceQuery = lowerQuery.contains("zero absence") || 
                lowerQuery.contains("0 absence") || 
                lowerQuery.contains("no absence") ||   // More specific check for "no absence"
                (lowerQuery.contains("perfect") && lowerQuery.contains("attendance"));
            
            String jpqlQuery;
            
            if (isZeroAbsenceQuery) {
                logger.info("Detected zero absence query, using optimized JPQL approach");
                // Use the reliable NOT EXISTS JPQL query
                jpqlQuery = "SELECT s FROM Student s WHERE NOT EXISTS (SELECT 1 FROM AttendanceRecord a WHERE a.student = s AND a.isPresent = false)";
            } else {
                // Standard flow - convert the natural language query to JPQL using OpenAI
                jpqlQuery = generateJPQLFromNaturalLanguage(query);
            }
            
            if (jpqlQuery != null && !jpqlQuery.isEmpty()) {
                logger.info("Generated JPQL query: {}", jpqlQuery);
                List<Student> students = executeJPQLQuery(jpqlQuery, query);
                
                // No need for Java filtering when using the NOT EXISTS query
                // The database query itself handles finding students with zero absences accurately.
                if (isZeroAbsenceQuery) {
                    logger.info("Zero absence query executed via JPQL. Found {} students.", students.size());
                }
                
                Map<String, Object> result = new HashMap<>();
                result.put("students", students);
                result.put("jpqlQuery", jpqlQuery);
                
                return result;
            } else {
                logger.error("Failed to generate JPQL query from natural language");
                return new HashMap<>();
            }
        } catch (Exception e) {
            logger.error("Error processing natural language query: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Generate JPQL query from natural language using OpenAI
     */
    private String generateJPQLFromNaturalLanguage(String naturalLanguageQuery) {
        try {
            // Create a prompt for OpenAI that includes database schema information
            String prompt = createDatabaseSchemaPrompt(naturalLanguageQuery);
            
            // Call OpenAI API
            String response = callOpenAI(prompt);
            
            if (response != null) {
                // Extract the JPQL query from the response
                return extractJPQLFromResponse(response);
            }
            
            return null;
        } catch (Exception e) {
            logger.error("Error generating JPQL from natural language: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Create a prompt with database schema information for OpenAI
     */
    private String createDatabaseSchemaPrompt(String query) {
        StringBuilder promptBuilder = new StringBuilder();
        
        // Introduction
        promptBuilder.append("You are a database expert that converts natural language queries into JPQL (Java Persistence Query Language) queries.\n\n");
        promptBuilder.append("Here is the database schema for a student attendance system:\n\n");
        
        // Student entity
        promptBuilder.append("Student entity (table: students):\n");
        promptBuilder.append("- id (Long): Primary key\n");
        promptBuilder.append("- fullName (String): Student's full name\n");
        promptBuilder.append("- studentId (String): Student's ID number\n");
        promptBuilder.append("- email (String): Student's email address\n");
        promptBuilder.append("- department_id (Long): Foreign key to Department\n");
        promptBuilder.append("- semester_id (Long): Foreign key to Semester\n");
        promptBuilder.append("- Relationships:\n");
        promptBuilder.append("  * Many-to-one with Department (department_id)\n");
        promptBuilder.append("  * Many-to-one with Semester (semester_id)\n");
        promptBuilder.append("  * One-to-many with AttendanceRecord (student_id)\n\n");
        
        // Department entity
        promptBuilder.append("Department entity (table: departments):\n");
        promptBuilder.append("- id (Long): Primary key\n");
        promptBuilder.append("- name (String): Department name\n");
        promptBuilder.append("- Relationships:\n");
        promptBuilder.append("  * One-to-many with Student (department_id)\n");
        promptBuilder.append("  * One-to-many with Subject (department_id)\n\n");
        
        // Semester entity
        promptBuilder.append("Semester entity (table: semesters):\n");
        promptBuilder.append("- id (Long): Primary key\n");
        promptBuilder.append("- name (String): Semester name\n");
        promptBuilder.append("- Relationships:\n");
        promptBuilder.append("  * One-to-many with Student (semester_id)\n");
        promptBuilder.append("  * One-to-many with Subject (semester_id)\n\n");
        
        // Subject entity
        promptBuilder.append("Subject entity (table: subjects):\n");
        promptBuilder.append("- id (Long): Primary key\n");
        promptBuilder.append("- name (String): Subject name\n");
        promptBuilder.append("- code (String): Subject code\n");
        promptBuilder.append("- department_id (Long): Foreign key to Department\n");
        promptBuilder.append("- semester_id (Long): Foreign key to Semester\n");
        promptBuilder.append("- Relationships:\n");
        promptBuilder.append("  * Many-to-one with Department (department_id)\n");
        promptBuilder.append("  * Many-to-one with Semester (semester_id)\n");
        promptBuilder.append("  * One-to-many with AttendanceRecord (subject_id)\n\n");
        
        // AttendanceRecord entity
        promptBuilder.append("AttendanceRecord entity (table: attendance_records):\n");
        promptBuilder.append("- id (Long): Primary key\n");
        promptBuilder.append("- student_reference_id (Long): Foreign key to Student\n");
        promptBuilder.append("- subject_id (Long): Foreign key to Subject\n");
        promptBuilder.append("- date (LocalDate): Date of the attendance record\n");
        promptBuilder.append("- duration (Integer): Duration in minutes\n");
        promptBuilder.append("- isPresent (boolean): Whether the student was present (true) or absent (false)\n");
        promptBuilder.append("- Relationships:\n");
        promptBuilder.append("  * Many-to-one with Student (student_reference_id)\n");
        promptBuilder.append("  * Many-to-one with Subject (subject_id)\n\n");
        
        promptBuilder.append("IMPORTANT NOTE ON DATES: When dealing with dates, expect specific dates in 'YYYY-MM-DD' format. The system does not interpret relative date phrases like 'last month' or 'this week'. If a query involves such phrases, it will be pre-processed to provide concrete dates.\n\n");

        promptBuilder.append("Important query examples and patterns:\n");
        promptBuilder.append("1. To find students with more than X absence hours (Note: X must be converted to minutes by multiplying by 60 for the query below, as 'duration' is in minutes):\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE a.isPresent = false GROUP BY s HAVING SUM(a.duration) > (X * 60)\n\n");
        
        promptBuilder.append("2. To find all students with absences:\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE a.isPresent = false\n\n");
        
        promptBuilder.append("2. To find students with exactly 0 absence hours (perfect attendance):\n");
        promptBuilder.append("   SELECT s FROM Student s WHERE NOT EXISTS (SELECT 1 FROM AttendanceRecord a WHERE a.student = s AND a.isPresent = false)\n\n");
        promptBuilder.append("   -- Alternative approach for zero absences:\n");
        promptBuilder.append("   SELECT s FROM Student s LEFT JOIN s.attendanceRecords a GROUP BY s HAVING SUM(CASE WHEN a.isPresent = false THEN 1 ELSE 0 END) = 0\n\n");
        
        promptBuilder.append("3. To find students absent on a specific date:\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE a.isPresent = false AND a.date = :date\n\n");
        
        promptBuilder.append("IMPORTANT NOTE ON DATE PARAMETERS:\n");
        promptBuilder.append("When generating queries that involve dates, always use parameterized queries with named parameters (e.g., :date, :startDate, :endDate).\n");
        promptBuilder.append("Do not include actual date values in the query string. The system will handle setting these parameters with proper LocalDate objects.\n");
        promptBuilder.append("Example: For a query 'List all students who were absent on 2024-04-10', generate:\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE a.isPresent = false AND a.date = :date\n\n");
        promptBuilder.append("Example: For a query 'List all students who were absent between 2024-04-01 and 2024-04-30', generate:\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE a.isPresent = false AND a.date BETWEEN :startDate AND :endDate\n\n");
        
        promptBuilder.append("4. To find students from a specific department:\n");
        promptBuilder.append("   SELECT s FROM Student s WHERE s.department.name = 'department_name'\n\n");
        
        promptBuilder.append("5. To find students with absences in a specific subject:\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE a.isPresent = false AND a.subject.name = 'subject_name'\n\n");
        
        promptBuilder.append("6. To find students in a specific semester with absences:\n");
        promptBuilder.append("   SELECT DISTINCT s FROM Student s JOIN s.attendanceRecords a WHERE s.semester.name = 'semester_name' AND a.isPresent = false\n\n");

        promptBuilder.append("7. To find students NOT in department 'XYZ' who have at least one absence (i.e., have some absences and are not perfect attendance):\n");
        promptBuilder.append("   SELECT s FROM Student s WHERE s.department.name <> 'XYZ' AND EXISTS (SELECT 1 FROM AttendanceRecord a WHERE a.student = s AND a.isPresent = false)\n\n");

        promptBuilder.append("Convert this natural language query to a JPQL query that returns a list of Student objects: \"");
        promptBuilder.append(query);
        promptBuilder.append("\"\n");
        promptBuilder.append("Only return the JPQL query, nothing else. Do not include any explanations.");
        
        return promptBuilder.toString();
    }
    
    /**
     * Call the OpenAI API
     */
    private String callOpenAI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4");  // Using GPT-4 for better reasoning and query generation
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);
            
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.1); // Lower temperature for more deterministic results
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Make the API call
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(openaiApiUrl, request, Map.class);
            
            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Object> choices = (List<Object>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> choice = (Map<String, Object>) choices.get(0);
                    if (choice != null && choice.containsKey("message")) {
                        @SuppressWarnings("unchecked")
                        Map<String, String> responseMessage = (Map<String, String>) choice.get("message");
                        if (responseMessage != null && responseMessage.containsKey("content")) {
                            return responseMessage.get("content");
                        }
                    }
                }
            }
            logger.warn("Received unexpected response format from OpenAI API");
            return null;
        } catch (Exception e) {
            logger.error("Error calling OpenAI API: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Extract JPQL query from OpenAI response
     */
    private String extractJPQLFromResponse(String response) {
        if (response == null || response.isEmpty()) {
            return null;
        }
        
        // Clean up the response to get just the JPQL query
        String cleanedResponse = response.trim();
        
        // If the response is wrapped in code blocks, extract the content
        if (cleanedResponse.startsWith("```") && cleanedResponse.endsWith("```")) {
            cleanedResponse = cleanedResponse.substring(3, cleanedResponse.length() - 3).trim();
            
            // If there's a language identifier after the opening ```, remove it
            if (cleanedResponse.startsWith("sql") || cleanedResponse.startsWith("jpql")) {
                cleanedResponse = cleanedResponse.substring(cleanedResponse.indexOf('\n')).trim();
            }
        }
        
        // Handle special characters in department names and other values
        // Look for patterns like "s.department.name = 'G╔NIE CIVIL'" and normalize the characters
        cleanedResponse = fixSpecialCharactersInQuery(cleanedResponse);
        
        return cleanedResponse;
    }
    
    /**
     * Fix special characters in the generated JPQL query
     * This helps with proper encoding of non-ASCII characters like É, è, ç, etc.
     */
    private String fixSpecialCharactersInQuery(String query) {
        // Common replacements for French accented characters
        query = query.replace("╔", "É");
        query = query.replace("É", "É");  // Ensure uppercase É is properly handled
        query = query.replace("Ú", "é");
        query = query.replace("é", "é");  // Ensure lowercase é is properly handled
        query = query.replace("Þ", "à");
        query = query.replace("à", "à");  // Ensure lowercase à is properly handled
        query = query.replace("Ó", "è");
        query = query.replace("è", "è");  // Ensure lowercase è is properly handled
        query = query.replace("Ö", "ê");  // Correct ê mapping
        query = query.replace("ü", "ù");
        query = query.replace("ù", "ù");  // Ensure lowercase ù is properly handled
        query = query.replace("Ñ", "ç");
        query = query.replace("ç", "ç");  // Ensure lowercase ç is properly handled
        query = query.replace("á", "ô");
        query = query.replace("ô", "ô");  // Ensure lowercase ô is properly handled
        query = query.replace("î", "î");  // Add î mapping
        query = query.replace("û", "û");  // Add û mapping
        query = query.replace("ë", "ë");  // Add ë mapping
        query = query.replace("ï", "ï");  // Ensure lowercase ï is properly handled
        
        // Department names specific replacements
        if (query.contains("G╔NIE CIVIL")) {
            query = query.replace("G╔NIE CIVIL", "GÉNIE CIVIL");
        }
        if (query.contains("G╔NIE INFORMATIQUE")) {
            query = query.replace("G╔NIE INFORMATIQUE", "GÉNIE INFORMATIQUE");
        }
        if (query.contains("G╔NIE ╔LECTRIQUE")) {
            query = query.replace("G╔NIE ╔LECTRIQUE", "GÉNIE ÉLECTRIQUE");
        }
        
        logger.info("Fixed query with special characters: {}", query);
        return query;
    }
    
    /**
     * Execute a JPQL query with date parameter handling
     */
    @SuppressWarnings("unchecked")
    private List<Student> executeJPQLQuery(String jpqlQuery, String originalQuery) {
        try {
            logger.info("Executing JPQL query: {}", jpqlQuery);
            
            // Apply any character fixes to the query
            jpqlQuery = fixSpecialCharactersInQuery(jpqlQuery);
            
            Query query = entityManager.createQuery(jpqlQuery);
            
            // Handle date parameters if present in the query
            if (originalQuery != null) {
                // Look for dates in the original query
                java.util.regex.Pattern datePattern = java.util.regex.Pattern.compile("(\\d{4}-\\d{2}-\\d{2})");
                java.util.regex.Matcher matcher = datePattern.matcher(originalQuery);
                
                if (matcher.find()) {
                    String dateStr = matcher.group(1);
                    java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
                    
                    logger.info("Found date in query: {}", date);
                    
                    if (jpqlQuery.contains("BETWEEN")) {
                        // For date range queries, set both start and end dates
                        if (matcher.find()) {
                            String endDateStr = matcher.group(1);
                            java.time.LocalDate endDate = java.time.LocalDate.parse(endDateStr);
                            query.setParameter("startDate", date);
                            query.setParameter("endDate", endDate);
                            logger.info("Setting date range from {} to {}", date, endDate);
                        } else {
                            // If there's only one date found, use it for both start and end
                            query.setParameter("startDate", date);
                            query.setParameter("endDate", date);
                            logger.info("Setting single date {} for both start and end", date);
                        }
                    } else {
                        // For single date queries
                        query.setParameter("date", date);
                        logger.info("Setting single date parameter: {}", date);
                    }
                }
            }
            
            List<?> results = query.getResultList();
            logger.info("Query returned {} results", results.size());
            
            List<Student> students = (List<Student>) results;
            
            // Extra validation for zero absence queries to ensure data is accurate
            if (originalQuery != null && 
                (originalQuery.toLowerCase().contains("zero absence") || 
                 originalQuery.toLowerCase().contains("0 absence") || 
                 originalQuery.toLowerCase().contains("no absence"))) {
                
                logger.info("Validating zero absence results");
                for (Student student : students) {
                    boolean hasAbsences = student.getAttendanceRecords().stream()
                        .anyMatch(record -> !record.isPresent());
                    
                    if (hasAbsences) {
                        logger.warn("Potential data inconsistency: Student {} reported as having zero absences but has absence records", 
                                   student.getFullName());
                    }
                }
            }
            
            return students;
            
        } catch (Exception e) {
            logger.error("Error executing JPQL query: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Generate a natural language summary of the query results
     * 
     * @param students List of students matching the query
     * @param query The original natural language query
     * @return A human-readable summary of the results
     */
    public String generateResultsSummary(List<Student> students, String query) {
        if (students == null || students.isEmpty()) {
            return "No students found matching your query.";
        }
        
        StringBuilder summary = new StringBuilder();
        summary.append("Found ").append(students.size()).append(" student");
        if (students.size() > 1) {
            summary.append("s");
        }
        summary.append(" matching your query.");
        
        // Special handling for zero absence queries
        String lowerQuery = query.toLowerCase();
        if (lowerQuery.contains("0 absence") || 
            (lowerQuery.contains("zero") && lowerQuery.contains("absence")) ||
            (lowerQuery.contains("no") && lowerQuery.contains("absence"))) {
            
            summary.append("\n\nThese students have perfect attendance with zero recorded absences.");
        }
        
        // Group students by department
        Map<String, Long> departmentCounts = students.stream()
            .filter(s -> s.getDepartment() != null)
            .collect(Collectors.groupingBy(
                s -> s.getDepartment().getName(),
                Collectors.counting()
            ));
        
        if (!departmentCounts.isEmpty()) {
            summary.append("\n\nDepartment breakdown:\n");
            departmentCounts.forEach((dept, count) -> {
                summary.append("- ").append(dept).append(": ").append(count).append(" student");
                if (count > 1) {
                    summary.append("s");
                }
                summary.append("\n");
            });
        }
        
        // Add absence information if relevant
        if (lowerQuery.contains("absence") || 
            lowerQuery.contains("absent") || 
            lowerQuery.contains("miss")) {
            
            // Calculate absence statistics
            int totalAbsences = students.stream()
                .flatMap(s -> s.getAttendanceRecords().stream())
                .filter(r -> r != null && !r.isPresent())
                .mapToInt(r -> r.getDuration() != null ? r.getDuration() : 0)
                .sum();
                
            double avgAbsences = students.isEmpty() ? 0 : (double) totalAbsences / students.size();
            
            summary.append("\nTotal absence hours: ").append(totalAbsences);
            summary.append("\nAverage absence hours per student: ").append(String.format("%.1f", avgAbsences));
        }
        
        return summary.toString();
    }
}
