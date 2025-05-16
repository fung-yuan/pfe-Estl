package com.pfe.estl.dto;

import java.time.LocalDateTime;

import com.pfe.estl.model.AudienceType;

public class AnnouncementDto {

    private Long id;
    private String title;
    private String content;
    private Long authorId; // For request binding
    private String authorName; // For response display
    private AudienceType targetAudienceType;
    private String targetAudienceValue;
    private boolean isPublished;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    // Constructors
    public AnnouncementDto() {
    }

    public AnnouncementDto(Long id, String title, String content, Long authorId, String authorName, AudienceType targetAudienceType, String targetAudienceValue, boolean isPublished, LocalDateTime publishedAt, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.authorName = authorName;
        this.targetAudienceType = targetAudienceType;
        this.targetAudienceValue = targetAudienceValue;
        this.isPublished = isPublished;
        this.publishedAt = publishedAt;
        this.createdAt = createdAt;
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

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
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
}
