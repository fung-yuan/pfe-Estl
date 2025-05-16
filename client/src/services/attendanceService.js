import axiosInstance from '@/lib/axiosInstance';

// Create a helper function for handling blob responses
const handleBlobResponse = async (response) => {
    // Verify that we received a valid blob
    if (response.data.type && (response.data.type.includes('application/pdf') ||
        response.data.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        response.data.type.includes('application/octet-stream'))) {
        return response.data;
    } else if (response.data.type === 'application/json') {
        const errorJson = JSON.parse(await response.data.text());
        throw new Error(errorJson.message || 'Backend error during export');
    } else {
        // If we received something other than a binary file
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const errorJson = JSON.parse(reader.result);
                    reject(new Error(errorJson.message || 'Error generating file'));
                } catch (e) {
                    reject(new Error('Unable to generate requested file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading server response'));
            reader.readAsText(response.data);
        });
    }
};

const saveAttendance = async (attendanceData) => {
    try {
        const response = await axiosInstance.post(`/attendance/save`, attendanceData);
        return response.data; // Or whatever data you expect from the backend
    } catch (error) {
        console.error("Error saving attendance:", error);
        throw error; // Re-throw the error for the component to handle
    }
};

const attendanceService = {
    saveAttendance: saveAttendance, // Add the saveAttendance function
    saveAttendanceRecord: (attendanceRecord) => {
        return axiosInstance.post(`/attendance`, attendanceRecord);
    },
    saveBulkAttendanceRecords: (attendanceRecords) => {
        return axiosInstance.post(`/attendance/bulk`, attendanceRecords);
    },
    getAttendanceRecordById: (id) => {
        return axiosInstance.get(`/attendance/${id}`);
    },
    getAllAttendanceRecords: () => {
        return axiosInstance.get(`/attendance`);
    },
    getAttendanceRecordsByStudent: (studentId) => {
        return axiosInstance.get(`/attendance/student/${studentId}`);
    },
    getAttendanceRecordsByDate: (date) => {
        return axiosInstance.get(`/attendance/date/${date}`);
    },
    getAttendanceRecordsByDateRange: (startDate, endDate) => {
        return axiosInstance.get(`/attendance/dateRange`, {
            params: { startDate, endDate }
        });
    },
    getAttendanceRecordsByStudentAndDateRange: (studentId, startDate, endDate) => {
        return axiosInstance.get(`/attendance/student/${studentId}/dateRange`, {
            params: { startDate, endDate }
        });
    },
    updateAttendanceRecord: (id, attendanceRecord) => {
        return axiosInstance.put(`/attendance/${id}`, attendanceRecord);
    },
    deleteAttendanceRecord: (id) => {
        return axiosInstance.delete(`/attendance/${id}`);
    },
    getDepartmentStatistics: (departmentName, startDate, endDate) => {
        return axiosInstance.get(`/attendance/statistics/department/${departmentName}`, {
            params: { startDate, endDate }
        });
    },
    getStudentStatistics: (studentId, startDate, endDate) => {
        return axiosInstance.get(`/attendance/statistics/student/${studentId}`, {
            params: { startDate, endDate }
        });
    },
    getDailyAttendanceReport: (date) => {
        return axiosInstance.get(`/attendance/report/daily/${date}`);
    },
    getStudentsExceedingAbsenceThreshold: (thresholdHours) => {
        return axiosInstance.get(`/attendance/absence/threshold`, {
            params: { thresholdHours }
        });
    },
    getStudentAbsenceHours: (studentId) => {
        return axiosInstance.get(`/attendance/student/${studentId}/absence-hours`);
    },
    getAbsenceReport: (startDate, endDate, departmentId = 'all', semesterId = 'all', subjectId = 'all', showExceededOnly = false) => {
        return axiosInstance.get(`/attendance/report/absence`, {
            params: {
                startDate,
                endDate,
                departmentId,
                semesterId,
                subjectId,
                showExceededOnly
            }
        });
    },
    getAverageAttendance: (startDate, endDate) => {
        return axiosInstance.get(`/attendance/average`, {
            params: { startDate, endDate }
        });
    },
    getDepartmentAverageAttendance: (departmentName, startDate, endDate) => {
        return axiosInstance.get(`/attendance/average/department/${departmentName}`, {
            params: { startDate, endDate }
        });
    },
    getRecentAttendanceRecords: (limit) => {
        return axiosInstance.get(`/attendance/recent`, {
            params: { limit }
        });
    },
    getDepartmentComparison: (startDate, endDate) => {
        return axiosInstance.get(`/attendance/department/comparison`, {
            params: { startDate, endDate },
        });
    },
    getDashboardStats: (startDate, endDate) => {
        return axiosInstance.get(`/attendance/dashboard/stats`, {
            params: { startDate, endDate },
        });
    },
    exportAttendanceToExcel: async (startDate, endDate) => {
        try {
            const response = await axiosInstance.get(`/attendance/export/attendance`, {
                params: { startDate, endDate },
                responseType: 'blob'
            });
            return handleBlobResponse(response);
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to export attendance data');
        }
    },
    exportAbsenceReportToExcel: async (startDate, endDate, departmentId = 'all', semesterId = 'all', subjectId = 'all', showExceededOnly = false) => {
        try {
            const response = await axiosInstance.get(`/attendance/export/absence-report`, {
                params: {
                    startDate,
                    endDate,
                    departmentId,
                    semesterId,
                    subjectId,
                    showExceededOnly
                },
                responseType: 'blob'
            });
            const blobData = await handleBlobResponse(response);
            return { data: blobData };
        } catch (error) {
            console.error("Error exporting absence report to Excel:", error);
            const message = error.response?.data?.message ||
                (error.response?.data instanceof Blob ? await error.response.data.text() : null) ||
                error.message ||
                'Failed to export Excel report';
            throw new Error(message);
        }
    },
    exportAbsenceReportToPdf: async (startDate, endDate, departmentId = 'all', semesterId = 'all', subjectId = 'all', showExceededOnly = false) => {
        try {
            const response = await axiosInstance.get(`/attendance/export/absence-report-pdf`, {
                params: {
                    startDate,
                    endDate,
                    departmentId,
                    semesterId,
                    subjectId,
                    showExceededOnly
                },
                responseType: 'blob'
            });
            const blobData = await handleBlobResponse(response);
            return { data: blobData };
        } catch (error) {
            console.error("Error exporting absence report to PDF:", error);
            const message = error.response?.data?.message ||
                (error.response?.data instanceof Blob ? await error.response.data.text() : null) ||
                error.message ||
                'Failed to export PDF report';
            throw new Error(message);
        }
    },
    exportStudentAbsenceReport: async (studentId) => {
        try {
            await axiosInstance.get(`/attendance/absence/student/${studentId}`);
            const response = await axiosInstance.get(`/attendance/export/student/${studentId}/absence-report`, {
                responseType: 'blob'
            });
            const blobData = await handleBlobResponse(response);
            return { data: blobData };
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Student not found in the system');
            }
            throw new Error(error.message || 'Unable to generate absence report');
        }
    }
};

export default attendanceService;