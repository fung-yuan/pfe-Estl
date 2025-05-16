package com.pfe.estl.model;

import java.time.LocalDateTime;
import java.util.Objects;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience_type", nullable = false)
    private AudienceType targetAudienceType;

    @Column(name = "audience_value")
    private String targetAudienceValue;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false)
    private DeliveryType deliveryType = DeliveryType.PORTAL;

    @Column(name = "is_email_sent", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isEmailSent = false;
    
    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;
    
    @Column(name = "recipient_count")
    private Integer recipientCount = 0;
    
    @Column(name = "department_id")
    private Long departmentId;
    
    @Column(name = "semester_id")
    private Long semesterId;
    
    @Column(name = "absence_date_start")
    private LocalDateTime absenceDateStart;
    
    @Column(name = "absence_date_end")
    private LocalDateTime absenceDateEnd;
    
    @Column(name = "absence_threshold")
    private Integer absenceThreshold;

    @Column(name = "is_published", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean isPublished = false;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Announcement() {
    }

    public Announcement(String title, String content, User author, AudienceType targetAudienceType, String targetAudienceValue, boolean isPublished, LocalDateTime publishedAt) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.targetAudienceType = targetAudienceType;
        this.targetAudienceValue = targetAudienceValue;
        this.isPublished = isPublished;
        this.publishedAt = publishedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public AudienceType getTargetAudienceType() {
        return targetAudienceType;
    }

    public void setTargetAudienceType(AudienceType targetAudienceType) {
        this.targetAudienceType = targetAudienceType;
    }

    public String getTargetAudienceValue() {
        return targetAudienceValue;
    }

    public void setTargetAudienceValue(String targetAudienceValue) {
        this.targetAudienceValue = targetAudienceValue;
    }

    public DeliveryType getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(DeliveryType deliveryType) {
        this.deliveryType = deliveryType;
    }

    public boolean isEmailSent() {
        return isEmailSent;
    }

    public void setEmailSent(boolean emailSent) {
        isEmailSent = emailSent;
    }

    public LocalDateTime getEmailSentAt() {
        return emailSentAt;
    }

    public void setEmailSentAt(LocalDateTime emailSentAt) {
        this.emailSentAt = emailSentAt;
    }

    public Integer getRecipientCount() {
        return recipientCount;
    }

    public void setRecipientCount(Integer recipientCount) {
        this.recipientCount = recipientCount;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }

    public LocalDateTime getAbsenceDateStart() {
        return absenceDateStart;
    }

    public void setAbsenceDateStart(LocalDateTime absenceDateStart) {
        this.absenceDateStart = absenceDateStart;
    }

    public LocalDateTime getAbsenceDateEnd() {
        return absenceDateEnd;
    }

    public void setAbsenceDateEnd(LocalDateTime absenceDateEnd) {
        this.absenceDateEnd = absenceDateEnd;
    }

    public Integer getAbsenceThreshold() {
        return absenceThreshold;
    }

    public void setAbsenceThreshold(Integer absenceThreshold) {
        this.absenceThreshold = absenceThreshold;
    }

    public boolean isPublished() {
        return isPublished;
    }

    public void setPublished(boolean published) {
        isPublished = published;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Lifecycle callback
    @PreUpdate
    @PrePersist
    public void updatePublishedAt() {
        if (this.isPublished && this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Announcement that = (Announcement) o;
        return Objects.equals(id, that.id) &&
               isPublished == that.isPublished &&
               Objects.equals(title, that.title) &&
               Objects.equals(content, that.content) &&
               Objects.equals(author, that.author) &&
               targetAudienceType == that.targetAudienceType &&
               Objects.equals(targetAudienceValue, that.targetAudienceValue) &&
               deliveryType == that.deliveryType &&
               isEmailSent == that.isEmailSent &&
               Objects.equals(emailSentAt, that.emailSentAt) &&
               Objects.equals(recipientCount, that.recipientCount) &&
               Objects.equals(departmentId, that.departmentId) &&
               Objects.equals(semesterId, that.semesterId) &&
               Objects.equals(absenceDateStart, that.absenceDateStart) &&
               Objects.equals(absenceDateEnd, that.absenceDateEnd) &&
               Objects.equals(absenceThreshold, that.absenceThreshold) &&
               Objects.equals(publishedAt, that.publishedAt) &&
               Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, content, author, targetAudienceType, targetAudienceValue, deliveryType, isEmailSent, emailSentAt, recipientCount, departmentId, semesterId, absenceDateStart, absenceDateEnd, absenceThreshold, isPublished, publishedAt, createdAt);
    }

    @Override
    public String toString() {
        return "Announcement{" +
               "id=" + id +
               ", title='" + title + '\'' +
               ", content='" + content + '\'' +
               ", author=" + (author != null ? author.getId() : null) +
               ", targetAudienceType=" + targetAudienceType +
               ", targetAudienceValue='" + targetAudienceValue + '\'' +
               ", deliveryType=" + deliveryType +
               ", isEmailSent=" + isEmailSent +
               ", emailSentAt=" + emailSentAt +
               ", recipientCount=" + recipientCount +
               ", departmentId=" + departmentId +
               ", semesterId=" + semesterId +
               ", absenceDateStart=" + absenceDateStart +
               ", absenceDateEnd=" + absenceDateEnd +
               ", absenceThreshold=" + absenceThreshold +
               ", isPublished=" + isPublished +
               ", publishedAt=" + publishedAt +
               ", createdAt=" + createdAt +
               '}';
    }
}
