package com.pfe.estl.service;

import com.pfe.estl.dto.AttendanceRecordDTO;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

  private static final Logger logger = LoggerFactory.getLogger(ExcelExportServiceImpl.class);

  @Override
  public byte[] exportAttendanceToExcel(List<AttendanceRecordDTO> attendanceRecords)
      throws IOException {
    try (Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Sheet sheet = workbook.createSheet("Attendance Report");

      // Create header row
      Row headerRow = sheet.createRow(0);
      String[] headers = {"Student ID", "Subject ID", "Date", "Duration", "Present"};
      for (int i = 0; i < headers.length; i++) {
        Cell cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
      }

      // Fill data rows
      int rowNum = 1;
      for (AttendanceRecordDTO record : attendanceRecords) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue(record.getStudentId());
        row.createCell(1).setCellValue(record.getSubjectId());
        row.createCell(2).setCellValue(record.getDate().toString());
        row.createCell(3).setCellValue(record.getDuration());
        row.createCell(4).setCellValue(record.isPresent());
      }

      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException e) {
      logger.error("Error exporting attendance data to Excel: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public byte[] exportAbsenceReportToExcel(List<Map<String, Object>> absenceReport)
      throws IOException {
    try (Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
      Sheet sheet = workbook.createSheet("Absence Report");

      // Create header row
      Row headerRow = sheet.createRow(0);
      String[] headers = {"Student Name", "Student ID", "Department", "Total Absence Hours"};
      for (int i = 0; i < headers.length; i++) {
        Cell cell = headerRow.createCell(i);
        cell.setCellValue(headers[i]);
      }

      // Fill data rows
      int rowNum = 1;
      for (Map<String, Object> record : absenceReport) {
        Row row = sheet.createRow(rowNum++);
        row.createCell(0).setCellValue((String) record.get("studentName"));
        row.createCell(1).setCellValue((String) record.get("studentId"));
        row.createCell(2).setCellValue((String) record.get("departmentName"));
        row.createCell(3).setCellValue(Integer.parseInt(record.get("totalAbsenceHours").toString()));
      }

      workbook.write(outputStream);
      return outputStream.toByteArray();
    } catch (IOException e) {
      logger.error("Error exporting absence report to Excel: {}", e.getMessage());
      throw e;
    }
  }
}