import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import subjectService from '@/services/subjectService';
import { departmentService } from '@/services/departmentService';

// Define Semesters statically or fetch if dynamic
const semesters = [
    { id: 1, name: 'Semester 1' },
    { id: 2, name: 'Semester 2' },
    { id: 3, name: 'Semester 3' },
    { id: 4, name: 'Semester 4' }
];

const SubjectManagement = () => {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [semesterId, setSemesterId] = useState("");

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Fetch Subjects
    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await subjectService.getAllSubjects();
            setSubjects(data || []);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to load subjects.",
                variant: "destructive",
            });
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch Departments
    const fetchDepartments = useCallback(async () => {
        console.log('Attempting to fetch departments...'); // Log start
        try {
            const data = await departmentService.getAllDepartments();
            console.log('Departments data received:', data); // Log received data
            setDepartments(data || []);
        } catch (error) {
            console.error('Error fetching departments:', error); // Log error object
            toast({
                title: "Error",
                description: error.message || "Failed to load departments for selection.",
                variant: "destructive",
            });
            setDepartments([]);
        }
    }, [toast]);

    useEffect(() => {
        fetchSubjects();
        fetchDepartments();
    }, [fetchSubjects, fetchDepartments]);

    const resetForm = () => {
        setName("");
        setCode(""); // Reset code
        setDepartmentId("");
        setSemesterId("");
        setSelectedSubject(null);
        setIsEditMode(false);
    };

    const handleAddSubject = () => {
        resetForm();
        setOpen(true);
    };

    const handleEditSubject = (subject) => {
        resetForm();
        setIsEditMode(true);
        setSelectedSubject(subject);
        setName(subject.name || "");
        setCode(subject.code || ""); // Set code
        // Ensure departmentId is set as a string to match SelectItem values
        setDepartmentId(subject.department?.id ? String(subject.department.id) : ""); 
        setSemesterId(subject.semester?.id ? String(subject.semester.id) : ""); // Also ensure semesterId is a string
        setOpen(true);
    };

    const handleDeleteSubject = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteDialog(true);
    };

    const confirmDeleteSubject = async () => {
        try {
            await subjectService.deleteSubject(subjectToDelete.id);
            toast({
                title: "Success",
                description: "Subject deleted successfully.",
            });
            // Instead of refetching, we can remove the deleted subject from state
            setSubjects(prevSubjects => prevSubjects.filter(s => s.id !== subjectToDelete.id));
            setShowDeleteDialog(false);
            setSubjectToDelete(null);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete subject.",
                variant: "destructive",
            });
            setShowDeleteDialog(false);
        }
    };

    const handleSaveSubject = async (e) => {
        e.preventDefault();
        if (!name || !code || !departmentId || !semesterId) {
            toast({ title: "Validation Error", description: "Please fill in all fields.", variant: "destructive" });
            return;
        }
        setFormLoading(true);
        try {
            // Construct subject data, ensuring IDs are numbers if needed by backend
            const subjectData = {
                name,
                code, // Include code field
                department: { id: Number(departmentId) }, 
                semester: { id: Number(semesterId) }
            };

            if (isEditMode && selectedSubject) {
                await subjectService.updateSubject(selectedSubject.id, subjectData);
                toast({ title: "Success", description: "Subject updated successfully." });
            } else {
                await subjectService.createSubject(subjectData);
                toast({ title: "Success", description: "Subject created successfully." });
            }
            setOpen(false);
            resetForm();
            await fetchSubjects(); // Refresh list
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to save subject.",
                variant: "destructive",
            });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Subject Management</CardTitle>
                        <CardDescription>Add, edit, or delete academic subjects.</CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddSubject}><Plus className="mr-2 h-4 w-4" />Add Subject</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEditMode ? "Edit Subject" : "Add Subject"}</DialogTitle>
                                <DialogDescription>
                                    {isEditMode 
                                        ? "Make changes to the subject details below."
                                        : "Add a new subject, assigning it to a department and semester."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSaveSubject}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g., Mathematics" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="code" className="text-right">Code</Label>
                                        <Input 
                                            id="code" 
                                            placeholder="e.g., MATH101" 
                                            value={code} 
                                            onChange={(e) => setCode(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="department" className="text-right">Department</Label>
                                        {/* Use Select for department */}
                                        <Select value={departmentId} onValueChange={setDepartmentId}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            {/* Increase z-index to be higher than dialog */}
                                            <SelectContent className="z-[9999]">
                                                {departments.map((dept) => (
                                                    <SelectItem 
                                                        key={dept.id} 
                                                        value={String(dept.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="semester" className="text-right">Semester</Label>
                                        {/* Use Select for semester */}
                                        <Select value={semesterId} onValueChange={setSemesterId}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select Semester" />
                                            </SelectTrigger>
                                            {/* Increase z-index to be higher than dialog */}
                                            <SelectContent className="z-[9999]"> 
                                                {semesters.map((sem) => (
                                                    <SelectItem 
                                                        key={sem.id} 
                                                        value={String(sem.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        {sem.name}
                                                    </SelectItem> 
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={formLoading}>
                                        {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Subject
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Subject Table */}
                    {loading ? (
                        <div className="flex justify-center items-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects && subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell>{subject.name}</TableCell>
                                        <TableCell>{subject.code}</TableCell>
                                        <TableCell>{subject.department?.name || 'N/A'}</TableCell>
                                        <TableCell>{subject.semester?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditSubject(subject)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteSubject(subject)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No subjects found.</TableCell>
                                </TableRow>
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
                        <p>Are you sure you want to delete this subject?</p>
                        {subjectToDelete && (
                            <div className="mt-2">
                                <p className="font-medium">{subjectToDelete.name} ({subjectToDelete.code})</p>
                                <p className="text-sm text-muted-foreground">
                                    Department: {subjectToDelete.department?.name || 'N/A'}, 
                                    Semester: {subjectToDelete.semester?.name || 'N/A'}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteSubject}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default SubjectManagement;
