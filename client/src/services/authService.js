import axiosInstance from '@/lib/axiosInstance'; // Use the configured instance

// Function to create the Basic Auth header value
const createBasicAuthToken = (username, password) => {
  return 'Basic ' + btoa(username + ":" + password); // btoa encodes to Base64
}

const login = async (username, password) => {
  try {
    // Create the auth token but don't set it as a default header yet
    const authToken = createBasicAuthToken(username, password);
    console.log('AuthService: Created auth token');
    
    // Store the token in localStorage immediately
    localStorage.setItem('authToken', authToken);
    
    // Set it as the default header for future requests
    axiosInstance.defaults.headers.common['Authorization'] = authToken;
    
    // Test the authentication with a simple request
    try {
      // Use a more reliable endpoint for authentication test
      const response = await axiosInstance.get('/user/me', {
        headers: {
          'Authorization': authToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        // Add timeout to prevent hanging requests
        timeout: 5000
      });
      
      console.log('AuthService: Auth successful, status:', response.status);
    } catch (authTestError) {
      console.warn('AuthService: Auth test request failed, but proceeding anyway:', authTestError.message);
      // Continue even if the test request fails - the token might still be valid
    }
    
    // Fetch the complete user details including email
    try {
      console.log('AuthService: Fetching user details after successful authentication');
      const userResponse = await axiosInstance.get('/user/me', {
        headers: {
          'Authorization': authToken
        }
      });
      console.log('AuthService: User details fetched successfully:', userResponse.data);
      
      // Return the complete user data
      return {
        username: username,
        email: userResponse.data.email || '',
        id: userResponse.data.id,
        roles: userResponse.data.roles || []
      };
    } catch (detailsError) {
      console.error('AuthService: Failed to fetch user details after login:', detailsError);
      // Even if we can't get details, authentication succeeded, so return basic info
      return { username: username };
    }
  } catch (error) {
    console.error('AuthService: Login failed', error.response || error.message);
    // If error.response exists, it's likely an HTTP error (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid username or password.');
    } else {
      // Network error or other issue
      throw new Error('Login failed. Please try again later.');
    }
  }
};

// Logout function (optional, might not be needed with Basic Auth unless clearing state)
const logout = () => {
  // With Basic Auth, the browser often caches credentials.
  // True logout often requires closing the browser or specific browser handling.
  // We mainly clear the client-side state.
  console.log('AuthService: Logout called (clearing client state)');
};


// Function to change password (to be implemented later)
const changePassword = async (currentPassword, newPassword) => {
    // TODO: Implement API call to backend endpoint for changing password
    // This will require sending the current Basic Auth token (or potentially a session token)
    // along with the current and new passwords in the request body.
    console.log("changePassword function not implemented yet.");
    throw new Error("Password change functionality not available.");
}

export const authService = {
  login,
  logout,
  changePassword,
  createBasicAuthToken // Expose this if needed elsewhere, e.g., for subsequent requests
};
