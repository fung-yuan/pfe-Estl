import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from '@/routes'; // Import the routes array
import { NavLink, Link } from 'react-router-dom'; // Added Link
import * as Icons from "lucide-react"; // Import all icons from lucide-react
// Import specific icons needed, including those for the user dropdown and the new panel icons
import { ChevronLeft, ChevronRight, Menu, Bell, User, LogOut, Settings } from "lucide-react"; 
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { PERMISSIONS } from '@/utils/permissionUtils'; // Import permissions constants
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components - KEEP FOR NOW, MIGHT REMOVE LATER IF UNUSED

export function Sidebar() {
  // Get the initial collapsed state from localStorage or default to false (expanded)
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const auth = useAuth(); // Get auth context for logout

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside 
      className={cn(
        "bg-card text-card-foreground h-screen p-4 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Top section: App Name and Collapse Toggle */}
      <div className="flex items-center justify-between mb-4">
        {!collapsed && <h2 className="text-lg font-bold">ESTLAMS</h2>} {/* Changed App Name */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar} 
          className={cn("ml-auto", collapsed && "mx-auto")} // Center button when collapsed
        >
          {/* Use ChevronRight when collapsed (action = open), ChevronLeft when expanded (action = close) */}
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />} 
        </Button>
      </div>
      
      {/* Middle section: Navigation Links */}
      <nav className="space-y-2 flex-grow overflow-y-auto">
        {routes.map((route) => {
          const IconComponent = Icons[route.icon] || Icons.Package; // Default to Package icon if not found
          
          // Check if route should be shown to all users (empty permissions array)
          // or if user has required permissions
          const isPublicRoute = Array.isArray(route.requiredPermissions) && route.requiredPermissions.length === 0;
          const userHasAccess = isPublicRoute || auth.hasAnyPermission(route.requiredPermissions || ['ADMIN_ALL']);
          
          // Debug permission issues
          console.log(`Route ${route.name}: Required permissions:`, route.requiredPermissions, 
                    `Is public route: ${isPublicRoute}, User has access: ${userHasAccess}`);
          
          // Skip rendering this route if user doesn't have permission
          if (!userHasAccess) {
            console.log(`Route ${route.name} NOT SHOWN - missing permissions`);
            return null;
          }
          
          return (
            <NavLink
              key={route.path}
              to={route.path}
              title={collapsed ? route.name : undefined} // Show tooltip when collapsed
              className={({ isActive }) => cn(
                "flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                isActive ? "bg-accent/20 text-primary font-medium border-l-4 border-primary pl-[10px]" : "text-muted-foreground hover:text-foreground",
                collapsed ? "justify-center" : "justify-start",
                isActive && collapsed && "border-l-4 border-primary"
              )}
            >
              {IconComponent && <IconComponent className="w-5 h-5" />}
              {!collapsed && <span className="ml-2 whitespace-nowrap">{route.name}</span>}
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom section: User Profile and Theme Toggle - Always visible but styled differently when collapsed */}
      <div className={cn("mt-auto border-t pt-4", collapsed ? "space-y-3" : "space-y-1")}> 
        {/* Direct Profile Link */}
        <Link 
          to="/profile"
          title={collapsed ? "Profile" : undefined} // Show tooltip when collapsed
          className={cn(
            "flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground hover:text-foreground w-full",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <User className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Profile</span>}
        </Link>

        {/* Direct Logout Button */}
        <Button 
          variant="ghost" 
          onClick={auth.logout} 
          title={collapsed ? "Logout" : undefined} // Show tooltip when collapsed
          className={cn(
            "flex items-center p-2 rounded-md hover:bg-accent transition-colors w-full text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}