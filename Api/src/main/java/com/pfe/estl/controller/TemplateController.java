package com.pfe.estl.controller;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Controller to provide downloadable templates for Excel imports
 */
@RestController
@RequestMapping("/api/admin/import")
public class TemplateController {

    /**
     * Generates and provides a downloadable Excel template for data imports
     * @return The Excel template file as a downloadable resource
     */
    @GetMapping("/template")
    @PreAuthorize("hasAuthority('ADMIN_ALL')")
    public ResponseEntity<byte[]> getImportTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Create Users sheet
            Sheet usersSheet = workbook.createSheet("Users");
            createHeaderRow(usersSheet, new String[]{"username", "email", "password", "roles"});
            addExampleRow(usersSheet, new String[]{"john.doe", "john.doe@example.com", "password123", "ADMIN,USER"});
            
            // Create Departments sheet
            Sheet deptsSheet = workbook.createSheet("Departments");
            createHeaderRow(deptsSheet, new String[]{"name"});
            addExampleRow(deptsSheet, new String[]{"Computer Science"});
            addExampleRow(deptsSheet, new String[]{"Electrical Engineering"});
            
            // Create Semesters sheet
            Sheet semestersSheet = workbook.createSheet("Semesters");
            createHeaderRow(semestersSheet, new String[]{"name"});
            addExampleRow(semestersSheet, new String[]{"Fall 2025"});
            addExampleRow(semestersSheet, new String[]{"Spring 2026"});
            
            // Create Subjects sheet
            Sheet subjectsSheet = workbook.createSheet("Subjects");
            createHeaderRow(subjectsSheet, new String[]{"code", "name", "department", "semester"});
            addExampleRow(subjectsSheet, new String[]{"CS101", "Introduction to Programming", "Computer Science", "Fall 2025"});
            addExampleRow(subjectsSheet, new String[]{"EE201", "Circuit Analysis", "Electrical Engineering", "Spring 2026"});
            
            // Create Students sheet
            Sheet studentsSheet = workbook.createSheet("Students");
            createHeaderRow(studentsSheet, new String[]{"studentId", "fullName", "email", "department", "semester"});
            addExampleRow(studentsSheet, new String[]{"STU001", "Jane Smith", "jane.smith@example.com", "Computer Science", "Fall 2025"});
            addExampleRow(studentsSheet, new String[]{"STU002", "Alex Johnson", "alex.johnson@example.com", "Electrical Engineering", "Spring 2026"});
            
            // Auto-size all columns for better readability
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                int numColumns = sheet.getRow(0).getPhysicalNumberOfCells();
                for (int j = 0; j < numColumns; j++) {
                    sheet.autoSizeColumn(j);
                }
            }
            
            // Convert workbook to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "import_template.xlsx");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(outputStream.toByteArray());
        }
    }
    
    /**
     * Creates a header row in the specified sheet with the given column names
     * @param sheet The sheet to add the header to
     * @param headers Array of header column names
     */
    private void createHeaderRow(Sheet sheet, String[] headers) {
        Row headerRow = sheet.createRow(0);
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }
    
    /**
     * Adds an example row with sample data
     * @param sheet The sheet to add the example to
     * @param values The values to add to the row
     */
    private void addExampleRow(Sheet sheet, String[] values) {
        int rowIndex = sheet.getLastRowNum() + 1;
        Row row = sheet.createRow(rowIndex);
        
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(values[i]);
        }
    }
}
