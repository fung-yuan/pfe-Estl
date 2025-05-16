package com.pfe.estl.dto;

public class StudentDTO {
    private Long id;
    private String fullName;
    private String studentId;
    private String email;
    private DepartmentDTO department;
    private SemesterDTO semester;
    private int absenceCount;

    public StudentDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public DepartmentDTO getDepartment() {
        return department;
    }

    public void setDepartment(DepartmentDTO department) {
        this.department = department;
    }

    public SemesterDTO getSemester() {
        return semester;
    }

    public void setSemester(SemesterDTO semester) {
        this.semester = semester;
    }
    
    public int getAbsenceCount() {
        return absenceCount;
    }
    
    public void setAbsenceCount(int absenceCount) {
        this.absenceCount = absenceCount;
    }
}