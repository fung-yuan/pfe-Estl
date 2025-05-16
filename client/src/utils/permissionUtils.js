/**
 * Permission utilities to check if users have specific permissions
 */

/**
 * Check if a user has a specific permission
 * @param {Array<string>} userPermissions - Array of permission strings the user has
 * @param {string} requiredPermission - The permission to check for
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  // Special case: 'ADMIN' role has all permissions
  if (userPermissions.includes('ADMIN_ALL')) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if a user has any of the specified permissions
 * @param {Array<string>} userPermissions - Array of permission strings the user has
 * @param {Array<string>} requiredPermissions - Array of permissions to check for
 * @returns {boolean} - Whether the user has any of the permissions
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions || !Array.isArray(requiredPermissions)) {
    return false;
  }
  
  // Special case: 'ADMIN' role has all permissions
  if (userPermissions.includes('ADMIN_ALL')) {
    return true;
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Define permission constants for easier reference
 */
export const PERMISSIONS = {
  // User management permissions
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',
  
  // Role management permissions
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_EDIT: 'ROLE_EDIT',
  ROLE_DELETE: 'ROLE_DELETE',
  
  // Student permissions
  STUDENT_VIEW: 'STUDENT_VIEW',
  STUDENT_CREATE: 'STUDENT_CREATE',
  STUDENT_EDIT: 'STUDENT_EDIT',
  STUDENT_DELETE: 'STUDENT_DELETE',
  
  // Absence permissions
  ABSENCE_VIEW: 'ABSENCE_VIEW',
  ABSENCE_CREATE: 'ABSENCE_CREATE',
  ABSENCE_EDIT: 'ABSENCE_EDIT',
  ABSENCE_DELETE: 'ABSENCE_DELETE',
  
  // Admin special permissions
  ADMIN_ALL: 'ADMIN_ALL',
  
  // Dashboard access
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  
  // Search access
  SEARCH_ACCESS: 'SEARCH_ACCESS',
};
