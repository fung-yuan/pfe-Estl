import axiosInstance from '@/lib/axiosInstance';

const API_URL = '/user'; // Removed '/api' prefix as axiosInstance likely includes it

/**
 * Fetches the details of the currently logged-in user.
 * @returns {Promise<object>} A promise that resolves to the user data (e.g., { username, email, id, roles }).
 */
const getCurrentUser = async () => {
    try {
        console.log("userService: Fetching current user details...");
        const response = await axiosInstance.get(`${API_URL}/me`);
        
        // Log the complete response for debugging
        console.log("userService: Current user details fetched successfully:", response);
        console.log("userService: Response data:", response.data);
        
        // Ensure we're returning a properly structured object
        const userData = {
            username: response.data.username || '',
            email: response.data.email || '',
            id: response.data.id,
            roles: response.data.roles || []
        };
        
        console.log("userService: Processed user data:", userData);
        return userData;
    } catch (error) {
        console.error('userService: Error fetching current user:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch user details');
    }
};

/**
 * Changes the password for the currently logged-in user.
 * @param {object} passwordData - Object containing { currentPassword, newPassword }.
 * @returns {Promise<object>} A promise that resolves to the success message from the backend.
 */
const changePassword = async (passwordData) => {
    try {
        console.log("userService: Attempting to change password...");
        // axiosInstance POST already returns response.data
        const response = await axiosInstance.post(`${API_URL}/change-password`, passwordData);
        console.log("userService: Password change response received.", response);
        return response; // Should be the success message string
    } catch (error) {
        console.error('userService: Error changing password:', error.response?.data || error.message);
        // Throw the specific error message from the backend if available
        throw error.response?.data || new Error('Password change failed');
    }
};

/**
 * Gets all users
 * @returns {Promise<Array>} A promise that resolves to an array of user objects
 */
const getAllUsers = async () => {
    try {
        console.log("userService: Fetching all users...");
        const response = await axiosInstance.get(`${API_URL}/admin/users`);
        console.log("userService: Users fetched successfully:", response.data.length);
        return response;
    } catch (error) {
        console.error('userService: Error fetching users:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch users');
    }
};

/**
 * Gets a user by ID
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<object>} A promise that resolves to the user object
 */
const getUserById = async (userId) => {
    try {
        console.log(`userService: Fetching user with ID ${userId}...`);
        const response = await axiosInstance.get(`${API_URL}/admin/users/${userId}`);
        console.log("userService: User fetched successfully:", response.data);
        return response;
    } catch (error) {
        console.error(`userService: Error fetching user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch user');
    }
};

/**
 * Creates a new user
 * @param {object} userData - User data object with username, email, password, etc.
 * @returns {Promise<object>} A promise that resolves to the created user
 */
const createUser = async (userData) => {
    try {
        console.log("userService: Creating new user...", userData);
        const response = await axiosInstance.post(`${API_URL}/admin/users`, userData);
        console.log("userService: User created successfully:", response.data);
        return response;
    } catch (error) {
        console.error('userService: Error creating user:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create user');
    }
};

/**
 * Updates an existing user
 * @param {string} userId - The ID of the user to update
 * @param {object} userData - Updated user data
 * @returns {Promise<object>} A promise that resolves to the updated user
 */
const updateUser = async (userId, userData) => {
    try {
        console.log(`userService: Updating user ${userId}...`, userData);
        const response = await axiosInstance.put(`${API_URL}/admin/users/${userId}`, userData);
        console.log("userService: User updated successfully:", response.data);
        return response;
    } catch (error) {
        console.error(`userService: Error updating user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update user');
    }
};

/**
 * Deletes a user
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<void>} A promise that resolves when the user is deleted
 */
const deleteUser = async (userId) => {
    try {
        console.log(`userService: Deleting user ${userId}...`);
        const response = await axiosInstance.delete(`${API_URL}/admin/users/${userId}`);
        console.log("userService: User deleted successfully");
        return response;
    } catch (error) {
        console.error(`userService: Error deleting user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete user');
    }
};

/**
 * Resets a user's password
 * @param {string} userId - The ID of the user
 * @param {object} passwordData - Object containing { password }
 * @returns {Promise<object>} A promise that resolves to a success message
 */
const resetPassword = async (userId, passwordData) => {
    try {
        console.log(`userService: Resetting password for user ${userId}...`);
        const response = await axiosInstance.post(`${API_URL}/admin/users/${userId}/reset-password`, passwordData);
        console.log("userService: Password reset successfully");
        return response;
    } catch (error) {
        console.error(`userService: Error resetting password for user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to reset password');
    }
};

/**
 * Assigns roles to a user
 * @param {string} userId - The ID of the user
 * @param {Array<string>} roleIds - Array of role IDs to assign
 * @returns {Promise<object>} A promise that resolves to the updated user
 */
const assignRolesToUser = async (userId, roleIds) => {
    try {
        console.log(`userService: Assigning roles to user ${userId}...`, roleIds);
        // Note: This endpoint might need adjustment based on your API design - may need to loop through roleIds
        const promises = roleIds.map(roleId => 
            axiosInstance.post(`${API_URL}/admin/users/${userId}/roles/${roleId}`));
        const responses = await Promise.all(promises);
        console.log("userService: Roles assigned successfully");
        return responses[0]; // Return the first response for now
    } catch (error) {
        console.error(`userService: Error assigning roles to user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to assign roles');
    }
};

/**
 * Gets the permissions of the currently logged-in user
 * @returns {Promise<Array<string>>} A promise that resolves to an array of permission strings
 */
const getCurrentUserPermissions = async () => {
    try {
        console.log("userService: Fetching current user permissions...");
        // First get the current user details
        const userResponse = await axiosInstance.get(`${API_URL}/me`);
        const userId = userResponse.data.id;
        
        // Then get permissions for this user
        const response = await axiosInstance.get(`${API_URL}/admin/users/${userId}/permissions`);
        console.log("userService: Permissions fetched successfully:", response.data);
        return response;
    } catch (error) {
        console.error('userService: Error fetching permissions:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch permissions');
    }
};

export const userService = {
    getCurrentUser,
    changePassword,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    assignRolesToUser,
    getCurrentUserPermissions
};
