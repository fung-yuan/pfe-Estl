package com.pfe.estl.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    // Many-to-one relationship with Department
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // Many-to-one relationship with Semester
    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    // One-to-many relationship with AttendanceRecord
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    private List<AttendanceRecord> attendanceRecords;

    // Constructors, getters, setters
    public Subject() {}

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
