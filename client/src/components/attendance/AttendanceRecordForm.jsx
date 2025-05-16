import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AttendanceRecordForm() {
    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    // Fetch departments on component mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await studentService.getDepartments();
                setDepartments(response.data);
            } catch (error) {
                setMessage({ 
                    type: 'error', 
                    text: 'Failed to load departments. Please try again.' 
                });
            }
        };
        fetchDepartments();
    }, []);

    // Fetch students when department is selected or date changes
    useEffect(() => {
        if (selectedDepartment) {
            const fetchStudents = async () => {
                try {
                    setLoading(true);
                    const response = await studentService.getStudentsByDepartment(selectedDepartment);
                    setStudents(response.data);
                    // Initialize attendance records
                    setAttendanceRecords(
                        response.data.map(student => ({
                            studentId: student.id,
                            studentName: student.fullName,
                            present: true,
                            date: format(date, 'yyyy-MM-dd'),
                            duration: 120 // Default 2-hour class
                        }))
                    );
                } catch (error) {
                    setMessage({ 
                        type: 'error', 
                        text: 'Failed to load students. Please try again.' 
                    });
                } finally {
                    setLoading(false);
                }
            };
            fetchStudents();
        } else {
            setStudents([]);
            setAttendanceRecords([]);
        }
    }, [selectedDepartment, date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDepartment || attendanceRecords.length === 0) {
            setMessage({ 
                type: 'error', 
                text: 'Please select a department and ensure students are loaded' 
            });
            return;
        }

        setLoading(true);
        try {
            await attendanceService.saveBulkAttendance(attendanceRecords);
            setMessage({ 
                type: 'success', 
                text: 'Attendance records saved successfully' 
            });
            // Reset form after a successful submission
            setTimeout(() => {
                setSelectedDepartment('');
                setAttendanceRecords([]);
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Error saving attendance records. Please try again.' 
            });
        }
        setLoading(false);
    };

    const toggleAttendance = (studentId) => {
        setAttendanceRecords(records =>
            records.map(record =>
                record.studentId === studentId
                    ? { ...record, present: !record.present }
                    : record
            )
        );
    };

    return (
        <Card className="shadow-lg rounded-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Record Class Attendance</CardTitle>
                <CardDescription className="text-base">Take attendance for a class session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Date and Department Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <DatePicker 
                        label="Date"
                        date={date}
                        setDate={setDate}
                        placeholder="Select attendance date"
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <Select 
                            value={selectedDepartment} 
                            onValueChange={setSelectedDepartment}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {message.text && (
                    <Alert 
                        variant={message.type === 'error' ? 'destructive' : 'default'} 
                        className="mb-4"
                    >
                        <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                )}

                {/* Students Attendance Table */}
                {students.length > 0 ? (
                    <form onSubmit={handleSubmit}>
                        <Table>
                            <TableCaption>
                                List of students for attendance on {format(date, 'PPP')}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[400px] text-base">Student Name</TableHead>
                                    <TableHead className="text-base">Attendance Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceRecords.map(record => (
                                    <TableRow key={record.studentId}>
                                        <TableCell className="font-medium text-sm">
                                            {record.studentName}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className={`gap-2 px-4 py-1 rounded-md border font-medium transition-colors duration-200 ${
                                                    record.present 
                                                        ? 'border-green-500 text-green-600 hover:bg-green-50' 
                                                        : 'border-red-500 text-red-600 hover:bg-red-50'
                                                }`}
                                                onClick={() => toggleAttendance(record.studentId)}
                                            >
                                                {record.present ? (
                                                    <>
                                                        <span>Present</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Absent</span>
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-8 flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                size="lg"
                                className="min-w-[140px]"
                            >
                                {loading ? 'Saving...' : 'Save Attendance'}
                            </Button>
                        </div>
                    </form>
                ) : selectedDepartment ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            {loading ? 'Loading students...' : 'No students found for the selected department.'}
                        </p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}