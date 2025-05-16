import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from 'lucide-react';
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/context/AuthContext';
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";

const DepartmentManagement = () => {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const { authToken } = useAuth();

    const fetchDepartments = useCallback(async () => {
        if (!authToken) {
            console.log('No auth token available, skipping department fetch');
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/departments', {
                headers: {
                    'Authorization': authToken
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            toast({
                title: "Error",
                description: "Failed to load departments. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast, authToken]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleOpenDialog = () => {
        setIsEditMode(false);
        setSelectedDepartment(null);
        setOpen(true);
    };

    const handleEditDepartment = (department) => {
        setIsEditMode(true);
        setSelectedDepartment(department);
        setOpen(true);
    };

    const handleDeleteDepartment = (department) => {
        setDepartmentToDelete(department);
        setShowDeleteDialog(true);
    };

    const confirmDeleteDepartment = async () => {
        if (!authToken) {
            toast({
                title: "Authentication Error",
                description: "You need to be logged in to perform this action.",
                variant: "destructive",
            });
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/departments/${departmentToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authToken
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast({
                title: "Success",
                description: "Department deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting department:", error);
            toast({
                title: "Error",
                description: "Failed to delete department. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
            setDepartmentToDelete(null);
            fetchDepartments(); // Refresh list
        }
    };

    const [name, setName] = useState("");

    const handleSaveDepartment = async (e) => {
        e.preventDefault();
        
        if (!authToken) {
            toast({
                title: "Authentication Error",
                description: "You need to be logged in to perform this action.",
                variant: "destructive",
            });
            return;
        }
        
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Department name is required.",
                variant: "destructive",
            });
            return;
        }

        setFormLoading(true);
        try {
            if (isEditMode && selectedDepartment) {
                // Update existing department
                const response = await fetch(`http://localhost:8080/api/departments/${selectedDepartment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authToken
                    },
                    body: JSON.stringify({ name }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                toast({
                    title: "Success",
                    description: "Department updated successfully.",
                });
            } else {
                // Create new department
                const response = await fetch('http://localhost:8080/api/departments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authToken
                    },
                    body: JSON.stringify({ name }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                toast({
                    title: "Success",
                    description: "Department created successfully.",
                });
            }

            // Reset form and close dialog
            setName("");
            setOpen(false);
            setIsEditMode(false);
            setSelectedDepartment(null);
            fetchDepartments(); // Refresh list
        } catch (error) {
            console.error("Error saving department:", error);
            toast({
                title: "Error",
                description: "Failed to save department. Please try again.",
                variant: "destructive",
            });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Departments</CardTitle>
                        <CardDescription>Manage departments in your institution</CardDescription>
                    </div>
                    
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenDialog}>Add Department</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSaveDepartment}>
                                <DialogHeader>
                                    <DialogTitle>{isEditMode ? "Edit Department" : "Add Department"}</DialogTitle>
                                    <DialogDescription>
                                        {isEditMode ? "Make changes to the department name." : "Add a new department to the system."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={formLoading}>
                                        {formLoading ? "Saving..." : "Save changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : departments.length > 0 ? (
                                    departments.map(department => (
                                        <TableRow key={department.id}>
                                            <TableCell>{department.name}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditDepartment(department)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(department)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-4">No departments found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete this department? This might affect related student records.</p>
                        {departmentToDelete && (
                            <p className="mt-2 font-medium">Department: {departmentToDelete.name}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteDepartment}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default DepartmentManagement;