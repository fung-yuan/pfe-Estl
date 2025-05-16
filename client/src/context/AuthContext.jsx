import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { checkBackendAvailability, subscribeToNetworkStatus, isOfflineMode, setOfflineMode } from '@/services/networkService';

const AuthContext = createContext(null);

// Key for storing the token in localStorage
const AUTH_TOKEN_KEY = 'authToken';

// Default permissions
const DEFAULT_ADMIN_PERMISSIONS = ['ADMIN_ALL'];
const DEFAULT_USER_PERMISSIONS = [
  'DASHBOARD_VIEW',      // Dashboard access
  'STUDENT_VIEW',        // View students
  'ABSENCE_VIEW',        // View absences
  'SEARCH_ACCESS'        // Access to natural language search
];

export const AuthProvider = ({ children }) => {
  // Initialize state based on localStorage
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(AUTH_TOKEN_KEY));
  // Initialize with admin role for development purposes
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const savedUser = localStorage.getItem('userDetails');
      return savedUser ? JSON.parse(savedUser) : { username: 'admin', role: 'ADMIN', permissions: DEFAULT_ADMIN_PERMISSIONS };
    }
    return null;
  });
  const [userPermissions, setUserPermissions] = useState(() => {
    const savedPermissions = localStorage.getItem('userPermissions');
    if (savedPermissions) {
      return JSON.parse(savedPermissions);
    } else if (userRole === 'ADMIN') {
      return DEFAULT_ADMIN_PERMISSIONS;
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);
  // Use a ref to track the last time we tried to fetch permissions
  const lastPermissionFetchRef = useRef(0);

  // Effect to update localStorage when authToken changes
  useEffect(() => {
    if (authToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('userDetails');
      localStorage.removeItem('userPermissions');
    }
  }, [authToken]);
  
  // Effect to update localStorage when user or permissions change
  useEffect(() => {
    if (user) {
      localStorage.setItem('userDetails', JSON.stringify(user));
    }
    if (userPermissions) {
      localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
    }
  }, [user, userPermissions]);
  
  // Use the network service to check backend availability
  useEffect(() => {
    const checkAndUpdateBackendStatus = async () => {
      if (isAuthenticated) {
        const available = await checkBackendAvailability();
        setBackendAvailable(available);
        
        if (available) {
          console.log("AuthContext: Backend is available");
        } else {
          console.log("AuthContext: Backend is unavailable, using default permissions");
        }
      }
    };
    
    // Initial check
    checkAndUpdateBackendStatus();
    
    // Subscribe to network status changes
    const unsubscribe = subscribeToNetworkStatus((offline) => {
      setBackendAvailable(!offline);
      console.log(`AuthContext: Network status changed, offline=${offline}`); 
    });
    
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Effect to fetch user permissions when logged in
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (isAuthenticated && user) {
        // If user is ADMIN, always set ADMIN_ALL permission first for immediate access
        if (user.role === 'ADMIN') {
          setUserPermissions(DEFAULT_ADMIN_PERMISSIONS);
          console.log("AuthContext: Set default ADMIN permissions:", DEFAULT_ADMIN_PERMISSIONS);
          
          // If offline mode is enabled, don't try to fetch permissions
          if (isOfflineMode() || !backendAvailable) {
            return;
          }
        }
        
        // Don't fetch too frequently
        const now = Date.now();
        if (now - lastPermissionFetchRef.current < 10000) {
          console.log("AuthContext: Skipping permission fetch, too recent");
          return;
        }
        
        lastPermissionFetchRef.current = now;
        
        try {
          console.log("AuthContext: Fetching user permissions...");
          const response = await userService.getCurrentUserPermissions();
          const permissions = response.data || [];
          
          // Add ADMIN_ALL permission for users with ADMIN role
          if (user.role === 'ADMIN' && !permissions.includes('ADMIN_ALL')) {
            permissions.push('ADMIN_ALL');
          }
          
          setUserPermissions(permissions);
          if (!backendAvailable) setBackendAvailable(true);
          // If we're in offline mode but got a successful response, exit offline mode
          if (isOfflineMode()) setOfflineMode(false);
          console.log("AuthContext: User permissions fetched:", permissions);
        } catch (error) {
          console.error("Error fetching user permissions:", error);
          if (backendAvailable) setBackendAvailable(false);
          
          // If not already in offline mode, enable it
          if (!isOfflineMode()) setOfflineMode(true);
          
          // If permission fetching fails, apply default permissions based on role
          let defaultPermissions = [];
          
          // Admin gets all permissions
          if (user.role === 'ADMIN') {
            defaultPermissions = DEFAULT_ADMIN_PERMISSIONS;
          } else {
            // Regular users get basic navigation permissions
            defaultPermissions = [...DEFAULT_USER_PERMISSIONS];
            
            // Check username for additional role-based permissions
            const username = user.username?.toLowerCase() || '';
            if (username.includes('teacher')) {
              defaultPermissions.push('STUDENT_EDIT');
              defaultPermissions.push('ABSENCE_CREATE');
              defaultPermissions.push('ABSENCE_EDIT');
            }
          }
          
          console.log("AuthContext: Using default permissions due to API error:", defaultPermissions);
          setUserPermissions(defaultPermissions);
        }
      }
    };
    
    if (isAuthenticated) {
      fetchUserPermissions();
    }
  }, [isAuthenticated, user?.id, user?.role, user?.username, backendAvailable]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null); // Clear previous errors
    console.log("AuthContext: Attempting login for", username);
    
    try {
      // Login and get complete user info including email
      const loginResponse = await authService.login(username, password);
      console.log("AuthContext: Login response received:", loginResponse);
      
      // Set up a structured user object
      let userData = {
        username: loginResponse.username || username,
        id: loginResponse.id,
        email: loginResponse.email || ''
      };
      
      // Extract role from roles array if available
      if (loginResponse.roles && loginResponse.roles.length > 0) {
        userData.role = loginResponse.roles[0].name;
      } else {
        // Fallback role determination
        userData.role = username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER';
      }
      
      // Special handling for admin user - hardcode email if it's admin and email is still missing
      if (username.toLowerCase() === 'admin' && !userData.email) {
        userData.email = 'admin@example.com';
        console.log("AuthContext: Using hardcoded email for admin:", userData.email);
      }
      
      console.log("AuthContext: Processed user data:", userData);
      
      // Create auth token and update state
      const token = authService.createBasicAuthToken(username, password);
      setIsAuthenticated(true);
      setUser(userData);
      setAuthToken(token);
      
      // Store complete user data in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem('userDetails', JSON.stringify(userData));
      console.log("AuthContext: Saved user data to localStorage:", userData);
      
      // Set initial permissions
      if (userData.role === 'ADMIN') {
        setUserPermissions(DEFAULT_ADMIN_PERMISSIONS);
      } else {
        // Default permissions for regular users
        const defaultPermissions = [...DEFAULT_USER_PERMISSIONS];
        
        // Add role-specific permissions
        if (username.toLowerCase().includes('teacher')) {
          defaultPermissions.push('STUDENT_EDIT');
          defaultPermissions.push('ABSENCE_CREATE');
          defaultPermissions.push('ABSENCE_EDIT');
        }
        
        setUserPermissions(defaultPermissions);
      }
      
      setLoading(false);
      console.log("AuthContext: Login successful, user data:", userData);
      return true; // Indicate success

    } catch (error) {
      console.error("AuthContext: Login failed", error);
      setIsAuthenticated(false);
      setUser(null);
      setAuthToken(null);
      setError(error.message || 'Login failed'); // Store the error message
      setLoading(false);
      return false; // Indicate failure
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    authService.logout(); // Perform service-level logout actions if any
    setIsAuthenticated(false);
    setUser(null);
    setUserPermissions([]);
    setAuthToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY); // Remove token from localStorage
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userPermissions');
    setError(null);
  };

  // Extract userRole for easier access
  const userRole = user?.role;

  /**
   * Check if the current user has a specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} - Whether user has the permission
   */
  const hasPermission = (permission) => {
    // Admin role has all permissions
    if (userRole === 'ADMIN' || userPermissions.includes('ADMIN_ALL')) {
      return true;
    }
    return userPermissions.includes(permission);
  };

  /**
   * Check if user has any of the provided permissions
   * @param {Array<string>} permissions - Array of permissions to check
   * @returns {boolean} - Whether user has any permission
   */
  const hasAnyPermission = useCallback((requiredPermissions) => {
    // Always grant access for admin users - simplest solution
    if (userRole === 'ADMIN') {
      console.log("hasAnyPermission - User has ADMIN role, granting access");
      return true;
    }
    
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    console.log("hasAnyPermission check - User permissions:", userPermissions);
    console.log("hasAnyPermission check - Required permissions:", requiredPermissions);
    
    // Special case: if the user has ADMIN_ALL permission, they have access to everything
    if (userPermissions.includes('ADMIN_ALL')) {
      console.log("hasAnyPermission - User has ADMIN_ALL permission, granting access");
      return true;
    }

    // Check if the user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    return hasPermission;
  }, [userPermissions, userRole]);

  const value = {
    isAuthenticated,
    user,
    userRole,
    userPermissions,
    authToken,
    loading,
    error,
    backendAvailable,
    login,
    logout,
    hasPermission,
    hasAnyPermission
  };

  console.log("AuthContext: Current context values:", { isAuthenticated, userRole });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
