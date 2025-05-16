import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:8080/api'; // Ensure this matches your backend

// Create a dedicated Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken'); 
    
    // If the token exists, add it to the Authorization header
    // But only if the Authorization header isn't already set (to avoid overriding explicit headers)
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = token;
      
      // Add a custom header to indicate this is an AJAX request
      // This helps prevent the browser's authentication dialog
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    // Special handling for file uploads
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      // For multipart/form-data, let the browser set the content type with boundary
      delete config.headers['Content-Type'];
    } else if (config.method === 'put' || config.method === 'post') {
      // Ensure Content-Type is set for other PUT and POST requests
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      hasAuthHeader: !!config.headers['Authorization']
    });
    
    return config;
  },
  (error) => {
    // Handle request error here
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor to handle authentication failures and prevent browser dialogs
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    console.log('Response successful:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response && error.response.status === 401) {
      // Unauthorized - Token might be invalid or expired
      console.error('Axios Interceptor: Unauthorized request (401). Clearing token.');
      
      // Store the current URL to redirect back after login
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
      }
      
      // Clear the authentication token
      localStorage.removeItem('authToken');
      localStorage.removeItem('userDetails');
      
      // Check if we're already on the login page to prevent redirect loops
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log('Axios Interceptor: Redirecting to login page...');
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
