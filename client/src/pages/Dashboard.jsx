import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BarChart3, FileText, AlertTriangle, CalendarIcon } from "lucide-react";
import attendanceService from "@/services/attendanceService";
import Chart from "@/components/ui/Chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalStudents: null,
    exceededAbsenceStudents: null,
    reportsGenerated: null,
    averageAttendanceRate: null,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedRange, setSelectedRange] = useState("30days");
  const [customDateRange, setCustomDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Helper function to get date range with various presets
  const getDateRange = (preset) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (preset) {
      case "7days":
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case "30days":
        startDate = subDays(today, 30);
        endDate = today;
        break;
      case "90days":
        startDate = subDays(today, 90);
        endDate = today;
        break;
      case "6months":
        startDate = subMonths(today, 6);
        endDate = today;
        break;
      case "custom":
        return {
          startDate: format(customDateRange.from, 'yyyy-MM-dd'),
          endDate: format(customDateRange.to, 'yyyy-MM-dd')
        };
      default:
        startDate = subDays(today, 30);
        endDate = today;
    }
    
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // Get a date range for the last 30 days
      const { startDate, endDate } = getDateRange(selectedRange);
      
      // Pass date parameters to the API call
      const threshold = 9;
      const [statsData, studentsData] = await Promise.all([
        attendanceService.getDashboardStats(startDate, endDate),
        attendanceService.getStudentsExceedingAbsenceThreshold(threshold)
      ]);
      
      // Provide default values if API returns null/undefined
      setStats({
        totalStudents: statsData.data?.totalStudents ?? 0,
        exceededAbsenceStudents: studentsData.data?.length ?? 0,
        reportsGenerated: statsData.data?.reportsGenerated ?? 0,
        averageAttendanceRate: statsData.data?.averageAttendanceRate ?? null,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      toast({
        title: "Error Loading Stats",
        description: "Could not load dashboard statistics. Please try again later.",
        variant: "destructive",
      });
      setStats({ totalStudents: 0, exceededAbsenceStudents: 0, reportsGenerated: 0, averageAttendanceRate: null }); // Set defaults on error
    } finally {
      setLoadingStats(false);
    }
  }, [toast, selectedRange]);

  const fetchDepartmentComparison = useCallback(async () => {
    setLoadingChart(true);
    try {
      // Get a date range for the last 30 days
      const { startDate, endDate } = getDateRange(selectedRange);
      
      // Pass date parameters to the API call
      const response = await attendanceService.getDepartmentComparison(startDate, endDate);
      
      // Ensure data is an array, default to empty array if not
      let data = Array.isArray(response.data) ? response.data : [];
      
      setDepartmentData(data);
    } catch (error) {
      console.error("Failed to fetch department comparison data:", error);
      toast({
        title: "Error Loading Chart Data",
        description: "Could not load department comparison data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingChart(false);
    }
  }, [toast, selectedRange]);

  useEffect(() => {
    fetchDashboardStats();
    fetchDepartmentComparison();
  }, [fetchDashboardStats, fetchDepartmentComparison]);

  // Apply date range change
  const applyDateRangeChange = useCallback(() => {
    if (selectedRange === "custom" && customDateRange.from && customDateRange.to) {
      setDateRange({
        startDate: format(customDateRange.from, "yyyy-MM-dd"),
        endDate: format(customDateRange.to, "yyyy-MM-dd"),
      });
      fetchDashboardStats();
      fetchDepartmentComparison();
    }
  }, [selectedRange, customDateRange, fetchDashboardStats, fetchDepartmentComparison]);

  return (
    // No <Layout> wrapper here, it's handled in AppRoutes.jsx
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={selectedRange}
          onValueChange={(value) => {
            setSelectedRange(value);
            if (value !== "custom") {
              setDateRange(getDateRange(value));
              // Trigger data refresh immediately for predefined ranges
              setTimeout(() => {
                fetchDashboardStats();
                fetchDepartmentComparison();
              }, 100);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {selectedRange === "custom" && (
          <>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-auto sm:w-[300px] justify-start text-left font-normal",
                    !customDateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange.from ? (
                    customDateRange.to ? (
                      `${format(customDateRange.from, "MMM dd, yyyy")} - ${format(
                        customDateRange.to,
                        "MMM dd, yyyy"
                      )}`
                    ) : format(customDateRange.from, "MMM dd, yyyy")
                  ) : (
                    "Pick a date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange.from}
                  selected={customDateRange}
                  onSelect={(range) => {
                    setCustomDateRange(range);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={applyDateRangeChange}
              size="sm"
              disabled={!customDateRange.from || !customDateRange.to}
            >
              Apply
            </Button>
          </>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Students Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalStudents ?? 'N/A'}</div>
            )}
          </CardContent>
        </Card>

        {/* Students with High Absence Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students with &gt;9h Absence</CardTitle>
            {/* Conditionally render icon based on value */}
            {stats.exceededAbsenceStudents > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" /> // Use Users icon when 0
            )}
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className={cn(
                "text-2xl font-bold",
                stats.exceededAbsenceStudents > 0 && "text-destructive" // Apply red text only if > 0
              )}>
                {stats.exceededAbsenceStudents ?? 'N/A'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Attendance Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.averageAttendanceRate !== null 
                  ? `${stats.averageAttendanceRate.toFixed(1)}%` 
                  : 'N/A'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Comparison Chart */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Department Attendance Comparison</CardTitle>
          <CardDescription>Attendance rates across departments for the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] pt-4"> {/* Increased chart height */}
          {loadingChart ? (
            <div className="flex items-center justify-center h-full">
               <Skeleton className="h-full w-full" />
            </div>
          ) : departmentData.length > 0 ? (
            <Chart data={departmentData} />
          ) : (
             <div className="flex items-center justify-center h-full text-muted-foreground">
               No department data available to display chart.
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}