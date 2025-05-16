package com.pfe.estl.repository;

import com.pfe.estl.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    // Custom query methods can be added here later if needed
    // For example:
    // List<Announcement> findByTargetAudienceTypeAndIsPublishedTrue(AudienceType audienceType);
    // Page<Announcement> findByIsPublishedTrueAndExpiresAtAfter(LocalDateTime now, Pageable pageable);
}
