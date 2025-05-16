package com.pfe.estl.controller;

import com.pfe.estl.dto.AnnouncementDto;
import com.pfe.estl.service.AnnouncementService;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
// @CrossOrigin(origins = "http://localhost:3000") // If your frontend is on a different port
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Autowired
    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    // Create a new announcement
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDto> createAnnouncement(@RequestBody AnnouncementDto announcementDto) {
        AnnouncementDto createdAnnouncement = announcementService.createAnnouncement(announcementDto);
        return new ResponseEntity<>(createdAnnouncement, HttpStatus.CREATED);
    }

    // Get a single announcement by ID
    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementDto> getAnnouncementById(@PathVariable("id") Long id) {
        AnnouncementDto announcement = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(announcement);
    }

    // Get all announcements (typically for admin)
   
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnnouncementDto>> getAllAnnouncements() {
        List<AnnouncementDto> announcements = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    // Get active and relevant announcements for the current user
    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementDto>> getActiveAnnouncementsForCurrentUser() {
        List<AnnouncementDto> announcements = announcementService.getActiveAnnouncementsForCurrentUser();
        return ResponseEntity.ok(announcements);
    }

    // Update an existing announcement
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDto> updateAnnouncement(
            @PathVariable("id") Long id, @RequestBody AnnouncementDto announcementDto) {
        AnnouncementDto updatedAnnouncement = announcementService.updateAnnouncement(id, announcementDto);
        return ResponseEntity.ok(updatedAnnouncement);
    }

    // Delete an announcement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable("id") Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    // Publish an announcement
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDto> publishAnnouncement(@PathVariable("id") Long id) {
        AnnouncementDto publishedAnnouncement = announcementService.publishAnnouncement(id);
        return ResponseEntity.ok(publishedAnnouncement);
    }

    // Unpublish an announcement
    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDto> unpublishAnnouncement(@PathVariable("id") Long id) {
        AnnouncementDto unpublishedAnnouncement = announcementService.unpublishAnnouncement(id);
        return ResponseEntity.ok(unpublishedAnnouncement);
    }
}
