import axiosInstance from '@/lib/axiosInstance'; // Use the configured instance


// Base URL should now be handled by axiosInstance
// const API_BASE_URL = 'http://localhost:8080/api';

export const studentService = {
    getAllStudents: () => {
        return axiosInstance.get('/students');
    },
    getStudentById: (id) => {
        return axiosInstance.get(`/students/${id}`);
    },
    getStudentsByDepartment: (departmentName) => {
        return axiosInstance.get(`/students/department/${departmentName}`);
    },
    getStudentsByDepartmentAndSemester: async (departmentName, semesterId) => {
        console.log(`Service: Fetching students for Dept Name: ${departmentName}, Sem ID: ${semesterId}`);
        if (!departmentName || !semesterId) {
            console.error("Service Error: Department name or semester ID is missing for fetching students.");
            throw new Error("Department name and semester ID are required for fetching students.");
        }
        try {
            const response = await axiosInstance.get(`/students/department/${departmentName}/semester/${semesterId}`);
            console.log('Service: Students response:', response);
            // --- FIX: Return response.data directly, ensuring it's an array ---
            return response?.data || []; // Return data array or empty array if data is missing
        } catch (error) {
            console.error('Service Error fetching students:', error.response?.data || error.message || error);
            throw error; // Re-throw error to be caught by the component
        }
    },
    // New method that will fetch students by department, semester, and then filter by subject on the frontend
    getStudentsByDepartmentAndSemesterAndSubject: async (departmentName, semesterId, subjectId) => {
        console.log(`Service: Fetching students for Dept: ${departmentName}, Sem: ${semesterId}, Subject: ${subjectId}`);
        if (!departmentName || !semesterId) {
            console.error("Service Error: Department name or semester ID is missing for fetching students.");
            throw new Error("Department name and semester ID are required for fetching students.");
        }
        try {
            // Since we don't have a specific backend endpoint for filtering by subject,
            // we'll get students by department and semester, then filter them client-side
            const response = await axiosInstance.get(`/students/department/${departmentName}/semester/${semesterId}`);
            console.log('Service: Students response before subject filtering:', response);

            // Return the data directly (we'll handle subject filtering in the component)
            return response?.data || [];
        } catch (error) {
            console.error('Service Error fetching students:', error.response?.data || error.message || error);
            throw error;
        }
    },
    createStudent: async (studentData) => {
        try {
            const payload = {
                fullName: studentData.fullName,
                studentId: studentData.studentId,
                email: studentData.email, // Include email field
                department: studentData.department ? {
                    id: Number(studentData.department.id)
                } : null,
                semester: studentData.semester ? {
                    id: Number(studentData.semester.id)
                } : null
            };

            console.log('Sending create student request with payload:', JSON.stringify(payload));

            const response = await axiosInstance.post('/students', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Create student response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in createStudent service:', error);

            if (error.response && error.response.data) {
                console.error('Server error details:', error.response.data);
                const responseText = error.response.data.message ||
                    error.response.data.error ||
                    JSON.stringify(error.response.data);

                throw new Error(`Server error: ${responseText}`);
            }

            throw error;
        }
    },
    updateStudent: async (id, studentData) => {
        try {
            const payload = {
                id: id,
                fullName: studentData.fullName,
                studentId: studentData.studentId,
                email: studentData.email, // Include email field
                department: studentData.department ? {
                    id: Number(studentData.department.id)
                } : null,
                semester: studentData.semester ? {
                    id: Number(studentData.semester.id)
                } : null
            };

            console.log('Sending update student request with payload:', JSON.stringify(payload));

            const response = await axiosInstance.put(`/students/${id}`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Update student response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in updateStudent service:', error);

            if (error.response && error.response.data) {
                console.error('Server error details:', error.response.data);
                throw new Error(`Server error: ${JSON.stringify(error.response.data)}`);
            }

            throw error;
        }
    },
    deleteStudent: (id) => {
        return axiosInstance.delete(`/students/${id}`);
    },
    getStudentAttendance: (studentId, startDate, endDate) => {
        return axiosInstance.get(`/attendance/student/${studentId}/dateRange`, {
            params: { startDate, endDate }
        });
    },
    getStudentAttendanceStats: (studentId, startDate, endDate) => {
        return axiosInstance.get(`/attendance/statistics/student/${studentId}`, {
            params: { startDate, endDate }
        });
    },
    getAllDepartments: async () => {
        try {
            const response = await (api || axiosInstance).get('/departments');
            return response.data;
        } catch (error) {
            console.error('Error fetching departments:', error.response?.data || error.message || error);
            throw error;
        }
    },
    getSubjectsByDepartmentAndSemester: async (departmentName, semesterId) => {
        console.log(`Service: Fetching subjects for Dept Name: ${departmentName}, Sem ID: ${semesterId}`);
        try {
            // Use axiosInstance to ensure Authorization header is included
            const response = await axiosInstance.get(`/subjects/department/${departmentName}/semester/${semesterId}`);
            console.log('Service: Subjects API response:', response);

            // Return data directly to simplify component logic
            return response.data || []; // Return empty array if data is undefined
        } catch (error) {
            console.error('Service Error fetching subjects:', error.response?.data || error.message || error);
            throw error;
        }
    }
};

export default studentService;