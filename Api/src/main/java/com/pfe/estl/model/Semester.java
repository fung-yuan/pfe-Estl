package com.pfe.estl.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., "Semester 1", "Semester 2"

    @OneToMany(mappedBy = "semester")
    private List<Student> students;

    @OneToMany(mappedBy = "semester")
    private List<Subject> subjects;

    // Constructors, Getters, and Setters
    public Semester() {}

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

    public List<Student> getStudents() {
        return students;
    }

    public void setStudents(List<Student> students) {
        this.students = students;
    }

    public List<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<Subject> subjects) {
        this.subjects = subjects;
    }
}
