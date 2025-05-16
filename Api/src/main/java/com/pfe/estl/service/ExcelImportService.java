package com.pfe.estl.service;

import com.pfe.estl.dto.ImportResult;
import com.pfe.estl.model.Department;
import com.pfe.estl.model.Role;
import com.pfe.estl.model.Semester;
import com.pfe.estl.model.Student;
import com.pfe.estl.model.Subject;
import com.pfe.estl.model.User;
import com.pfe.estl.repository.DepartmentRepository;
import com.pfe.estl.repository.RoleRepository;
import com.pfe.estl.repository.SemesterRepository;
import com.pfe.estl.repository.StudentRepository;
import com.pfe.estl.repository.SubjectRepository;
import com.pfe.estl.repository.UserRepository;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Optional;
import java.util.Set;

/**
 * Service for importing data from Excel files
 */
@Service
public class ExcelImportService {
    
    private static final Logger logger = LoggerFactory.getLogger(ExcelImportService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private SemesterRepository semesterRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Process an Excel file and import its data
     * @param file The Excel file to import
     * @return ImportResult containing success/failure information
     * @throws IOException If file reading fails
     */
    @Transactional
    public ImportResult processExcelFile(MultipartFile file) throws IOException {
        ImportResult result = new ImportResult();
        
        if (file.isEmpty()) {
            result.addError("Uploaded file is empty");
            return result;
        }
        
        if (!isExcelFile(file)) {
            result.addError("Uploaded file is not a valid Excel file (.xlsx or .xls)");
            return result;
        }
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            // Process each sheet based on entity type
            
            // 1. First import departments (they're needed for other entities)
            Sheet deptsSheet = workbook.getSheet("Departments");
            if (deptsSheet != null) {
                processDepartmentsSheet(deptsSheet, result);
            }
            
            // 2. Then import semesters (needed for students and subjects)
            Sheet semestersSheet = workbook.getSheet("Semesters");
            if (semestersSheet != null) {
                processSemestersSheet(semestersSheet, result);
            }
            
            // 3. Import users
            Sheet usersSheet = workbook.getSheet("Users");
            if (usersSheet != null) {
                processUsersSheet(usersSheet, result);
            }
            
            // 4. Import subjects
            Sheet subjectsSheet = workbook.getSheet("Subjects");
            if (subjectsSheet != null) {
                processSubjectsSheet(subjectsSheet, result);
            }
            
            // 5. Import students
            Sheet studentsSheet = workbook.getSheet("Students");
            if (studentsSheet != null) {
                processStudentsSheet(studentsSheet, result);
            }
            
            if (deptsSheet == null && semestersSheet == null && usersSheet == null && 
                subjectsSheet == null && studentsSheet == null) {
                result.addError("No valid sheets found in the Excel file. Expected sheets: 'Departments', 'Semesters', 'Users', 'Subjects', 'Students'");
            }
        } catch (Exception e) {
            logger.error("Error processing Excel file", e);
            result.addError("Error processing Excel file: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Check if the uploaded file is a valid Excel file
     * @param file File to check
     * @return true if the file is a valid Excel file
     */
    private boolean isExcelFile(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            return false;
        }
        
        String lowercaseName = filename.toLowerCase();
        return lowercaseName.endsWith(".xlsx") || lowercaseName.endsWith(".xls");
    }
    
    /**
     * Process the Departments sheet
     * @param sheet The Excel sheet containing department data
     * @param result The import result object to update
     */
    private void processDepartmentsSheet(Sheet sheet, ImportResult result) {
        Iterator<Row> rowIterator = sheet.iterator();
        
        // Skip the header row
        if (rowIterator.hasNext()) {
            rowIterator.next();
        } else {
            result.addError("Departments sheet is empty");
            return;
        }
        
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            Cell nameCell = row.getCell(0); // First column should be name
            
            if (nameCell == null) {
                result.addError("Department name is missing on row " + row.getRowNum());
                result.incrementFailure();
                continue;
            }
            
            String name = getCellValueAsString(nameCell);
            if (name.isBlank()) {
                result.addError("Department name is blank on row " + row.getRowNum());
                result.incrementFailure();
                continue;
            }
            
            try {
                // Check if department already exists
                Optional<Department> existingDept = departmentRepository.findByName(name);
                if (existingDept.isPresent()) {
                    result.addWarning("Department with name '" + name + "' already exists, skipping");
                    continue;
                }
                
                // Create and save new department
                Department department = new Department();
                department.setName(name);
                departmentRepository.save(department);
                
                result.incrementSuccess();
                result.incrementDepartmentCount();
                result.addSuccessMessage("Imported department: " + name);
            } catch (Exception e) {
                logger.error("Error importing department", e);
                result.addError("Error importing department '" + name + "': " + e.getMessage());
                result.incrementFailure();
            }
        }
    }
    
    /**
     * Process the Semesters sheet
     * @param sheet The Excel sheet containing semester data
     * @param result The import result object to update
     */
    private void processSemestersSheet(Sheet sheet, ImportResult result) {
        Iterator<Row> rowIterator = sheet.iterator();
        
        // Skip the header row
        if (rowIterator.hasNext()) {
            rowIterator.next();
        } else {
            result.addError("Semesters sheet is empty");
            return;
        }
        
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            Cell nameCell = row.getCell(0); // First column should be name
            
            if (nameCell == null) {
                result.addError("Semester name is missing on row " + row.getRowNum());
                result.incrementFailure();
                continue;
            }
            
            String name = getCellValueAsString(nameCell);
            if (name.isBlank()) {
                result.addError("Semester name is blank on row " + row.getRowNum());
                result.incrementFailure();
                continue;
            }
            
            try {
                // Check if semester already exists
                Optional<Semester> existingSemester = findSemesterByName(name);
                if (existingSemester.isPresent()) {
                    result.addWarning("Semester with name '" + name + "' already exists, skipping");
                    continue;
                }
                
                // Create and save new semester
                Semester semester = new Semester();
                semester.setName(name);
                semesterRepository.save(semester);
                
                result.incrementSuccess();
                result.incrementSemesterCount();
                result.addSuccessMessage("Imported semester: " + name);
            } catch (Exception e) {
                logger.error("Error importing semester", e);
                result.addError("Error importing semester '" + name + "': " + e.getMessage());
                result.incrementFailure();
            }
        }
    }
    
