package com.pfe.estl.service;

import com.pfe.estl.dto.AnnouncementDto;

import java.util.List;

public interface AnnouncementService {

    /**
     * Creates a new announcement.
     * Implementations should handle permission checks.
     * @param announcementDto DTO containing announcement data.
     * @return The created AnnouncementDto.
     */
    AnnouncementDto createAnnouncement(AnnouncementDto announcementDto);

    /**
     * Updates an existing announcement.
     * Implementations should handle permission checks.
     * @param id The ID of the announcement to update.
     * @param announcementDto DTO containing updated data.
     * @return The updated AnnouncementDto.
     */
    AnnouncementDto updateAnnouncement(Long id, AnnouncementDto announcementDto);

    /**
     * Deletes an announcement by its ID.
     * Implementations should handle permission checks.
     * @param id The ID of the announcement to delete.
     */
    void deleteAnnouncement(Long id);

    /**
     * Publishes an announcement, making it visible.
     * @param id The ID of the announcement to publish.
     * @return The published AnnouncementDto.
     */
    AnnouncementDto publishAnnouncement(Long id);

    /**
     * Unpublishes an announcement, hiding it.
     * @param id The ID of the announcement to unpublish.
     * @return The unpublished AnnouncementDto.
     */
    AnnouncementDto unpublishAnnouncement(Long id);

    /**
     * Retrieves a single announcement by its ID.
     * @param id The ID of the announcement.
     * @return The AnnouncementDto, or null if not found.
     */
    AnnouncementDto getAnnouncementById(Long id);

    /**
     * Retrieves all announcements (e.g., for an admin view).
     * Implementations should consider pagination for large datasets.
     * @return A list of all AnnouncementDtos.
     */
    List<AnnouncementDto> getAllAnnouncements();

    /**
     * Retrieves active and relevant announcements for the currently logged-in user.
     * This method will filter announcements based on the user's role, department,
     * and whether the announcement is published and not expired.
     * Implementations should consider pagination.
     * @return A list of relevant AnnouncementDtos.
     */
    List<AnnouncementDto> getActiveAnnouncementsForCurrentUser();
}
