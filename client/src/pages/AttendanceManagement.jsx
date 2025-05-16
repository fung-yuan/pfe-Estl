import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { studentService } from "@/services/studentService";
import { departmentService } from "@/services/departmentService";
import attendanceService from "@/services/attendanceService";
import { DatePicker } from "@/components/ui/DatePicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isValid } from 'date-fns';
import { CalendarIcon, BookOpen, GraduationCap, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

const AttendanceManagement = () => {
    const { toast } = useToast();
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [semesters] = useState([
        { id: '1', name: 'Semester 1' },
        { id: '2', name: 'Semester 2' },
        { id: '3', name: 'Semester 3' },
        { id: '4', name: 'Semester 4' }
    ]);
    
    // Duration options for the class
    const [durations] = useState([
        { value: 60, label: '60 minutes (1 hour)' },
        { value: 120, label: '120 minutes (2 hours)' },
        { value: 180, label: '180 minutes (3 hours)' },
        { value: 240, label: '240 minutes (4 hours)' }
    ]);
    const [selectedDuration, setSelectedDuration] = useState(120); // Default to 2 hours (120 min)

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch departments on component mount
    useEffect(() => {
        const fetchDepartments = async () => {
            console.log("AttendanceManagement: Fetching departments...");
            try {
                const response = await departmentService.getAllDepartments();
                console.log("AttendanceManagement: Raw departments response:", response);
                // The service now directly returns the data array
                const departmentsData = response;
                console.log("AttendanceManagement: Extracted departments data:", departmentsData);

                if (Array.isArray(departmentsData)) {
                    setDepartments(departmentsData);
                    console.log("AttendanceManagement: Departments state updated.");
                } else {
                    console.error("Received unexpected data format for departments:", departmentsData);
                    setDepartments([]);
                    toast({
                        title: "Warning",
                        description: "Received unexpected format for departments.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("ERROR fetching departments:", error.response?.data || error.message || error);
                setDepartments([]);
                toast({
                    title: "Error",
                    description: "Failed to load departments. Check console.",
                    variant: "destructive",
                });
            } finally {
                console.log("AttendanceManagement: Finished fetching departments.");
            }
        };

        fetchDepartments();
    }, [toast]);

    // Fetch subjects when department and semester are selected
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!selectedDepartment || !selectedSemester) {
                console.log("Skipping subject fetch: Department ID or Semester ID not selected.");
                setSubjects([]);
                return;
            }

            console.log("Subject Fetch: Departments state before find:", JSON.stringify(departments));
            console.log("Subject Fetch: Selected Department ID to find:", selectedDepartment);

            const dept = departments.find(d => String(d.id) === String(selectedDepartment));
            console.log("Subject Fetch: Found department:", dept);
            
            const deptName = dept?.name;

            if (!deptName) {
                console.log("Skipping subject fetch: Could not find department name for selected ID.");
                setSubjects([]);
                return;
            }
            
            console.log(`Attempting to fetch subjects for Dept Name: ${deptName}, Sem ID: ${selectedSemester}`);
            try {
                const response = await studentService.getSubjectsByDepartmentAndSemester(deptName, selectedSemester);
                console.log("Raw subjects response:", response);
                
                let subjectsData;
                if (Array.isArray(response)) {
                    subjectsData = response;
                    console.log("Response is already an array of subjects");
                } else {
                    subjectsData = response?.data;
                    console.log("Extracted subjects data from response.data:", subjectsData);
                }
                
                if (Array.isArray(subjectsData)) {
                    setSubjects(subjectsData);
                    console.log("Subjects state updated with", subjectsData.length, "subjects");
                } else {
                    console.error("Fetched subjects data is not an array:", subjectsData);
                    setSubjects([]);
                    toast({
                        title: "Warning",
                        description: "Received unexpected format for subjects.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("ERROR fetching subjects:", error.response?.data || error.message || error);
                toast({
                    title: "Error",
                    description: "Failed to load subjects. Check console.",
                    variant: "destructive",
                });
                setSubjects([]);
            }
        };

        fetchSubjects();
    }, [selectedDepartment, selectedSemester, departments, toast]);

    // Fetch students when department, semester, and subject are selected
    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedDepartment || !selectedSemester) {
                console.log("Skipping student fetch: Department or Semester not selected.");
                setStudents([]);
                setAttendanceRecords([]);
                return;
            }

            console.log("Student Fetch: Departments state before find:", JSON.stringify(departments));
            console.log("Student Fetch: Selected Department ID to find:", selectedDepartment);

            const dept = departments.find(d => String(d.id) === String(selectedDepartment));
            console.log("Student Fetch: Found department:", dept);
            
            const deptName = dept?.name;

            if (!deptName) {
                console.log("Skipping student fetch: Could not find department name for selected ID.");
                setStudents([]);
                setAttendanceRecords([]);
                return;
            }

            try {
                setLoading(true);

                // Convert selectedSemester to a number for proper comparison
                const semesterId = Number(selectedSemester);
                
                console.log(`Attempting to fetch students for Dept Name: ${deptName}, Sem ID: ${semesterId}`);
                
                // Get all students for the department and semester
                const response = await studentService.getStudentsByDepartmentAndSemester(deptName, semesterId);
                console.log("Raw students response:", response);
                
                let studentsData;
                if (Array.isArray(response)) {
                    studentsData = response;
                } else if (response && Array.isArray(response.data)) {
                    studentsData = response.data;
                } else {
                    studentsData = [];
                    console.warn("Unexpected student response format:", response);
                    toast({
                        title: "Warning",
                        description: "Received unexpected format for students.",
                        variant: "destructive",
                    });
                }
                
                console.log("Processed students data:", studentsData);
                
                // Update students state and attendance records
                setStudents(studentsData);
                setAttendanceRecords(studentsData.map(student => ({
                    studentId: student.id,
                    isPresent: true,
                })));
                
                console.log(`Students state updated with ${studentsData.length} students.`);
                
            } catch (error) {
                console.error("ERROR fetching students:", error.response?.data || error.message || error);
                toast({
                    title: "Error",
                    description: "Failed to load students. Check console for details.",
                    variant: "destructive",
                });
                setStudents([]);
                setAttendanceRecords([]);
            } finally {
                setLoading(false);
                console.log("Finished fetching students.");
            }
        };

        fetchStudents();
    }, [selectedDepartment, selectedSemester, departments, toast]);

    const handleDepartmentChange = (departmentId) => {
        console.log(`Department selection changed to ID: ${departmentId}`);
        setSelectedDepartment(departmentId);
        setSelectedSemester('');
        setSelectedSubject('');
        setSubjects([]);
        setStudents([]);
        setAttendanceRecords([]);
    };

    const handleSemesterChange = (semesterId) => {
        console.log(`Semester selection changed to ID: ${semesterId}`);
        setSelectedSemester(semesterId);
        setSelectedSubject('');
        setSubjects([]);
        setStudents([]);
        setAttendanceRecords([]);
    };

    const handleSubjectChange = (subjectId) => {
        console.log(`Subject selection changed to ID: ${subjectId}`);
        setSelectedSubject(subjectId);
        
        // Refresh student list when subject is changed
        if (selectedDepartment && selectedSemester && subjectId) {
            const dept = departments.find(d => String(d.id) === String(selectedDepartment));
            if (dept?.name) {
                setLoading(true);
                console.log(`Reloading students for subject: ${subjectId}`);
                
                studentService.getStudentsByDepartmentAndSemesterAndSubject(dept.name, Number(selectedSemester), Number(subjectId))
                    .then(response => {
                        let studentsData = Array.isArray(response) ? response : 
                                         (response && Array.isArray(response.data) ? response.data : []);
                        
                        console.log(`Loaded ${studentsData.length} students for subject ${subjectId}`);
                        
                        setStudents(studentsData);
                        setAttendanceRecords(studentsData.map(student => ({
                            studentId: student.id,
                            isPresent: true,
                        })));
                    })
                    .catch(error => {
                        console.error("ERROR loading students for subject:", error);
                        toast({
                            title: "Error",
                            description: "Failed to load students for the selected subject.",
                            variant: "destructive",
                        });
                        setStudents([]);
                        setAttendanceRecords([]);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            }
        }
    };

    const handleAttendanceChange = (studentId, isPresent) => {
        setAttendanceRecords(prevRecords =>
            prevRecords.map(record =>
                record.studentId === studentId
                    ? { ...record, isPresent: !!isPresent }
                    : record
            )
        );
    };

    const handleMarkAll = (isPresent) => {
        setAttendanceRecords(prevRecords =>
            prevRecords.map(record => ({ ...record, isPresent }))
        );
    };

    const handleSaveAttendance = async () => {
        if (!selectedDepartment || !selectedSemester || !selectedSubject || !isValid(attendanceDate)) {
            toast({
                title: "Missing Information",
                description: "Please select department, semester, subject, and date before saving.",
                variant: "destructive",
            });
            return;
        }

        if (students.length === 0) {
            toast({
                title: "No Students",
                description: "No students found for the selected criteria.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const attendanceData = {
                date: format(attendanceDate, 'yyyy-MM-dd'),
                departmentId: parseInt(selectedDepartment, 10),
                semesterId: parseInt(selectedSemester, 10),
                subjectId: parseInt(selectedSubject, 10),
                duration: selectedDuration, // Include the selected duration
                records: attendanceRecords
            };

            console.log("Saving attendance data:", attendanceData);
            await attendanceService.saveAttendance(attendanceData);
            
            toast({
                title: "Success",
                description: "Attendance records saved successfully.",
            });
            
        } catch (error) {
            console.error("ERROR saving attendance:", error.response?.data || error.message || error);
            toast({
                title: "Error",
                description: "Failed to save attendance records. Check console.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
                <CardDescription>Record student attendance by department, semester, and subject.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <Label htmlFor="department" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            Department <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            id="department" 
                            value={selectedDepartment} 
                            onValueChange={handleDepartmentChange}
                        >
                            <SelectTrigger className="h-10 transition-all hover:border-primary">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.length > 0 ? (
                                    departments.map((department) => (
                                        <SelectItem 
                                            key={department.id} 
                                            value={department.id.toString()}
                                            className="cursor-pointer hover:bg-primary/10"
                                        >
                                            {department.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem disabled>Loading departments...</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label 
                            htmlFor="semester" 
                            className={`flex items-center gap-2 ${!selectedDepartment ? 'text-muted-foreground' : ''}`}
                        >
                            <Clock className={`h-4 w-4 ${selectedDepartment ? 'text-primary' : 'text-muted-foreground'}`} />
                            Semester <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            id="semester" 
                            value={selectedSemester} 
                            onValueChange={handleSemesterChange} 
                            disabled={!selectedDepartment}
                        >
                            <SelectTrigger className={`h-10 transition-all ${selectedDepartment ? 'hover:border-primary' : 'bg-muted/50'}`}>
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((semester) => (
                                    <SelectItem 
                                        key={semester.id} 
                                        value={semester.id}
                                        className="cursor-pointer hover:bg-primary/10"
                                    >
                                        {semester.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!selectedDepartment && (
                            <p className="text-xs text-muted-foreground">Select a department first</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label 
                            htmlFor="subject" 
                            className={`flex items-center gap-2 ${!selectedDepartment || !selectedSemester ? 'text-muted-foreground' : ''}`}
                        >
                            <BookOpen className={`h-4 w-4 ${selectedDepartment && selectedSemester ? 'text-primary' : 'text-muted-foreground'}`} />
                            Subject <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            id="subject" 
                            value={selectedSubject} 
                            onValueChange={handleSubjectChange} 
                            disabled={!selectedDepartment || !selectedSemester}
                        >
                            <SelectTrigger className={`h-10 transition-all ${selectedDepartment && selectedSemester ? 'hover:border-primary' : 'bg-muted/50'}`}>
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                        <SelectItem 
                                            key={subject.id} 
                                            value={subject.id.toString()}
                                            className="cursor-pointer hover:bg-primary/10"
                                        >
                                            {subject.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem disabled className="text-muted-foreground">
                                        {selectedDepartment && selectedSemester 
                                            ? "No subjects available for this combination" 
                                            : "Select department and semester first"}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {(!selectedDepartment || !selectedSemester) && (
                            <p className="text-xs text-muted-foreground">
                                {!selectedDepartment 
                                    ? "Select a department first" 
                                    : "Select a semester first"}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="attendanceDate" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            Attendance Date <span className="text-destructive">*</span>
                        </Label>
                        <DatePicker
                            date={attendanceDate}
                            setDate={setAttendanceDate}
                            placeholder="Select attendance date"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Class Duration <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            id="duration" 
                            value={selectedDuration.toString()} 
                            onValueChange={(value) => setSelectedDuration(Number(value))}
                            defaultValue="120"
                        >
                            <SelectTrigger className="h-10 transition-all hover:border-primary">
                                <SelectValue placeholder="Select Duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {durations.map((duration) => (
                                    <SelectItem 
                                        key={duration.value} 
                                        value={duration.value.toString()}
                                        className="cursor-pointer hover:bg-primary/10"
                                    >
                                        {duration.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {(!selectedDepartment || !selectedSemester) && (
                     <div className="my-8 p-6 text-center bg-muted/30 rounded-lg border border-dashed">
                        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/70" />
                        <h3 className="mt-4 text-lg font-semibold">Load Students</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Please select a department and semester to view students.
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32 my-2" />
                        <div className="space-x-2 flex">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={`loading-${index}`} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && students.length === 0 && selectedDepartment && selectedSemester && (
                    <div className="my-8 p-6 text-center bg-yellow-50 rounded-lg border border-yellow-200">
                        <XCircle className="h-8 w-8 mx-auto text-yellow-500" />
                        <h3 className="mt-2 text-lg font-semibold text-yellow-700">No Students Found</h3>
                        <p className="mt-2 text-sm text-yellow-600">
                            No students were found for the selected Department and Semester.
                        </p>
                    </div>
                )}

                {!loading && students.length > 0 && (
                    <>
                        <div className="flex flex-wrap gap-3 my-4">
                            <Badge variant="outline" className="bg-primary/5 text-primary py-1.5">
                                <GraduationCap className="h-4 w-4 mr-1.5" />
                                Students: {students.length}
                            </Badge>
                            <Badge variant="outline" className="bg-green-500/5 text-green-600 py-1.5">
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Present: {attendanceRecords.filter(r => r.isPresent).length}
                            </Badge>
                            <Badge variant="outline" className="bg-red-500/5 text-red-600 py-1.5">
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Absent: {attendanceRecords.filter(r => !r.isPresent).length}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 my-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="bg-green-500/5 text-green-600 border-green-200 hover:bg-green-500/10 hover:text-green-700"
                                            onClick={() => handleMarkAll(true)}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark All Present
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Set all students as present</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="bg-red-500/5 text-red-600 border-red-200 hover:bg-red-500/10 hover:text-red-700"
                                            onClick={() => handleMarkAll(false)}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Mark All Absent
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Set all students as absent</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="rounded-md border overflow-hidden mt-4 mb-6">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Student Name</TableHead>
                                        <TableHead className="font-semibold">Student ID</TableHead>
                                        <TableHead className="font-semibold text-center w-48">Attendance Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => {
                                        const isPresent = attendanceRecords.find(record => 
                                            record.studentId === student.id)?.isPresent;
                                        
                                        return (
                                            <TableRow key={student.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
                                                <TableCell className="font-medium">{student.fullName}</TableCell>
                                                <TableCell>{student.studentId}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Checkbox
                                                            id={`attendance-${student.id}`}
                                                            checked={isPresent}
                                                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                                                            className={isPresent 
                                                                ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' 
                                                                : 'data-[state=unchecked]:border-red-300'}
                                                        />
                                                        <Label 
                                                            htmlFor={`attendance-${student.id}`}
                                                            className={`cursor-pointer font-medium ${isPresent ? 'text-green-600' : 'text-red-600'}`}
                                                        >
                                                            {isPresent ? 'Present' : 'Absent'}
                                                        </Label>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end mt-6">
                            <TooltipProvider>
                                <Tooltip open={!selectedSubject ? undefined : false}>
                                    <TooltipTrigger asChild>
                                        <span tabIndex={!selectedSubject ? 0 : -1}>
                                            <Button
                                                onClick={handleSaveAttendance}
                                                disabled={loading || !selectedSubject}
                                                className="bg-primary hover:bg-primary/90 text-white px-6"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Save Attendance Records
                                                    </>
                                                )}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    {!selectedSubject && (
                                        <TooltipContent>
                                            <p>Please select a subject before saving.</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default AttendanceManagement;