package com.pfe.estl.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String studentId;
    
    @Column(nullable = false, unique = true)
    private String email;

    // Many-to-one relationship with Department
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // Many-to-one relationship with Semester
    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    // One-to-many relationship with AttendanceRecord
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<AttendanceRecord> attendanceRecords;

    // Constructors, getters, setters
    public Student() {}

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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Semester getSemester() {
        return semester;
    }

    public void setSemester(Semester semester) {
        this.semester = semester;
    }

    public List<AttendanceRecord> getAttendanceRecords() {
        return attendanceRecords;
    }

    public void setAttendanceRecords(List<AttendanceRecord> attendanceRecords) {
        this.attendanceRecords = attendanceRecords;
    }
}
