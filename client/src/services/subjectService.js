// filepath: c:\Users\dell\OneDrive\Desktop\estl-pfe\client\src\services\subjectService.js
import axiosInstance from '@/lib/axiosInstance';

const API_BASE_URL = 'http://localhost:8080/api';

const subjectService = {
    getAllSubjects: async () => {
        try {
            const response = await axiosInstance.get('/subjects');
            return response.data;
        } catch (error) {
            console.error("Error fetching subjects:", error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to fetch subjects');
        }
    },
    getSubjectById: async (id) => {
        try {
            const response = await axiosInstance.get(`/subjects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching subject ${id}:`, error.response?.data || error.message);
            throw error.response?.data || new Error(`Failed to fetch subject ${id}`);
        }
    },
    getSubjectsByDepartmentAndSemester: async (departmentName, semesterId) => {
        console.log(`Service: Fetching subjects for Dept: ${departmentName}, Sem: ${semesterId}`);
        try {
            const response = await axiosInstance.get(`/subjects/department/${departmentName}/semester/${semesterId}`);
            console.log('Service: Subjects fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching subjects for Dept: ${departmentName}, Sem: ${semesterId}:`, error.response?.data || error.message);
            throw error.response?.data || new Error(`Failed to fetch subjects for Dept: ${departmentName}, Sem: ${semesterId}`);
        }
    },
    createSubject: async (subject) => {
        try {
            const response = await axiosInstance.post('/subjects', subject);
            return response.data;
        } catch (error) {
            console.error("Error adding subject:", error.response?.data || error.message);
            throw error.response?.data || new Error('Failed to add subject');
        }
    },
    updateSubject: async (id, subject) => {
        try {
            console.log(`Updating subject ${id} with data:`, JSON.stringify(subject));
            const response = await axiosInstance.put(`/subjects/${id}`, subject, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Subject update response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating subject ${id}:`, error.response?.data || error.message || error);
            // Log more detailed error information
            if (error.response) {
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
                console.error('Error response data:', error.response.data);
            }
            throw error.response?.data || new Error(`Failed to update subject ${id}`);
        }
    },
    deleteSubject: async (id) => {
        try {
            const response = await axiosInstance.delete(`/subjects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting subject ${id}:`, error.response?.data || error.message);
            throw error.response?.data || new Error(`Failed to delete subject ${id}`);
        }
    }
};

export default subjectService;