package com.pfe.estl.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pfe.estl.ResourceNotFoundException;
import com.pfe.estl.dto.AnnouncementDto;
import com.pfe.estl.model.Announcement;
import com.pfe.estl.model.User;
import com.pfe.estl.repository.AnnouncementRepository;
import com.pfe.estl.repository.UserRepository;
import com.pfe.estl.service.AnnouncementService;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Autowired
    public AnnouncementServiceImpl(AnnouncementRepository announcementRepository, UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
    }

    // --- Helper Methods for DTO/Entity Mapping ---
    private AnnouncementDto convertToDto(Announcement announcement) {
        if (announcement == null) return null;
        return new AnnouncementDto(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getAuthor() != null ? announcement.getAuthor().getId() : null,
                announcement.getAuthor() != null ? announcement.getAuthor().getUsername() : "Unknown Author",
                announcement.getTargetAudienceType(),
                announcement.getTargetAudienceValue(),
                announcement.isPublished(),
                announcement.getPublishedAt(),
                announcement.getCreatedAt()
        );
    }

    private Announcement convertToEntity(AnnouncementDto dto, User author) {
        if (dto == null) return null;
        Announcement announcement = new Announcement();
        announcement.setId(dto.getId()); // Should be null for new entities
        announcement.setTitle(dto.getTitle());
        announcement.setContent(dto.getContent());
        announcement.setAuthor(author);
        announcement.setTargetAudienceType(dto.getTargetAudienceType());
        announcement.setTargetAudienceValue(dto.getTargetAudienceValue());
        announcement.setPublished(dto.isPublished());
        announcement.setPublishedAt(dto.getPublishedAt());
        return announcement;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UsernameNotFoundException("Current user not authenticated.");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    // --- Service Method Implementations (Partial - to be completed) ---

    @Override
    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementDto announcementDto) {
        // TODO: Add role-based security check (e.g., only ADMIN can create)
        User currentUser = getCurrentUser();
        Announcement announcement = convertToEntity(announcementDto, currentUser);
        announcement.setPublished(false); // Draft by default
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return convertToDto(savedAnnouncement);
    }

    @Override
    @Transactional
    public AnnouncementDto updateAnnouncement(Long id, AnnouncementDto announcementDto) {
        // TODO: Add role-based security check
        Announcement existingAnnouncement = announcementRepository.findById(id).orElse(null);
        if (existingAnnouncement == null) {
            throw new ResourceNotFoundException("Announcement", "id", id);
        }

        // Update fields from DTO
        existingAnnouncement.setTitle(announcementDto.getTitle());
        existingAnnouncement.setContent(announcementDto.getContent());
        existingAnnouncement.setTargetAudienceType(announcementDto.getTargetAudienceType());
        existingAnnouncement.setTargetAudienceValue(announcementDto.getTargetAudienceValue());

        Announcement updatedAnnouncement = announcementRepository.save(existingAnnouncement);
        return convertToDto(updatedAnnouncement);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long id) {
        // TODO: Add role-based security check
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement", "id", id); // Replace with specific exception
        }
        announcementRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AnnouncementDto publishAnnouncement(Long id) {
        // TODO: Add role-based security check
        Announcement announcement = announcementRepository.findById(id).orElse(null);
        if (announcement == null) {
            throw new ResourceNotFoundException("Announcement", "id", id);
        }
        announcement.setPublished(true);
        // The @PreUpdate/@PrePersist in Announcement entity should set publishedAt
        Announcement publishedAnnouncement = announcementRepository.save(announcement);
        return convertToDto(publishedAnnouncement);
    }

    @Override
    @Transactional
    public AnnouncementDto unpublishAnnouncement(Long id) {
        // TODO: Add role-based security check
        Announcement announcement = announcementRepository.findById(id).orElse(null);
        if (announcement == null) {
            throw new ResourceNotFoundException("Announcement", "id", id);
        }
        announcement.setPublished(false);
        Announcement unpublishedAnnouncement = announcementRepository.save(announcement);
        return convertToDto(unpublishedAnnouncement);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementDto getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id).orElse(null);
        if (announcement == null) {
            return null;
        }
        return convertToDto(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAllAnnouncements() {
        // TODO: Add role-based security check (only ADMIN)
        // TODO: Consider pagination for admin views
        return announcementRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getActiveAnnouncementsForCurrentUser() {
        User currentUser = getCurrentUser(); // Assuming this method fetches the User entity with roles and department

        return announcementRepository.findAll().stream()
                .filter(Announcement::isPublished)
                .filter(ann -> {
                    if (ann.getTargetAudienceType() == null) { // Should not happen if data is clean, but good to check
                        return false;
                    }
                    switch (ann.getTargetAudienceType()) {
                        case ALL_USERS:
                            return true;
                        case BY_ROLE:
                            // Check if the announcement's target role is one of the user's roles
                            // Assumes targetAudienceValue stores a single role name for BY_ROLE announcements
                            return currentUser.getRoles() != null && 
                                   currentUser.getRoles().stream()
                                      .anyMatch(role -> role.getName().equals(ann.getTargetAudienceValue()));
                        case BY_DEPARTMENT:
                            // Since department field has been removed from User entity, 
                            // BY_DEPARTMENT audience type is no longer functional
                            // Returning false as users no longer have departments
                            return false;
                        default:
                            return false; // Should not happen with defined AudienceType enum
                    }
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
