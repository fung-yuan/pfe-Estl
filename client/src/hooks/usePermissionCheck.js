import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * A hook that provides permission checking capabilities with a permission denied dialog
 * 
 * @returns {Object} Permission checking utilities
 */
export function usePermissionCheck() {
  const { hasPermission } = useAuth();
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deniedAction, setDeniedAction] = useState('');
  const [deniedResource, setDeniedResource] = useState('');

  /**
   * Check if a user has permission to perform an action, and show dialog if not
   * @param {string} permission - The permission to check
   * @param {string} action - Description of the action (e.g., "edit")
   * @param {string} resource - Resource being acted on (e.g., "student")
   * @returns {boolean} - Whether the user has permission
   */
  const checkPermission = (permission, action, resource) => {
    const hasAccess = hasPermission(permission);
    
    if (!hasAccess) {
      setDeniedAction(action);
      setDeniedResource(resource);
      setPermissionDialogOpen(true);
    }
    
    return hasAccess;
  };

  return {
    checkPermission,
    permissionDialogOpen,
    setPermissionDialogOpen,
    deniedAction,
    deniedResource
  };
}

export default usePermissionCheck;
