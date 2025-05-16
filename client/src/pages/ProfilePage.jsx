import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State to hold user data
  const [userData, setUserData] = useState({
    username: '',
    email: ''
  });

  // Fetch fresh user data from the API
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      console.log('ProfilePage: Fetching fresh user data from API...');
      const response = await userService.getCurrentUser();
      console.log('ProfilePage: User data fetched successfully:', response);
      console.log('ProfilePage: Email in response:', response.email);
      
      // Check if we have valid email data
      if (!response.email) {
        console.warn('ProfilePage: No email found in API response');
      }
      
      // Update the user data state with the fetched data
      const newUserData = {
        username: response.username || authUser?.username || '',
        email: response.email || authUser?.email || ''
      };
      
      console.log('ProfilePage: Setting user data state to:', newUserData);
      setUserData(newUserData);
      
      // Also update localStorage with the latest data
      const updatedUserDetails = {
        ...JSON.parse(localStorage.getItem('userDetails') || '{}'),
        email: response.email
      };
      console.log('ProfilePage: Updating localStorage with:', updatedUserDetails);
      localStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
      
    } catch (error) {
      console.error('ProfilePage: Error fetching user data:', error);
      // Fall back to data from context or localStorage
      const storedUserData = localStorage.getItem('userDetails');
      let parsedStoredData = {};
      
      if (storedUserData) {
        try {
          parsedStoredData = JSON.parse(storedUserData);
          console.log('ProfilePage: Using data from localStorage:', parsedStoredData);
        } catch (e) {
          console.error('ProfilePage: Error parsing stored user data:', e);
        }
      }
      
      setUserData({
        username: authUser?.username || parsedStoredData?.username || '',
        email: authUser?.email || parsedStoredData?.email || ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user data when the component mounts
    fetchUserData();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate password inputs
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive'
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirmation do not match.',
        variant: 'destructive'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setPasswordLoading(true);
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        {/* User Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View your basic account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p>Loading profile information...</p>
            ) : (
              <>
                {/* Display user data from state */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="mt-1">{userData.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="mt-1">{userData.email || 'Not provided'}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter your current password"
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm your new password"
                />
              </div>
              
              <Button type="submit" disabled={passwordLoading} className="w-full">
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
