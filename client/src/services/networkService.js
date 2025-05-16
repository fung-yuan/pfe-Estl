/**
 * Network service to detect backend availability and manage offline state
 * Provides mock data for components when backend is unavailable
 */

import axiosInstance from '../lib/axiosInstance';

// Central state for offline detection
let backendAvailable = true;
let offlineMode = false;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

// Listeners for network status changes
const listeners = [];

/**
 * Check if the backend is available
 * Uses a cached result if checked recently
 */
export const checkBackendAvailability = async (force = false) => {
  const now = Date.now();
  
  // Use cached result if checked recently and not forced
  if (!force && now - lastCheckTime < CHECK_INTERVAL) {
    return backendAvailable;
  }
  
  try {
    // Use our dedicated ping endpoint that has no security constraints
    const response = await fetch('http://localhost:8080/api/ping', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    
    lastCheckTime = now;
    if (response.ok) {
      backendAvailable = true;
      // If we were offline but now online, exit offline mode
      if (offlineMode) {
        setOfflineMode(false);
      }
    } else {
      // Server responded, but with an error status (e.g., 500)
      console.log(`Network service: Backend ping responded with status ${response.status}`);
      backendAvailable = false;
      // Auto-enable offline mode if backend is unavailable
      if (!offlineMode) {
        setOfflineMode(true);
      }
    }
    return backendAvailable;
  } catch (error) {
    console.log('Network service: Backend is unreachable', error.message);
    lastCheckTime = now;
    backendAvailable = false;
    
    // Auto-enable offline mode if backend is unavailable
    if (!offlineMode) {
      setOfflineMode(true);
    }
    
    return false;
  }
};

/**
 * Set offline mode explicitly
 */
export const setOfflineMode = (offline) => {
  if (offlineMode !== offline) {
    offlineMode = offline;
    // Notify listeners of status change
    listeners.forEach(listener => listener(offline));
    console.log(`Network service: Offline mode ${offline ? 'enabled' : 'disabled'}`);
  }
};

/**
 * Get current offline mode status
 */
export const isOfflineMode = () => offlineMode;

/**
 * Subscribe to offline mode changes
 */
export const subscribeToNetworkStatus = (callback) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Mock data provider for components when offline
 */
export const getMockData = (dataType) => {
  switch (dataType) {
    case 'roles':
      return [
        { id: 1, name: 'ADMIN', description: 'Administrator' },
        { id: 2, name: 'TEACHER', description: 'Teacher' },
        { id: 3, name: 'STUDENT', description: 'Student' }
      ];
      
    case 'users':
      return [
        { id: 1, username: 'admin', fullName: 'Administrator', email: 'admin@example.com', role: 'ADMIN' },
        { id: 2, username: 'teacher1', fullName: 'Teacher One', email: 'teacher1@example.com', role: 'TEACHER' },
        { id: 3, username: 'student1', fullName: 'Student One', email: 'student1@example.com', role: 'STUDENT' }
      ];
      
    case 'departments':
      return [
        { id: 1, name: 'Computer Science', code: 'CS' },
        { id: 2, name: 'Business Administration', code: 'BA' },
        { id: 3, name: 'Engineering', code: 'ENG' }
      ];
      
    case 'semesters':
      return [
        { id: 1, name: 'Fall 2023' },
        { id: 2, name: 'Spring 2024' },
        { id: 3, name: 'Summer 2024' }
      ];
      
    case 'dashboardStats':
      return {
        totalStudents: 250,
        totalAbsences: 1250,
        averageAbsenceRate: 12.5,
        mostAbsentDepartment: 'Engineering',
        recentTrend: 'Decreasing'
      };
      
    default:
      return [];
  }
};

// Start background check
setInterval(checkBackendAvailability, CHECK_INTERVAL);

// Initial check on load
checkBackendAvailability(true).catch(() => {
  console.log('Network service: Initial check failed, enabling offline mode');
  setOfflineMode(true);
});

export default {
  checkBackendAvailability,
  isOfflineMode,
  setOfflineMode,
  subscribeToNetworkStatus,
  getMockData
};
