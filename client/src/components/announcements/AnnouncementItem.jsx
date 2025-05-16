import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns'; // For date formatting

const AnnouncementItem = ({ announcement }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{announcement.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Posted on: {announcement.publishedAt ? format(new Date(announcement.publishedAt), 'PPP p') : 'Date not available'}
          {announcement.authorName && <span className="ml-2">by {announcement.authorName}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Using dangerouslySetInnerHTML for content that might contain HTML from a rich text editor in the future.
            Ensure content is sanitized on the backend if it comes from user input.
            For now, assuming content is simple text or safe HTML. */}
        <div 
          className="prose prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: announcement.content.replace(/\n/g, '<br />') }} 
        />
      </CardContent>
    </Card>
  );
};

export default AnnouncementItem;
