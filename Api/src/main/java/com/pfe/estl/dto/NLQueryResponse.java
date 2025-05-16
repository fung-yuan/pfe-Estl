package com.pfe.estl.dto;

import java.util.List;

/**
 * DTO for natural language query responses
 */
public class NLQueryResponse {
    private List<StudentDTO> students;
    private String summary;
    private String originalQuery;
    private int totalResults;
    private String generatedQuery; // The JPQL query that was generated

    public NLQueryResponse() {
    }

    public NLQueryResponse(List<StudentDTO> students, String summary, String originalQuery, String generatedQuery) {
        this.students = students;
        this.summary = summary;
        this.originalQuery = originalQuery;
        this.generatedQuery = generatedQuery;
        this.totalResults = students != null ? students.size() : 0;
    }

    public List<StudentDTO> getStudents() {
        return students;
    }

    public void setStudents(List<StudentDTO> students) {
        this.students = students;
        this.totalResults = students != null ? students.size() : 0;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getOriginalQuery() {
        return originalQuery;
    }

    public void setOriginalQuery(String originalQuery) {
        this.originalQuery = originalQuery;
    }

    public int getTotalResults() {
        return totalResults;
    }

    public void setTotalResults(int totalResults) {
        this.totalResults = totalResults;
    }

    public String getGeneratedQuery() {
        return generatedQuery;
    }

    public void setGeneratedQuery(String generatedQuery) {
        this.generatedQuery = generatedQuery;
    }
}
