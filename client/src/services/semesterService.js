// filepath: c:\Users\dell\OneDrive\Desktop\estl-pfe\client\src\services\semesterService.js
import axiosInstance from '@/lib/axiosInstance';

const API_BASE_URL = 'http://localhost:8080/api';

const semesterService = {
    getAllSemesters: async () => {
        try {
            const response = await axiosInstance.get('/semesters');
            return response.data;
        } catch (error) {
            console.error("Error fetching semesters:", error);
        }
    },

    getSemesterById: async (id) => {
        try {
            const response = await axiosInstance.get(`/semesters/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching semester ${id}:`, error);
        }
    },  

    getSemestersByDepartment: async (departmentName) => {
        try {
            const response = await axiosInstance.get(`/semesters/department/${departmentName}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching semesters by department ${departmentName}:`, error);
        }
    }
};

export default semesterService;