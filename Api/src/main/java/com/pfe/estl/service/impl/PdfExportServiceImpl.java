package com.pfe.estl.service.impl;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.pfe.estl.service.PdfExportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class PdfExportServiceImpl implements PdfExportService {

    private static final Logger logger = LoggerFactory.getLogger(PdfExportServiceImpl.class);

    @Override
    public byte[] exportAbsenceReportToPdf(List<Map<String, Object>> reportData, LocalDate startDate, LocalDate endDate)
            throws DocumentException, IOException {

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // --- START: Add Logo ---
            try {
                // Load image from classpath resources
                ClassLoader classLoader = getClass().getClassLoader();
                // Path relative to the resources folder
                URL imageUrl = classLoader.getResource("images/school_logo.png"); 
                if (imageUrl != null) {
                    Image logo = Image.getInstance(imageUrl);
                    // Scale the image to fit width 150 (adjust as needed)
                    logo.scaleToFit(150f, 150f); 
                    logo.setAlignment(Element.ALIGN_CENTER); // Center the logo
                    logo.setSpacingAfter(15f); // Add space below the logo
                    document.add(logo);
                    logger.info("School logo added to PDF report.");
                } else {
                    logger.warn("Could not find logo image at classpath: images/school_logo.png");
                }
            } catch (Exception e) {
                // Catch general Exception to be safe, log specific error
                logger.error("Error loading or adding logo image to PDF: {}", e.getMessage(), e);
                // Continue report generation even if logo fails
            }
            // --- END: Add Logo ---

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("Absence Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            // title.setSpacingAfter(10); // Remove or adjust as spacing is handled by logo
            document.add(title);

            // Date Range
            Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
            Paragraph dateRange = new Paragraph(
                    String.format("Period: %s to %s", startDate.format(dateFormatter), endDate.format(dateFormatter)),
                    dateFont);
            dateRange.setAlignment(Element.ALIGN_CENTER);
            dateRange.setSpacingAfter(20);
            document.add(dateRange);

            // Table
            PdfPTable table = new PdfPTable(4); // 4 columns
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 3f, 2f}); // Relative column widths

            // Table Header
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
            String[] headers = {"Student Name", "Student ID", "Department", "Absence Hours"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setBackgroundColor(BaseColor.DARK_GRAY);
                cell.setPadding(5);
                table.addCell(cell);
            }
            table.setHeaderRows(1);

            // Table Body
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Map<String, Object> record : reportData) {
                addTableCell(table, (String) record.get("studentName"), bodyFont, Element.ALIGN_LEFT);
                addTableCell(table, (String) record.get("studentId"), bodyFont, Element.ALIGN_CENTER);
                addTableCell(table, (String) record.get("departmentName"), bodyFont, Element.ALIGN_LEFT);
                // Ensure totalAbsenceHours is treated as a number, default to 0 if null/invalid
                Object hoursObj = record.get("totalAbsenceHours");
                String hoursStr = "0";
                if (hoursObj != null) {
                    try {
                         // Handle potential different numeric types (Integer, Long, Double etc.)
                        if (hoursObj instanceof Number) {
                            hoursStr = String.valueOf(((Number) hoursObj).intValue());
                        } else {
                            hoursStr = String.valueOf(Integer.parseInt(hoursObj.toString()));
                        }
                    } catch (NumberFormatException e) {
                         logger.warn("Could not parse totalAbsenceHours: {}", hoursObj);
                    }
                }
                addTableCell(table, hoursStr, bodyFont, Element.ALIGN_CENTER);
            }

            document.add(table);

        } catch (DocumentException e) {
            logger.error("Error creating PDF document structure: {}", e.getMessage(), e);
            throw e; // Re-throw to be handled by controller
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        logger.info("Successfully generated PDF absence report byte array.");
        return baos.toByteArray();
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        table.addCell(cell);
    }

    // Implement the student-specific PDF method here if needed
    // @Override
    // public byte[] exportStudentAbsenceReportToPdf(...) { ... }
}
