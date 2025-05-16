import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import StudentManagement from '../pages/StudentManagement';
import AttendanceTracking from '../pages/AttendanceTracking';
import Reports from '../pages/Reports';
import DepartmentManagement from '../pages/DepartmentManagement';
import ErrorBoundary from '../components/ErrorBoundary';

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/attendance" element={<AttendanceTracking />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/departments" element={<DepartmentManagement />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;