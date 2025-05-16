import Dashboard from './pages/Dashboard';
import AttendanceManagement from './pages/AttendanceManagement';
import StudentManagement from './pages/StudentManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import Reports from './pages/Reports';
import SubjectManagement from './pages/SubjectManagement';
import SendEmailAnnouncementPage from './pages/SendEmailAnnouncementPage';
import NaturalLanguageSearchPage from './pages/NaturalLanguageSearchPage';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import ProfilePage from './pages/ProfilePage';
import ExcelImportPage from './pages/ExcelImportPage';

// Import the permissions constants
import { PERMISSIONS } from './utils/permissionUtils';

import {
  Home,
  ClipboardCheck as ClipboardDocumentList,
  Users as UserGroup,
  Building2 as BuildingOffice,
  BarChart as ChartBar,
  BookOpen,
  Bell,
  MessagesSquare,
  Mail,
  Search,
  UserCog,
  Shield,
  User,
  FileSpreadsheet
} from 'lucide-react'; // Import the icons

export const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    icon: 'Home',
    requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW]
  },

  {
    path: '/send-email-announcement',
    name: 'Send Email',
    component: SendEmailAnnouncementPage,
    icon: 'Mail',
    requiredPermissions: ['EMAIL_SEND']
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: AttendanceManagement,
    icon: 'ClipboardCheck',
    requiredPermissions: [PERMISSIONS.ABSENCE_VIEW]
  },
  {
    path: '/students',
    name: 'Students',
    component: StudentManagement,
    icon: 'Users',
    requiredPermissions: [PERMISSIONS.STUDENT_VIEW]
  },
  {
    path: '/departments',
    name: 'Departments',
    component: DepartmentManagement,
    icon: 'Building2',
    requiredPermissions: ['DEPARTMENT_VIEW']
  },
  {
    path: '/subjects',
    name: 'Subjects',
    component: SubjectManagement,
    icon: 'BookOpen',
    requiredPermissions: ['SUBJECT_VIEW']
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    icon: 'BarChart',
    requiredPermissions: ['REPORT_VIEW']
  },
  {
    path: '/search',
    name: 'AI Search',
    component: NaturalLanguageSearchPage,
    icon: 'Search',
    requiredPermissions: ['SEARCH_ACCESS']
  },
  // Profile route removed from main navigation
  // It's accessible via the Profile link in the sidebar footer
  {
    path: '/users',
    name: 'User Management',
    component: UserManagement,
    icon: 'UserCog', // This should work with the Sidebar's dynamic icon lookup
    requiredPermissions: [PERMISSIONS.USER_VIEW]
  },
  {
    path: '/roles',
    name: 'Role Management',
    component: RoleManagement,
    icon: 'Shield', // This should work with the Sidebar's dynamic icon lookup
    requiredPermissions: [PERMISSIONS.ROLE_VIEW]
  },
  {
    path: '/import',
    name: 'Excel Import',
    component: ExcelImportPage,
    icon: 'FileSpreadsheet',
    requiredPermissions: ['ADMIN_ALL'] // Only admins can import data
  },
];