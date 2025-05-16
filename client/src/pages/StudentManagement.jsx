import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { studentService } from "../services/studentService";
import { departmentService } from "../services/departmentService";
import { useToast } from "../hooks/use-toast";
import { usePermissionCheck } from "../hooks/usePermissionCheck";
import { PERMISSIONS } from "../utils/permissionUtils";
import PermissionDeniedDialog from "../components/PermissionDeniedDialog";
import { Edit, Trash2, Plus, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

const StudentManagement = () => {
    const { toast } = useToast();
    // Initialize the permission check hook
    const { 
        checkPermission, 
        permissionDialogOpen, 
        setPermissionDialogOpen, 
        deniedAction, 
        deniedResource 
    } = usePermissionCheck();
    
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [semesters] = useState([
        { id: '1', name: 'Semester 1' },
        { id: '2', name: 'Semester 2' },
        { id: '3', name: 'Semester 3' },
        { id: '4', name: 'Semester 4' }
    ]);

    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [fullName, setFullName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState(""); 
    const [departmentId, setDepartmentId] = useState("");
    const [semesterId, setSemesterId] = useState("");

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");

    const fetchStudents = useCallback(async () => {
        console.log("Attempting to fetch students...");
        setLoading(true);
        try {
            const response = await studentService.getAllStudents();
            console.log("Raw students response:", response);
            const studentsData = response?.data;
            console.log("Extracted students data:", studentsData);
            if (Array.isArray(studentsData)) {
                setStudents(studentsData);
                console.log("Students state updated.");
            } else {
                console.error("Fetched students data is not an array:", studentsData);
                setStudents([]);
                toast({
                    title: "Warning",
                    description: "Received unexpected format for students.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("ERROR fetching students:", error.response?.data || error.message || error);
            toast({
                title: "Error",
                description: "Failed to load students. Check console.",
                variant: "destructive",
            });
            setStudents([]);
        } finally {
            setLoading(false);
            console.log("Finished fetching students.");
        }
    }, [toast]);

    const fetchDepartments = useCallback(async () => {
        console.log("Attempting to fetch departments...");
        try {
            const response = await departmentService.getAllDepartments();
            console.log("Raw departments response:", response);
            const departmentsData = response; 
            console.log("Extracted departments data:", departmentsData);
            if (Array.isArray(departmentsData)) {
                setDepartments(departmentsData);
                console.log("Departments state updated.");
            } else {
                console.error("Fetched departments data is not an array:", departmentsData);
                setDepartments([]);
                toast({
                    title: "Warning",
                    description: "Received unexpected format for departments.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("ERROR fetching departments:", error.response?.data || error.message || error);
            toast({
                title: "Error",
                description: "Failed to load departments. Check console.",
                variant: "destructive",
            });
            setDepartments([]);
        }
    }, [toast]);

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
    }, [fetchStudents, fetchDepartments]);

    // Handle changes to the search input with a slight delay to avoid search on every keystroke
    useEffect(() => {
        // Set a timer to update the searchTerm state after a delay
        const timer = setTimeout(() => {
            setSearchTerm(inputValue.toLowerCase());
        }, 300); // 300ms delay

        // Clear the timer if the inputValue changes before the delay is over
        return () => clearTimeout(timer);
    }, [inputValue]);

    // Filter students based on searchTerm
    const filteredStudents = students.filter(student => {
        if (!searchTerm) return true;
        const fullName = student.fullName || '';
        const studentIdStr = student.studentId || '';
        const email = student.email || '';
        const department = student.department?.name || '';
        return fullName.toLowerCase().includes(searchTerm) ||
            studentIdStr.toLowerCase().includes(searchTerm) ||
            email.toLowerCase().includes(searchTerm) ||
            department.toLowerCase().includes(searchTerm);
    });

    const resetForm = () => {
        setFullName("");
        setStudentId("");
        setEmail("");
        setDepartmentId("");
        setSemesterId("");
        setSelectedStudent(null);
        setIsEditMode(false);
    };

    const handleAddStudent = () => {
        // Check if user has permission to create students
        if (!checkPermission(PERMISSIONS.STUDENT_CREATE, 'create', 'student')) {
            return; // Exit if no permission, dialog will be shown automatically
        }
        
        resetForm();
        setIsEditMode(false);
        setOpen(true);
    };

    const handleEditStudent = (student) => {
        // Check if user has permission to edit students
        if (!checkPermission(PERMISSIONS.STUDENT_EDIT, 'edit', 'student')) {
            return; // Exit if no permission, dialog will be shown automatically
        }
        
        setSelectedStudent(student);
        setFullName(student.fullName || "");
        setStudentId(student.studentId || "");
        setEmail(student.email || "");
        setDepartmentId(student.department?.id || "");
        setSemesterId(student.semester?.id || "");
        setIsEditMode(true);
        setOpen(true);
    };

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            resetForm();
        }
        setOpen(isOpen);
    };

    const handleDeleteStudent = async (idToDelete) => {
        // Check if user has permission to delete students
        if (!checkPermission(PERMISSIONS.STUDENT_DELETE, 'delete', 'student')) {
            return; // Exit if no permission, dialog will be shown automatically
        }
        
        if (confirm("Are you sure you want to delete this student?")) {
            try {
                await studentService.deleteStudent(idToDelete);
                toast({
                    title: "Success",
                    description: "Student deleted successfully.",
                });
                fetchStudents(); // Refresh the list
            } catch (error) {
                console.error("Error deleting student:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete student.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleSaveStudent = async (e) => {
        e.preventDefault();
        if (!fullName || !studentId || !departmentId || !semesterId) {
            toast({
                title: "Error",
                description: "Please fill all required fields.",
                variant: "destructive",
            });
            return;
        }

        setFormLoading(true);

        try {
            const studentData = {
                fullName,
                studentId,
                email,
                departmentId,
                semesterId
            };

            if (isEditMode) {
                // Update existing student
                await studentService.updateStudent(selectedStudent.id, studentData);
                toast({
                    title: "Success",
                    description: "Student updated successfully.",
                });
            } else {
                // Create new student
                await studentService.createStudent(studentData);
                toast({
                    title: "Success",
                    description: "Student added successfully.",
                });
            }

            // Close dialog and refresh list
            setOpen(false);
            resetForm();
            fetchStudents();
        } catch (error) {
            console.error("Error saving student:", error);
            toast({
                title: "Error",
                description: isEditMode ? "Failed to update student." : "Failed to add student.",
                variant: "destructive",
            });
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Card>
            {/* Permission denied dialog */}
            <PermissionDeniedDialog 
                open={permissionDialogOpen} 
                setOpen={setPermissionDialogOpen}
                action={deniedAction}
                resource={deniedResource}
            />
            
            <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Add and manage students in the system.</CardDescription>
                <div className="flex justify-end">
                    <Button 
                        variant="outline" 
                        onClick={handleAddStudent} 
                        className="flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" /> Add Student
                    </Button>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="mb-5">
                    <div className="relative w-full max-w-sm flex items-center">
                        <Input
                            placeholder="Search students..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="pr-10"
                        />
                        {inputValue && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 h-full px-3"
                                onClick={() => {
                                    setInputValue('');
                                    setSearchTerm('');
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Student Dialog */}
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? "Edit Student" : "Add New Student"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditMode 
                                    ? "Update student information in the system."
                                    : "Add a new student to the school management system."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveStudent}>
                            <div className="space-y-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">
                                        Full Name
                                    </Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="studentId">
                                        Student ID
                                    </Label>
                                    <Input
                                        id="studentId"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="department">
                                        Department
                                    </Label>
                                    <Select
                                        value={departmentId}
                                        onValueChange={setDepartmentId}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="semester">
                                        Semester
                                    </Label>
                                    <Select
                                        value={semesterId}
                                        onValueChange={setSemesterId}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {semesters.map((sem) => (
                                                <SelectItem key={sem.id} value={sem.id}>
                                                    {sem.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading ? "Saving..." : isEditMode ? "Update" : "Add"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skel-${index}`}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.fullName}</TableCell>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell>{student.email || 'N/A'}</TableCell>
                                        <TableCell>{student.department?.name || 'N/A'}</TableCell>
                                        <TableCell>{student.semester?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        {searchTerm ? "No students match your search." : "No students found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default StudentManagement;
