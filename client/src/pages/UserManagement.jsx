import React, { useState, useEffect } from 'react';
import { Trash2, Edit, UserPlus, Key } from 'lucide-react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { userService } from '../services/userService';
import roleService from '../services/roleService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    roleIds: []
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      
      // Process users to ensure roleIds are properly set
      const processedUsers = response.data.map(user => {
        // Extract role IDs from the roles array if it exists
        const roleIds = user.roles ? user.roles.map(role => role.id) : [];
        return {
          ...user,
          roleIds: roleIds
        };
      });
      
      setUsers(processedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again later.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load roles. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!validateUserForm(newUser)) return;
      
      // Transform roleIds array to roles array of objects for backend compatibility
      const userData = {
        ...newUser,
        // Convert roleIds to the format expected by the backend
        roles: (newUser.roleIds || []).map(id => ({ id: id }))
      };
      // Remove properties not needed by the backend
      delete userData.roleIds;
      delete userData.firstName;
      delete userData.lastName;
      
      console.log('Sending user data to backend:', userData);
      
      await userService.createUser(userData);
      toast({
        title: 'Success',
        description: 'User created successfully!',
        variant: 'default'
      });
      setNewUser({
        username: '',
        email: '',
        password: '',
        department: '',
        roleIds: []
      });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Extract error message from various possible error response formats
      let errorMessage = 'Failed to create user';
      
      if (error.response?.data?.message) {
        // If the error contains a backend message, use it
        errorMessage = error.response.data.message;
        
        // Clean up common backend error message format
        if (errorMessage.startsWith('An unexpected error occurred: ')) {
          errorMessage = errorMessage.replace('An unexpected error occurred: ', '');
        }
      }
      
      toast({
        title: 'User Creation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!validateUserForm(editingUser, true)) return;
      
      // Start with a copy of the editing user data
      const updateData = { ...editingUser };
      
      // Don't send password in update
      delete updateData.password;
      
      // Remove first and last name fields that aren't needed by the backend
      delete updateData.firstName;
      delete updateData.lastName;
      
      // Transform roleIds array to roles array of objects for backend compatibility
      if (updateData.roleIds) {
        updateData.roles = (updateData.roleIds || []).map(id => ({ id }));
        delete updateData.roleIds;
      }
      
      console.log('Sending updated user data to backend:', updateData);
      
      await userService.updateUser(editingUser.id, updateData);
      toast({
        title: 'Success',
        description: 'User updated successfully!',
        variant: 'default'
      });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Extract error message from various possible error response formats
      let errorMessage = 'Failed to update user';
      
      if (error.response?.data?.message) {
        // If the error contains a backend message, use it
        errorMessage = error.response.data.message;
        
        // Clean up common backend error message format
        if (errorMessage.startsWith('An unexpected error occurred: ')) {
          errorMessage = errorMessage.replace('An unexpected error occurred: ', '');
        }
      }
      
      toast({
        title: 'User Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await userService.deleteUser(userToDelete.id);
      toast({
        title: 'Success',
        description: 'User deleted successfully!',
        variant: 'default'
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive'
      });
      setShowDeleteDialog(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!newPassword || newPassword.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters long',
          variant: 'destructive'
        });
        return;
      }
      
      if (newPassword !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive'
        });
        return;
      }
      
      await userService.resetPassword(resetPasswordUser.id, { password: newPassword });
      toast({
        title: 'Success',
        description: 'Password reset successfully!',
        variant: 'default'
      });
      setResetPasswordUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset password',
        variant: 'destructive'
      });
    }
  };

  const validateUserForm = (user, isUpdate = false) => {
    // First name and last name no longer required
    if (!user || !user.username || !user.email || (!isUpdate && !user.password)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!isUpdate && user.password && user.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return false;
    }
    
    // Check if roleIds exists and has items
    if (!user.roleIds || user.roleIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please assign at least one role to the user',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  const handleRoleToggle = (roleId, user, setUser) => {
    // Ensure roleIds exists, if not initialize as empty array
    const roleIds = [...(user.roleIds || [])];
    if (roleIds.includes(roleId)) {
      const index = roleIds.indexOf(roleId);
      roleIds.splice(index, 1);
    } else {
      roleIds.push(roleId);
    }
    setUser({ ...user, roleIds });
  };

  const getRoleName = (roleId) => {
    if (!roleId) return 'Unknown Role';
    const role = roles.find(r => r.id === roleId);
    return role ? (role.name || 'Unnamed Role') : 'Unknown Role';
  };

  // Guard against users being null
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Make search term handling safe
  const safeSearchTerm = (searchTerm || '').toLowerCase();
  
  const filteredUsers = safeUsers.filter(user => {
    // Skip if user is null/undefined
    if (!user) return false;
    
    // Add null checks for all properties to avoid errors
    const username = (user.username || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const firstName = (user.firstName || '').toLowerCase();
    const lastName = (user.lastName || '').toLowerCase();
    const department = (user.department || '').toLowerCase();
    
    return username.includes(safeSearchTerm) ||
      email.includes(safeSearchTerm) ||
      firstName.includes(safeSearchTerm) ||
      lastName.includes(safeSearchTerm) ||
      department.includes(safeSearchTerm);
  });

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Create, edit, and manage users and their role assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="w-1/3">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* First name and last name fields removed as not needed by backend */}
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="username">Username*</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password*</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  
                  {/* Department field removed as not needed */}
                  
                  <div className="flex flex-col gap-2">
                    <Label>Assign Roles*</Label>
                    <ScrollArea className="h-[150px] border rounded-md p-4">
                      {roles.map(role => (
                        <div key={role.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={newUser.roleIds.includes(role.id)}
                            onCheckedChange={() => handleRoleToggle(role.id, newUser, setNewUser)}
                          />
                          <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                            {role.name}
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(user.roleIds || []).map(roleId => (
                            <Badge key={roleId} variant="outline">
                              {getRoleName(roleId)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.enabled ? "success" : "destructive"}>
                          {user.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  // Create a complete copy of the user with all fields properly set
                                  console.log('Edit user data:', user);
                                  setEditingUser({
                                    ...user,
                                    // Ensure these fields are explicitly set to avoid undefined values
                                    firstName: user.firstName || '',
                                    lastName: user.lastName || '',
                                    email: user.email || '',
                                    department: user.department || '',
                                    roleIds: user.roleIds || []
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              {editingUser && (
                                <div className="grid gap-4 py-4">
                                  {/* First name and last name fields removed as not needed by backend */}
                                  
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-username">Username*</Label>
                                    <Input
                                      id="edit-username"
                                      value={editingUser.username}
                                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-email">Email*</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={editingUser.email}
                                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="edit-department">Department</Label>
                                    <Input
                                      id="edit-department"
                                      value={editingUser.department || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="user-status"
                                      checked={editingUser.enabled}
                                      onCheckedChange={(checked) => 
                                        setEditingUser({ ...editingUser, enabled: checked })}
                                    />
                                    <Label htmlFor="user-status">Account Enabled</Label>
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    <Label>Assign Roles*</Label>
                                    <ScrollArea className="h-[150px] border rounded-md p-4">
                                      {roles.map(role => (
                                        <div key={role.id} className="flex items-center space-x-2 mb-2">
                                          <Checkbox
                                            id={`edit-role-${role.id}`}
                                            checked={(editingUser?.roleIds || []).includes(role.id)}
                                            onCheckedChange={() => handleRoleToggle(role.id, editingUser, setEditingUser)}
                                          />
                                          <Label htmlFor={`edit-role-${role.id}`} className="cursor-pointer">
                                            {role?.name || 'Unnamed Role'}
                                          </Label>
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
                                <Button onClick={handleUpdateUser}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost" 
                                size="icon"
                                onClick={() => setResetPasswordUser(user)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                              <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                              </DialogHeader>
                              {resetPasswordUser && (
                                <div className="grid gap-4 py-4">
                                  <p>
                                    Resetting password for user: <strong>{resetPasswordUser.username}</strong>
                                  </p>
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                      id="new-password"
                                      type="password"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                    <Input
                                      id="confirm-password"
                                      type="password"
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleResetPassword}>Reset Password</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
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
            <p>Are you sure you want to delete this user?</p>
            {userToDelete && (
              <p className="mt-2 font-medium">Username: {userToDelete.username}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
