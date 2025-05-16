package com.pfe.estl.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

/**
 * DTO for sending an announcement via email with advanced filtering options
 * Updated to support combined filters
 */
public class EmailAnnouncementDto {
    
    // Announcement details
    private String title;
    private String content;
    
    // Filter options in a nested object
    private FilterOptions filterOptions;
    
    // Default constructor
    public EmailAnnouncementDto() {
    }
    
    // Nested class for filter options
    public static class FilterOptions {
        // Department filter
        private Long departmentId;
        
        // Semester filter
        private Long semesterId;
        
        // Absence threshold filter
        private Integer absenceThreshold;
        
        // Absence date range filter
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        
        // Getters and Setters
        public Long getDepartmentId() {
            return departmentId;
        }
        
        public void setDepartmentId(Long departmentId) {
            this.departmentId = departmentId;
        }
        
        public Long getSemesterId() {
            return semesterId;
        }
        
        public void setSemesterId(Long semesterId) {
            this.semesterId = semesterId;
        }
        
        public Integer getAbsenceThreshold() {
            return absenceThreshold;
        }
        
        public void setAbsenceThreshold(Integer absenceThreshold) {
            this.absenceThreshold = absenceThreshold;
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
    }
    
    // Getters and setters for the main class
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public FilterOptions getFilterOptions() {
        return filterOptions;
    }
    
    public void setFilterOptions(FilterOptions filterOptions) {
        this.filterOptions = filterOptions;
    }
}
