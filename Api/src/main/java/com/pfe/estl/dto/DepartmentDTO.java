package com.pfe.estl.dto;

public class DepartmentDTO {
    private Long id;
    private String name;
    
    // Constructors, getters and setters
    public DepartmentDTO() {}
    
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
}