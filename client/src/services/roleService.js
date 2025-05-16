import axiosInstance from '@/lib/axiosInstance';

const API_URL = '/roles'; // Using plural as per backend controller

/**
 * Gets all roles
 * @returns {Promise<Array>} A promise that resolves to an array of role objects
 */
const getAllRoles = async () => {
    try {
        console.log("roleService: Fetching all roles...");
        const response = await axiosInstance.get(`${API_URL}`);
        console.log("roleService: Roles fetched successfully:", response.data.length);
        return response;
    } catch (error) {
        console.error('roleService: Error fetching roles:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch roles');
    }
};

/**
 * Gets a role by ID
 * @param {string} roleId - The ID of the role to fetch
 * @returns {Promise<object>} A promise that resolves to the role object
 */
const getRoleById = async (roleId) => {
    try {
        console.log(`roleService: Fetching role with ID ${roleId}...`);
        const response = await axiosInstance.get(`${API_URL}/${roleId}`);
        console.log("roleService: Role fetched successfully:", response.data);
        return response;
    } catch (error) {
        console.error(`roleService: Error fetching role ${roleId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch role');
    }
};

/**
 * Creates a new role
 * @param {object} roleData - Role data object with name, description, and permissions
 * @returns {Promise<object>} A promise that resolves to the created role
 */
const createRole = async (roleData) => {
    try {
        console.log("roleService: Creating new role...", roleData);
        const response = await axiosInstance.post(`${API_URL}`, roleData);
        console.log("roleService: Role created successfully:", response.data);
        return response;
    } catch (error) {
        console.error('roleService: Error creating role:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create role');
    }
};

/**
 * Updates an existing role
 * @param {string} roleId - The ID of the role to update
 * @param {object} roleData - Updated role data
 * @returns {Promise<object>} A promise that resolves to the updated role
 */
const updateRole = async (roleId, roleData) => {
    try {
        console.log(`roleService: Updating role ${roleId}...`, roleData);
        const response = await axiosInstance.put(`${API_URL}/${roleId}`, roleData);
        console.log("roleService: Role updated successfully:", response.data);
        return response;
    } catch (error) {
        console.error(`roleService: Error updating role ${roleId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update role');
    }
};

/**
 * Deletes a role
 * @param {string} roleId - The ID of the role to delete
 * @returns {Promise<void>} A promise that resolves when the role is deleted
 */
const deleteRole = async (roleId) => {
    try {
        console.log(`roleService: Deleting role ${roleId}...`);
        const response = await axiosInstance.delete(`${API_URL}/${roleId}`);
        console.log("roleService: Role deleted successfully");
        return response;
    } catch (error) {
        console.error(`roleService: Error deleting role ${roleId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete role');
    }
};

/**
 * Updates permissions for a role
 * @param {string} roleId - The ID of the role
 * @param {Array<string>} permissions - Array of permission strings
 * @returns {Promise<object>} A promise that resolves to the updated role
 */
const updateRolePermissions = async (roleId, permissions) => {
    try {
        console.log(`roleService: Updating permissions for role ${roleId}...`, permissions);
        const response = await axiosInstance.put(`${API_URL}/${roleId}/permissions`, permissions);
        console.log("roleService: Permissions updated successfully");
        return response;
    } catch (error) {
        console.error(`roleService: Error updating permissions for role ${roleId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update permissions');
    }
};

/**
 * Gets all available permissions in the system
 * @returns {Promise<Array<string>>} A promise that resolves to an array of permission strings
 */
// This endpoint may need to be added to your backend
const getAllPermissions = async () => {
    try {
        console.log("roleService: Fetching all available permissions...");
        // Since there's no endpoint to get all available permissions, we might need a different approach
        // Option 1: Use a hardcoded list of permissions from the frontend (as defined in RoleManagement.jsx)
        // Option 2: Add a new endpoint in your backend
        // For now, we'll return a mock response based on the list in RoleManagement.jsx
        const mockPermissions = [
            'DASHBOARD_VIEW', 'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DELETE',
            'ATTENDANCE_VIEW', 'ATTENDANCE_EDIT', 'DEPARTMENT_VIEW', 'DEPARTMENT_EDIT',
            'SUBJECT_VIEW', 'SUBJECT_EDIT', 'REPORT_VIEW', 'EMAIL_SEND',
            'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE',
            'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE', 'AI_SEARCH'
        ];
        console.log("roleService: Permissions fetched from frontend constants:", mockPermissions.length);
        return { data: mockPermissions };
    } catch (error) {
        console.error('roleService: Error fetching permissions:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch permissions');
    }
};

const roleService = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
    getAllPermissions
};

export default roleService;
