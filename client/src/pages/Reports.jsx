import React, { useState, useEffect, useCallback } from 'react';
import { format } from "date-fns";
import {
    ArrowDownTrayIcon,
    XCircleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CalendarIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/DatePicker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import attendanceService  from '@/services/attendanceService';
import { departmentService } from '@/services/departmentService';

const handleApiError = (error, defaultMessage, toast) => {
    console.error(error);
    const message = error.response?.data?.message || error.message || defaultMessage;
    toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
    });
};

const fetchFilterData = async (fetcher, setter, errorMessage, toast) => {
    try {
        const response = await fetcher();
        const dataToUse = Array.isArray(response) ? response : (response.data || []);
        setter(dataToUse);
    } catch (error) {
        handleApiError(error, errorMessage, toast);
        setter([]);
    }
};

const downloadBlob = (blob, filename, mimeType) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const styles = StyleSheet.create({
    page: { padding: 30, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
    title: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold', color: '#333' },
    dateRange: { fontSize: 12, marginBottom: 15, textAlign: 'center', color: '#555' },
    table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, borderColor: '#bfbfbf' },
    tableRow: { flexDirection: "row", borderBottomColor: '#bfbfbf', borderBottomWidth: 1, alignItems: 'center', minHeight: 24 },
    tableHeaderRow: { backgroundColor: '#f2f2f2', fontWeight: 'bold' },
    tableColHeader: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5, textAlign: 'center', fontSize: 10 },
    tableCol: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5, fontSize: 9 },
    tableColWide: { width: "35%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5, fontSize: 9 },
    tableColNarrow: { width: "15%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5, fontSize: 9, textAlign: 'center' },
    tableColCenter: { textAlign: 'center' },
    tableColLeft: { textAlign: 'left' },
});

