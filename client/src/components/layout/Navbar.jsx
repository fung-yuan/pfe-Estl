import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  return (
    <header className="bg-card text-card-foreground border-b sticky top-0 z-10">
      <div className="container mx-auto h-16 px-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}