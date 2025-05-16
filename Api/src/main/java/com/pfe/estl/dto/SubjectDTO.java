package com.pfe.estl.dto;

public class SubjectDTO {
    private Long id;
    private String name;
    private String code;
    private DepartmentInfo department;
    private SemesterInfo semester;

    public SubjectDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DepartmentInfo getDepartment() {
        return department;
    }

    public void setDepartment(DepartmentInfo department) {
        this.department = department;
    }

    public SemesterInfo getSemester() {
        return semester;
    }

    public void setSemester(SemesterInfo semester) {
        this.semester = semester;
    }

    // Nested static class for Department Info
    public static class DepartmentInfo {
        private Long id;
        private String name;
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    // Nested static class for Semester Info
    public static class SemesterInfo {
        private Long id;
        private String name;
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
