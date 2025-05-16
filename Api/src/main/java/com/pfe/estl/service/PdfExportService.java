package com.pfe.estl.service;

import java.io.IOException; // Make sure iText dependency is in pom.xml
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.itextpdf.text.DocumentException;

public interface PdfExportService {

    /**
     * Exports the general absence report data to a PDF byte array.
     *
     * @param reportData List of maps, where each map represents a student's absence summary.
     * @param startDate The start date of the report period.
     * @param endDate The end date of the report period.
     * @return A byte array containing the generated PDF.
     * @throws DocumentException If there's an error during PDF document generation.
     * @throws IOException If there's an I/O error.
     */
    byte[] exportAbsenceReportToPdf(List<Map<String, Object>> reportData, LocalDate startDate, LocalDate endDate)
            throws DocumentException, IOException;

    // You might keep the student-specific export method here too if needed
    // byte[] exportStudentAbsenceReportToPdf(Map<String, Object> studentAbsence, List<AttendanceRecord> absenceRecords)
    //         throws DocumentException, IOException;
}
