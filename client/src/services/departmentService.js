import axiosInstance from '@/lib/axiosInstance';

const API_BASE_URL = 'http://localhost:8080/api';

export const departmentService = {  // Named export
    getAllDepartments: async () => {
        try {
            const response = await axiosInstance.get('/departments');
            return response.data;
        } catch (error) {
            console.error("Error fetching departments:", error.response?.data || error.message);
            // Re-throw the error so the calling component can handle it
            throw error.response?.data || new Error('Failed to fetch departments'); 
        }
    },
    getDepartmentById: async (id) => {
        try {
            const response = await axiosInstance.get(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching department ${id}:`, error);
        }
    },
    getDepartmentByName: async (name) => {
        try {
            const response = await axiosInstance.get(`/departments/name/${name}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching department ${name}:`, error);
        }
    },
    createDepartment: async (department) => {
        try {
            const response = await axiosInstance.post('/departments', department);
            return response.data;
        } catch (error) {
            console.error("Error creating department:", error);
        }
    },
    updateDepartment: async (id, department) => {
        try {
            console.log(`Updating department ${id} with data:`, JSON.stringify(department));
            const response = await axiosInstance.put(`/departments/${id}`, department, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Department update response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating department ${id}:`, error.response?.data || error.message || error);
            throw error.response?.data || new Error(`Failed to update department ${id}`);
        }
    },
    deleteDepartment: async (id) => {
        try {
            const response = await axiosInstance.delete(`/departments/${id}`);
            return response.data; // Or return status/confirmation
        } catch (error) {
            console.error(`Error deleting department ${id}:`, error);
        }
    },
    getDepartmentStatistics: async (departmentName, startDate, endDate) => {
        try {
            const response = await axiosInstance.get(`/attendance/statistics/department/${departmentName}`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching department statistics for ${departmentName}:`, error);
        }
    }
};