package com.pfe.estl.dto;

/**
 * DTO for natural language query requests
 */
public class NLQueryRequest {
    private String query;

    public NLQueryRequest() {
    }

    public NLQueryRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
