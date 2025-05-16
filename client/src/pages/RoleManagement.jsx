import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Pencil } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import roleService from '../services/roleService';

// List of available permissions in the system
const AVAILABLE_PERMISSIONS = [
  { id: 'DASHBOARD_VIEW', name: 'View Dashboard', category: 'Dashboard' },
  { id: 'STUDENT_VIEW', name: 'View Students', category: 'Students' },
  { id: 'STUDENT_CREATE', name: 'Create Students', category: 'Students' },
  { id: 'STUDENT_EDIT', name: 'Edit Students', category: 'Students' },
  { id: 'STUDENT_DELETE', name: 'Delete Students', category: 'Students' },
  { id: 'ATTENDANCE_VIEW', name: 'View Attendance', category: 'Attendance' },
  { id: 'ATTENDANCE_EDIT', name: 'Edit Attendance', category: 'Attendance' },
  { id: 'DEPARTMENT_VIEW', name: 'View Departments', category: 'Departments' },
  { id: 'DEPARTMENT_EDIT', name: 'Edit Departments', category: 'Departments' },
  { id: 'SUBJECT_VIEW', name: 'View Subjects', category: 'Subjects' },
  { id: 'SUBJECT_EDIT', name: 'Edit Subjects', category: 'Subjects' },
  { id: 'REPORT_VIEW', name: 'View Reports', category: 'Reports' },
  { id: 'EMAIL_SEND', name: 'Send Emails', category: 'Communication' },
  { id: 'USER_VIEW', name: 'View Users', category: 'User Management' },
  { id: 'USER_CREATE', name: 'Create Users', category: 'User Management' },
  { id: 'USER_EDIT', name: 'Edit Users', category: 'User Management' },
  { id: 'USER_DELETE', name: 'Delete Users', category: 'User Management' },
  { id: 'ROLE_VIEW', name: 'View Roles', category: 'Role Management' },
  { id: 'ROLE_CREATE', name: 'Create Roles', category: 'Role Management' },
  { id: 'ROLE_EDIT', name: 'Edit Roles', category: 'Role Management' },
  { id: 'ROLE_DELETE', name: 'Delete Roles', category: 'Role Management' },
  { id: 'AI_SEARCH', name: 'Use AI Search', category: 'AI Features' },
];

