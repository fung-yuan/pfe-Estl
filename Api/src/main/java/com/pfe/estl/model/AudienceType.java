package com.pfe.estl.model;

public enum AudienceType {
    ALL_USERS,      // Sent to everyone
    BY_ROLE,        // Sent to users with a specific role (e.g., all 'STUDENT', all 'TEACHER')
    BY_DEPARTMENT   // Sent to all users (students and staff) belonging to a specific department
}
