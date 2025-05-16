import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { userService } from '@/services/userService';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const AdminProfilePage = () => {
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Added for confirmation
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userData = await userService.getCurrentUser();
                setUsername(userData?.username || 'N/A'); 
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError('Failed to load user profile.');
                toast({
                    title: "Error",
                    description: "Could not fetch user profile.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [toast]);

    // Handle password change form submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setPasswordChangeSuccess(false);

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (!newPassword || !currentPassword) {
            setError("All password fields are required.");
            return;
        }

        setIsLoading(true);
        try {
            const message = await userService.changePassword({ 
                currentPassword,
                newPassword 
            });
            setPasswordChangeSuccess(true);
            setCurrentPassword(''); // Clear fields on success
            setNewPassword('');
            setConfirmNewPassword('');
            toast({
                title: "Success",
                description: message || "Password changed successfully!", // Use message from backend
            });
        } catch (err) {
            const errorMessage = typeof err === 'string' ? err : (err.message || 'Failed to change password.');
            setError(errorMessage);
            console.error("Password change error:", err);
            toast({
                title: "Error Changing Password",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Admin Profile</CardTitle>
                    <CardDescription>View your details and manage your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Details Section */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} readOnly disabled className="bg-muted" />
                        {isLoading && !username && <p className="text-sm text-muted-foreground">Loading username...</p>}
                    </div>

                    {/* Change Password Section */}
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <h3 className="text-lg font-semibold border-t pt-4">Change Password</h3>
                        
                        {error && (
                             <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {passwordChangeSuccess && (
                            <Alert variant="success">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>Password changed successfully!</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input 
                                id="currentPassword" 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                                id="newPassword" 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input 
                                id="confirmNewPassword" 
                                type="password" 
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProfilePage;