const AbsenceReportDocument = ({ reportData, startDate, endDate }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Absence Report</Text>
            <Text style={styles.dateRange}>
                Period: {startDate ? format(startDate, 'yyyy-MM-dd') : 'N/A'} to {endDate ? format(endDate, 'yyyy-MM-dd') : 'N/A'}
            </Text>

            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={[styles.tableColHeader, styles.tableColWide, styles.tableColLeft]}>Student Name</Text>
                    <Text style={[styles.tableColHeader, styles.tableColNarrow]}>Student ID</Text>
                    <Text style={[styles.tableColHeader, styles.tableCol]}>Department</Text>
                    <Text style={[styles.tableColHeader, styles.tableColNarrow]}>Absence Hours</Text>
                </View>
                {reportData.map((record, index) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={[styles.tableCol, styles.tableColWide, styles.tableColLeft]}>{record.studentName || 'N/A'}</Text>
                        <Text style={[styles.tableCol, styles.tableColNarrow]}>{record.studentId || 'N/A'}</Text>
                        <Text style={[styles.tableCol, styles.tableCol]}>{record.departmentName || 'N/A'}</Text>
                        <Text style={[styles.tableCol, styles.tableColNarrow]}>{record.totalAbsenceHours ?? 'N/A'}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

const DatePickerField = ({ label, date, setDate }) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{label}</label>
            <DatePicker 
                date={date}
                setDate={setDate}
                placeholder="Pick a date"
            />
        </div>
    );
};

const FilterSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
            <SelectTrigger className="w-full h-10 bg-background border-input hover:bg-accent hover:text-accent-foreground">
                {loading ? (
                    <Skeleton className="h-4 w-2/3" />
                ) : (
                    <SelectValue placeholder={placeholder} />
                )}
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{label}</SelectLabel>
                    {options.map((option) => (
                        <SelectItem 
                            key={option.id || option.value} 
                            value={option.value || option.id.toString()}
                            className="cursor-pointer"
                        >
                            {option.label || option.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
);

const ReportActionButton = ({ onClick, icon, text, variant = "default", disabled = false, loading = false }) => (
    <Button
        variant={variant}
        className={cn("min-w-[150px] transition-all duration-200")}
        onClick={onClick}
        disabled={disabled || loading}
    >
        {loading ? (
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            <span className="flex items-center gap-2">
                {icon}
                <span>{text}</span>
            </span>
        )}
    </Button>
);

const Reports = () => {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const { toast } = useToast();

    // State for form elements
    const [startDate, setStartDate] = useState(lastWeek);
    const [endDate, setEndDate] = useState(today);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportType, setExportType] = useState('');
    const [showExceededOnly, setShowExceededOnly] = useState(false);

    // Department filtering
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // Load departments on component mount
    useEffect(() => {
        fetchFilterData(
            departmentService.getAllDepartments,
            setDepartments,
            'Failed to load departments',
            toast
        );
    }, [toast]);

    const validateAndFormatDates = useCallback(() => {
        if (!startDate || !endDate) {
            toast({ title: 'Missing Date Range', description: 'Please select both start and end dates.', variant: 'destructive' });
            return null;
        }
        if (endDate < startDate) {
            toast({ title: 'Invalid Date Range', description: 'End date must be after start date.', variant: 'destructive' });
            return null;
        }
        return {
            formattedStartDate: format(startDate, 'yyyy-MM-dd'),
            formattedEndDate: format(endDate, 'yyyy-MM-dd'),
        };
    }, [startDate, endDate, toast]);

    const handleGenerateReport = async () => {
        const dates = validateAndFormatDates();
        if (!dates) return;
        const { formattedStartDate, formattedEndDate } = dates;

        setLoading(true);
        setReportData([]);
        try {
            const response = await attendanceService.getAbsenceReport(
                formattedStartDate,
                formattedEndDate,
                selectedDepartment,
                'all', // Always pass 'all' for semester
                'all', // Always pass 'all' for subject
                showExceededOnly
            );
            const data = response.data || [];
            setReportData(data);

            if (data.length === 0) {
                toast({ title: 'No Records Found', description: 'No absence records match the selected criteria.', variant: 'default' });
            } else {
                toast({ title: 'Report Generated', description: `Found ${data.length} record(s).`, variant: 'default' });
            }
        } catch (error) {
            handleApiError(error, 'Failed to generate report', toast);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        const dates = validateAndFormatDates();
        if (!dates) return;
        const { formattedStartDate, formattedEndDate } = dates;

        setExporting(true);
        setExportType(type);

        try {
            let response;
            let filename;
            let mimeType;

            const baseFilename = `absence_report_${formattedStartDate}_to_${formattedEndDate}${showExceededOnly ? '_exceeded' : ''}`;

            if (type === 'pdf') {
                response = await attendanceService.exportAbsenceReportToPdf(
                    formattedStartDate, formattedEndDate, selectedDepartment, 'all', 'all', showExceededOnly
                );
                filename = `${baseFilename}.pdf`;
                mimeType = 'application/pdf';
            } else if (type === 'excel') {
                response = await attendanceService.exportAbsenceReportToExcel(
                    formattedStartDate, formattedEndDate, selectedDepartment, 'all', 'all', showExceededOnly
                );
                filename = `${baseFilename}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            } else {
                throw new Error("Invalid export type");
            }

            downloadBlob(response.data, filename, mimeType);
            toast({ title: 'Export Successful', description: `${type.toUpperCase()} report download started.`, variant: 'default' });

        } catch (error) {
            handleApiError(error, `Failed to export ${type.toUpperCase()} report`, toast);
        } finally {
            setExporting(false);
            setExportType('');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Absence Reports</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>Select filters and date range to view or export absence data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DatePickerField label="Start Date" date={startDate} setDate={setStartDate} />
                        <DatePickerField label="End Date" date={endDate} setDate={setEndDate} />
                    </div>

                    <div className="space-y-2">
                        <FilterSelect
                            label="Department"
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            options={[{ id: 'all', name: 'All Departments' }, ...departments]}
                            placeholder="Select Department"
                        />
                    </div>

                    <div className="flex items-center pt-2">
                        <Toggle
                            pressed={showExceededOnly}
                            onPressedChange={setShowExceededOnly}
                            aria-label="Toggle exceeded absence limit filter"
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                showExceededOnly 
                                    ? 'bg-red-100 text-red-900 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40' 
                                    : 'bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}
                        >
                            <ExclamationCircleIcon className={`h-5 w-5 ${showExceededOnly ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`} />
                            <span>Show Only Exceeded ({'>='} 9 hours)</span>
                        </Toggle>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <ReportActionButton
                            onClick={handleGenerateReport}
                            icon={<CheckCircleIcon className="h-5 w-5 text-white" />}
                            text="Generate Report"
                            disabled={loading || exporting}
                            loading={loading}
                            variant="default"
                            className="text-white"
                        />
                        <ReportActionButton
                            onClick={() => handleExport('excel')}
                            icon={<ArrowDownTrayIcon className="h-5 w-5" />}
                            text="Export Excel"
                            variant="outline"
                            disabled={loading || exporting || reportData.length === 0}
                            loading={exporting && exportType === 'excel'}
                        />
                        <ReportActionButton
                            onClick={() => handleExport('pdf')}
                            icon={<DocumentArrowDownIcon className="h-5 w-5" />}
                            text="Export PDF"
                            variant="outline"
                            disabled={loading || exporting || reportData.length === 0}
                            loading={exporting && exportType === 'pdf'}
                        />
                    </div>
                </CardContent>
            </Card>

            {(loading || reportData.length > 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Report Results</CardTitle>
                        {!loading && <CardDescription>Showing {reportData.length} record(s).</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Student Name</TableHead>
                                        <TableHead className="font-semibold">Student ID</TableHead>
                                        <TableHead className="font-semibold">Department</TableHead>
                                        <TableHead className="font-semibold text-center">Absence Hours</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : reportData.length > 0 ? (
                                        reportData.map((student) => (
                                            <TableRow key={student.studentId} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{student.studentName || 'N/A'}</TableCell>
                                                <TableCell>{student.studentId || 'N/A'}</TableCell>
                                                <TableCell>{student.departmentName || 'N/A'}</TableCell>
                                                <TableCell className="text-center font-medium">
                                                    {(student.totalAbsenceHours ?? 0) >= 9 ? (
                                                        <span className="text-red-600 dark:text-red-400">{student.totalAbsenceHours ?? 'N/A'}</span>
                                                    ) : (
                                                        student.totalAbsenceHours ?? 'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {(student.totalAbsenceHours ?? 0) >= 9 ? (
                                                        <Badge variant="destructive" className="flex items-center gap-1.5 py-1 px-1 w-fit bg-red-500">
                                                            <XCircleIcon className="w-3.5 h-3.5" />
                                                            Exceeded
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="flex items-center gap-1.5 py-1 px-2 w-fit bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70 border-green-200 dark:border-green-800">
                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                            Normal
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <XCircleIcon className="h-8 w-8 text-muted-foreground/70" />
                                                    <p>No results to display.</p>
                                                    <p className="text-sm">Try adjusting your filters.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Reports;