// Group permissions by category
const groupPermissionsByCategory = () => {
  const grouped = {};
  AVAILABLE_PERMISSIONS.forEach(permission => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = [];
    }
    grouped[permission.category].push(permission);
  });
  return grouped;
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const permissionCategories = groupPermissionsByCategory();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllRoles();
      setRoles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roles. Please try again later.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!validateRoleForm(newRole)) return;
      
      await roleService.createRole(newRole);
      toast({
        title: 'Success',
        description: 'Role created successfully!',
        variant: 'default'
      });
      setNewRole({
        name: '',
        description: '',
        permissions: []
      });
      loadRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create role',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!validateRoleForm(editingRole)) return;
      
      await roleService.updateRole(editingRole.id, editingRole);
      toast({
        title: 'Success',
        description: 'Role updated successfully!',
        variant: 'default'
      });
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRole = async () => {
    try {
      await roleService.deleteRole(roleToDelete.id);
      toast({
        title: 'Success',
        description: 'Role deleted successfully!',
        variant: 'default'
      });
      setShowDeleteDialog(false);
      setRoleToDelete(null);
      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete role. It may be assigned to users.',
        variant: 'destructive'
      });
      setShowDeleteDialog(false);
    }
  };

  const validateRoleForm = (role) => {
    if (!role || !role.name) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive'
      });
      return false;
    }
    
    // Ensure permissions exists and has a length property
    if (!role.permissions || role.permissions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please assign at least one permission to the role',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  const handlePermissionToggle = (permissionId, role, setRole) => {
    // Ensure permissions exists, if not initialize as empty array
    const permissions = [...(role.permissions || [])];
    if (permissions.includes(permissionId)) {
      const index = permissions.indexOf(permissionId);
      permissions.splice(index, 1);
    } else {
      permissions.push(permissionId);
    }
    setRole({ ...role, permissions });
  };

  const handleToggleAllPermissionsInCategory = (category, role, setRole, value) => {
    const categoryPermissions = permissionCategories[category].map(p => p.id);
    let updatedPermissions;
    
    // Ensure permissions exists, if not initialize as empty array
    const existingPermissions = role.permissions || [];
    
    if (value) {
      // Add all permissions in this category that aren't already included
      updatedPermissions = [...new Set([...existingPermissions, ...categoryPermissions])];
    } else {
      // Remove all permissions in this category
      updatedPermissions = existingPermissions.filter(p => !categoryPermissions.includes(p));
    }
    
    setRole({ ...role, permissions: updatedPermissions });
  };

  const areAllCategoryPermissionsSelected = (category, permissions = []) => {
    // Add default empty array for permissions if undefined
    const categoryPermissions = permissionCategories[category].map(p => p.id);
    return categoryPermissions.every(p => permissions.includes(p));
  };

  const getPermissionName = (permissionId) => {
    const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  // Guard against roles being null
  const safeRoles = Array.isArray(roles) ? roles : [];
  
  // Make search term handling safe
  const safeSearchTerm = (searchTerm || '').toLowerCase();
  
  const filteredRoles = safeRoles.filter(role => {
    // Skip if role is null/undefined
    if (!role) return false;
    
    // Add null checks for properties
    const name = (role.name || '').toLowerCase();
    const description = (role.description || '').toLowerCase();
    
    return name.includes(safeSearchTerm) ||
      description.includes(safeSearchTerm);
  });

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Create and manage roles with specific permissions to control access across the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="w-1/3">
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create New Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="role-name">Role Name*</Label>
                    <Input
                      id="role-name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="e.g., Admin, Teacher, Student"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="role-desc">Description</Label>
                    <Textarea
                      id="role-desc"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      placeholder="Describe the purpose of this role"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label>Assign Permissions*</Label>
                    <ScrollArea className="h-[350px] border rounded-md p-4">
                      {Object.entries(permissionCategories).map(([category, permissions]) => (
                        <div key={category} className="mb-4">
                          <div className="flex items-center space-x-2 mb-2 pb-1 border-b">
                            <Checkbox
                              id={`category-${category}`}
                              checked={areAllCategoryPermissionsSelected(category, newRole.permissions)}
                              onCheckedChange={(checked) => 
                                handleToggleAllPermissionsInCategory(category, newRole, setNewRole, checked)}
                            />
                            <Label htmlFor={`category-${category}`} className="font-semibold cursor-pointer">
                              {category}
                            </Label>
                          </div>
                          <div className="ml-6 space-y-2">
                            {permissions.map(permission => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${permission.id}`}
                                  checked={newRole.permissions.includes(permission.id)}
                                  onCheckedChange={() => 
                                    handlePermissionToggle(permission.id, newRole, setNewRole)}
                                />
                                <Label htmlFor={`perm-${permission.id}`} className="cursor-pointer">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateRole}>Create Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No roles found</TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || 'No description'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {role.permissions && role.permissions.length > 0 ? (
                            role.permissions.slice(0, 5).map(permission => (
                              <Badge key={permission} variant="outline">
                                {getPermissionName(permission)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-500">No permissions assigned</span>
                          )}
                          {role.permissions && role.permissions.length > 5 && (
                            <Badge variant="outline">
                              +{role.permissions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost" 
                                size="icon"
                                onClick={() => setEditingRole({...role})}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Role</DialogTitle>
                              </DialogHeader>
                              {editingRole && (
                                <div className="grid gap-4 py-4">
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-role-name">Role Name*</Label>
                                    <Input
                                      id="edit-role-name"
                                      value={editingRole.name}
                                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-role-desc">Description</Label>
                                    <Textarea
                                      id="edit-role-desc"
                                      value={editingRole.description || ''}
                                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    <Label>Assign Permissions*</Label>
                                    <ScrollArea className="h-[350px] border rounded-md p-4">
                                      {Object.entries(permissionCategories).map(([category, permissions]) => (
                                        <div key={category} className="mb-4">
                                          <div className="flex items-center space-x-2 mb-2 pb-1 border-b">
                                            <Checkbox
                                              id={`edit-category-${category}`}
                                              checked={areAllCategoryPermissionsSelected(category, editingRole.permissions)}
                                              onCheckedChange={(checked) => 
                                                handleToggleAllPermissionsInCategory(category, editingRole, setEditingRole, checked)}
                                            />
                                            <Label htmlFor={`edit-category-${category}`} className="font-semibold cursor-pointer">
                                              {category}
                                            </Label>
                                          </div>
                                          <div className="ml-6 space-y-2">
                                            {permissions.map(permission => (
                                              <div key={permission.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`edit-perm-${permission.id}`}
                                                  checked={editingRole.permissions?.includes(permission.id)}
                                                  onCheckedChange={() => 
                                                    handlePermissionToggle(permission.id, editingRole, setEditingRole)}
                                                />
                                                <Label htmlFor={`edit-perm-${permission.id}`} className="cursor-pointer">
                                                  {permission.name}
                                                </Label>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </ScrollArea>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateRole}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this role? This action will affect all users assigned to this role.</p>
            {roleToDelete && (
              <p className="mt-2 font-medium">Role name: {roleToDelete.name}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteRole}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;
