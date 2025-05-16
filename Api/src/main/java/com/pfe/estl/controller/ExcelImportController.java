package com.pfe.estl.controller;

import com.pfe.estl.dto.ImportResult;
import com.pfe.estl.service.ExcelImportService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for handling Excel file imports
 */
@RestController
@RequestMapping("/api/admin/import")
public class ExcelImportController {
    
    private static final Logger logger = LoggerFactory.getLogger(ExcelImportController.class);
    
    @Autowired
    private ExcelImportService excelImportService;
    
    /**
     * Import data from an Excel file
     * @param file The Excel file to import
     * @return ImportResult containing success/failure information
     */
    @PostMapping("/excel")
    @PreAuthorize("hasAuthority('ADMIN_ALL')")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        logger.info("Received Excel import request, filename: {}, size: {} bytes", 
                   file.getOriginalFilename(), file.getSize());
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }
            
            ImportResult result = excelImportService.processExcelFile(file);
            
            logger.info("Excel import completed: {} successes, {} failures", 
                       result.getSuccessCount(), result.getFailureCount());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error importing Excel file", e);
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        }
    }
}
