package com.pfe.estl.model;

/**
 * Enum to represent different methods of delivering announcements to recipients
 */
public enum DeliveryType {
    /**
     * Announcement is only shown in the portal interface
     */
    PORTAL,
    
    /**
     * Announcement is sent via email
     */
    EMAIL,
    
    /**
     * Announcement is delivered both in portal and via email
     */
    BOTH
}
