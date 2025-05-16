package com.pfe.estl.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for returning Excel import operation results
 */
public class ImportResult {
    private int successCount = 0;
    private int failureCount = 0;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private List<String> successMessages = new ArrayList<>();

    // Entity type counts
    private int usersImported = 0;
    private int departmentsImported = 0;
    private int semestersImported = 0;
    private int studentsImported = 0;
    private int subjectsImported = 0;

    public void incrementSuccess() {
        successCount++;
    }

    public void incrementFailure() {
        failureCount++;
    }

    public void addError(String error) {
        errors.add(error);
    }

    public void addWarning(String warning) {
        warnings.add(warning);
    }

    public void addSuccessMessage(String message) {
        successMessages.add(message);
    }

    public void incrementUserCount() {
        usersImported++;
    }

    public void incrementDepartmentCount() {
        departmentsImported++;
    }

    public void incrementSemesterCount() {
        semestersImported++;
    }

    public void incrementStudentCount() {
        studentsImported++;
    }

    public void incrementSubjectCount() {
        subjectsImported++;
    }

    // Getters and setters
    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public List<String> getSuccessMessages() {
        return successMessages;
    }

    public void setSuccessMessages(List<String> successMessages) {
        this.successMessages = successMessages;
    }

    public int getUsersImported() {
        return usersImported;
    }

    public void setUsersImported(int usersImported) {
        this.usersImported = usersImported;
    }

    public int getDepartmentsImported() {
        return departmentsImported;
    }

    public void setDepartmentsImported(int departmentsImported) {
        this.departmentsImported = departmentsImported;
    }

    public int getSemestersImported() {
        return semestersImported;
    }

    public void setSemestersImported(int semestersImported) {
        this.semestersImported = semestersImported;
    }

    public int getStudentsImported() {
        return studentsImported;
    }

    public void setStudentsImported(int studentsImported) {
        this.studentsImported = studentsImported;
    }

    public int getSubjectsImported() {
        return subjectsImported;
    }

    public void setSubjectsImported(int subjectsImported) {
        this.subjectsImported = subjectsImported;
    }
}
