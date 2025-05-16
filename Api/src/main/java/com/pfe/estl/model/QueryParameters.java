package com.pfe.estl.model;

import java.time.LocalDate;

/**
 * Helper class to store parameters extracted from natural language queries
 */
public class QueryParameters {
    private String departmentName;
    private String subjectName;
    private String semesterName;
    private Integer minAbsenceHours;
    private Integer maxAbsenceHours;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean hasExactlyZeroAbsences;
    
    public QueryParameters() {
    }
    
    public String getDepartmentName() {
        return departmentName;
    }
    
    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
    
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    
    public String getSemesterName() {
        return semesterName;
    }
    
    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }
    
    public Integer getMinAbsenceHours() {
        return minAbsenceHours;
    }
    
    public void setMinAbsenceHours(Integer minAbsenceHours) {
        this.minAbsenceHours = minAbsenceHours;
    }
    
    public Integer getMaxAbsenceHours() {
        return maxAbsenceHours;
    }
    
    public void setMaxAbsenceHours(Integer maxAbsenceHours) {
        this.maxAbsenceHours = maxAbsenceHours;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public Boolean getHasExactlyZeroAbsences() {
        return hasExactlyZeroAbsences;
    }
    
    public void setHasExactlyZeroAbsences(Boolean hasExactlyZeroAbsences) {
        this.hasExactlyZeroAbsences = hasExactlyZeroAbsences;
    }
}