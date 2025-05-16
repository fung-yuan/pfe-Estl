package com.pfe.estl.service;

import com.pfe.estl.dto.AttendanceRecordDTO;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ExcelExportService {
    byte[] exportAttendanceToExcel(List<AttendanceRecordDTO> attendanceRecords) throws IOException;
    byte[] exportAbsenceReportToExcel(List<Map<String, Object>> absenceReport) throws IOException;
}