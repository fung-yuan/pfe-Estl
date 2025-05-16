import React from 'react';
import AnnouncementItem from '@/components/announcements/AnnouncementItem';

const AnnouncementList = ({ announcements }) => {
  if (!announcements || announcements.length === 0) {
    return <p className="text-center text-muted-foreground">No announcements available.</p>;
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <AnnouncementItem key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
};

export default AnnouncementList;