    /**
     * Process the Users sheet
     * @param sheet The Excel sheet containing user data
     * @param result The import result object to update
     */
    private void processUsersSheet(Sheet sheet, ImportResult result) {
        Iterator<Row> rowIterator = sheet.iterator();
        
        // Get header row to determine column indices
        Row headerRow = rowIterator.hasNext() ? rowIterator.next() : null;
        if (headerRow == null) {
            result.addError("Users sheet is empty");
            return;
        }
        
        int usernameIdx = findColumnIndex(headerRow, "username");
        int emailIdx = findColumnIndex(headerRow, "email");
        int passwordIdx = findColumnIndex(headerRow, "password");
        int rolesIdx = findColumnIndex(headerRow, "roles");
        
        if (usernameIdx == -1 || emailIdx == -1 || passwordIdx == -1) {
            result.addError("Users sheet must have 'username', 'email', and 'password' columns");
            return;
        }
        
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            
            String username = getCellValueAsString(row.getCell(usernameIdx));
            String email = getCellValueAsString(row.getCell(emailIdx));
            String password = getCellValueAsString(row.getCell(passwordIdx));
            String roleNames = rolesIdx != -1 ? getCellValueAsString(row.getCell(rolesIdx)) : "";
            
            if (username.isBlank() || email.isBlank() || password.isBlank()) {
                result.addError("User on row " + row.getRowNum() + " is missing required fields");
                result.incrementFailure();
                continue;
            }
            
            try {
                // Check if user already exists
                if (userRepository.existsByUsername(username)) {
                    result.addWarning("User with username '" + username + "' already exists, skipping");
                    continue;
                }
                
                if (userRepository.existsByEmail(email)) {
                    result.addWarning("User with email '" + email + "' already exists, skipping");
                    continue;
                }
                
                // Create and save new user
                User user = new User();
                user.setUsername(username);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                user.setEnabled(true);
                
                // Process roles if provided
                if (!roleNames.isBlank()) {
                    Set<Role> roles = findRolesByNames(roleNames);
                    for (Role role : roles) {
                        user.addRole(role);
                    }
                }
                
                userRepository.save(user);
                
                result.incrementSuccess();
                result.incrementUserCount();
                result.addSuccessMessage("Imported user: " + username);
            } catch (Exception e) {
                logger.error("Error importing user", e);
                result.addError("Error importing user '" + username + "': " + e.getMessage());
                result.incrementFailure();
            }
        }
    }
    
    /**
     * Process the Subjects sheet
     * @param sheet The Excel sheet containing subject data
     * @param result The import result object to update
     */
    private void processSubjectsSheet(Sheet sheet, ImportResult result) {
        Iterator<Row> rowIterator = sheet.iterator();
        
        // Get header row to determine column indices
        Row headerRow = rowIterator.hasNext() ? rowIterator.next() : null;
        if (headerRow == null) {
            result.addError("Subjects sheet is empty");
            return;
        }
        
        int codeIdx = findColumnIndex(headerRow, "code");
        int nameIdx = findColumnIndex(headerRow, "name");
        int departmentIdx = findColumnIndex(headerRow, "department");
        int semesterIdx = findColumnIndex(headerRow, "semester");
        
        if (codeIdx == -1 || nameIdx == -1 || departmentIdx == -1 || semesterIdx == -1) {
            result.addError("Subjects sheet must have 'code', 'name', 'department', and 'semester' columns");
            return;
        }
        
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            
            String code = getCellValueAsString(row.getCell(codeIdx));
            String name = getCellValueAsString(row.getCell(nameIdx));
            String departmentName = getCellValueAsString(row.getCell(departmentIdx));
            String semesterName = getCellValueAsString(row.getCell(semesterIdx));
            
            if (code.isBlank() || name.isBlank() || departmentName.isBlank() || semesterName.isBlank()) {
                result.addError("Subject on row " + row.getRowNum() + " is missing required fields");
                result.incrementFailure();
                continue;
            }
            
            try {
                // Find the department and semester
                Optional<Department> department = departmentRepository.findByName(departmentName);
                Optional<Semester> semester = findSemesterByName(semesterName);
                
                if (department.isEmpty()) {
                    result.addError("Department '" + departmentName + "' not found for subject: " + name);
                    result.incrementFailure();
                    continue;
                }
                
                if (semester.isEmpty()) {
                    result.addError("Semester '" + semesterName + "' not found for subject: " + name);
                    result.incrementFailure();
                    continue;
                }
                
                // Check if subject already exists
                if (subjectRepository.existsByCode(code)) {
                    result.addWarning("Subject with code '" + code + "' already exists, skipping");
                    continue;
                }
                
                // Create and save new subject
                Subject subject = new Subject();
                subject.setCode(code);
                subject.setName(name);
                subject.setDepartment(department.get());
                subject.setSemester(semester.get());
                
                subjectRepository.save(subject);
                
                result.incrementSuccess();
                result.incrementSubjectCount();
                result.addSuccessMessage("Imported subject: " + name);
            } catch (Exception e) {
                logger.error("Error importing subject", e);
                result.addError("Error importing subject '" + name + "': " + e.getMessage());
                result.incrementFailure();
            }
        }
    }
    
    /**
     * Process the Students sheet
     * @param sheet The Excel sheet containing student data
     * @param result The import result object to update
     */
    private void processStudentsSheet(Sheet sheet, ImportResult result) {
        Iterator<Row> rowIterator = sheet.iterator();
        
        // Get header row to determine column indices
        Row headerRow = rowIterator.hasNext() ? rowIterator.next() : null;
        if (headerRow == null) {
            result.addError("Students sheet is empty");
            return;
        }
        
        int studentIdIdx = findColumnIndex(headerRow, "studentId");
        int fullNameIdx = findColumnIndex(headerRow, "fullName");
        int emailIdx = findColumnIndex(headerRow, "email");
        int departmentIdx = findColumnIndex(headerRow, "department");
        int semesterIdx = findColumnIndex(headerRow, "semester");
        
        if (studentIdIdx == -1 || fullNameIdx == -1 || emailIdx == -1 || 
            departmentIdx == -1 || semesterIdx == -1) {
            result.addError("Students sheet must have 'studentId', 'fullName', 'email', 'department', and 'semester' columns");
            return;
        }
        
        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();
            
            String studentId = getCellValueAsString(row.getCell(studentIdIdx));
            String fullName = getCellValueAsString(row.getCell(fullNameIdx));
            String email = getCellValueAsString(row.getCell(emailIdx));
            String departmentName = getCellValueAsString(row.getCell(departmentIdx));
            String semesterName = getCellValueAsString(row.getCell(semesterIdx));
            
            if (studentId.isBlank() || fullName.isBlank() || email.isBlank() || 
                departmentName.isBlank() || semesterName.isBlank()) {
                result.addError("Student on row " + row.getRowNum() + " is missing required fields");
                result.incrementFailure();
                continue;
            }
            
            try {
                // Find the department and semester
                Optional<Department> department = departmentRepository.findByName(departmentName);
                Optional<Semester> semester = findSemesterByName(semesterName);
                
                if (department.isEmpty()) {
                    result.addError("Department '" + departmentName + "' not found for student: " + fullName);
                    result.incrementFailure();
                    continue;
                }
                
                if (semester.isEmpty()) {
                    result.addError("Semester '" + semesterName + "' not found for student: " + fullName);
                    result.incrementFailure();
                    continue;
                }
                
                // Check if student already exists
                if (studentRepository.existsByStudentId(studentId)) {
                    result.addWarning("Student with ID '" + studentId + "' already exists, skipping");
                    continue;
                }
                
                if (studentRepository.existsByEmail(email)) {
                    result.addWarning("Student with email '" + email + "' already exists, skipping");
                    continue;
                }
                
                // Create and save new student
                Student student = new Student();
                student.setStudentId(studentId);
                student.setFullName(fullName);
                student.setEmail(email);
                student.setDepartment(department.get());
                student.setSemester(semester.get());
                
                studentRepository.save(student);
                
                result.incrementSuccess();
                result.incrementStudentCount();
                result.addSuccessMessage("Imported student: " + fullName);
            } catch (Exception e) {
                logger.error("Error importing student", e);
                result.addError("Error importing student '" + fullName + "': " + e.getMessage());
                result.incrementFailure();
            }
        }
    }
    
    /**
     * Find roles by their names
     * @param roleNamesStr Comma-separated list of role names
     * @return Set of Role objects
     */
    private Set<Role> findRolesByNames(String roleNamesStr) {
        Set<Role> roles = new HashSet<>();
        String[] roleNames = roleNamesStr.split(",");
        
        for (String roleName : roleNames) {
            String trimmedName = roleName.trim();
            if (!trimmedName.isBlank()) {
                Optional<Role> role = roleRepository.findByName(trimmedName);
                role.ifPresent(roles::add);
            }
        }
        
        // If no roles were found or specified, add a default USER role
        if (roles.isEmpty()) {
            Optional<Role> defaultRole = roleRepository.findByName("USER");
            defaultRole.ifPresent(roles::add);
        }
        
        return roles;
    }
    
    /**
     * Find the index of a column in the header row
     * @param headerRow The header row
     * @param columnName The name of the column to find
     * @return The index of the column, or -1 if not found
     */
    private int findColumnIndex(Row headerRow, String columnName) {
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null && columnName.equalsIgnoreCase(getCellValueAsString(cell))) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Get the string value of a cell
     * @param cell The cell to get the value from
     * @return The string value of the cell
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return "";
                    }
                }
            default:
                return "";
        }
    }
    
    /**
     * Find a semester by name and return as Optional
     * @param name The name of the semester
     * @return Optional containing the semester if found, empty otherwise
     */
    private Optional<Semester> findSemesterByName(String name) {
        Semester semester = semesterRepository.findByName(name);
        return Optional.ofNullable(semester);
    }
}
