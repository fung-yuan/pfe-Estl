import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Send, 
  Calendar as CalendarIcon, 
  Info, 
  Loader2,
  CheckSquare,
  X
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  sendEmailAnnouncement, 
  getDepartments, 
  getSemesters 
} from '@/services/announcementService';

const SendEmailAnnouncementPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    // Filter options
    departmentId: 'all',
    semesterId: 'all',
    useAbsenceHours: false,
    absenceThreshold: 5,
    useDateRange: false,
    absenceStartDate: null,
    absenceEndDate: null
  });

  useEffect(() => {
    // Load departments and semesters when component mounts
    const loadData = async () => {
      try {
        const deps = await getDepartments();
        const sems = await getSemesters();
        setDepartments(deps || []); // Ensure deps is an array
        setSemesters(sems || []);   // Ensure sems is an array
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load departments and semesters. Please try again later.",
          variant: "destructive",
        });
        // Also set to empty arrays in case of error to prevent .map issues
        setDepartments([]);
        setSemesters([]);
      }
    };
    
    loadData();
  }, [toast]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SendEmailAnnouncementPage: handleSubmit called. Current formData:", formData);
    setLoading(true);
    setSuccess(false);

    // Prepare the API request data
    const requestData = {
      title: formData.title,
      content: formData.content,
      filterOptions: {
        departmentId: formData.departmentId === 'all' ? null : formData.departmentId,
        semesterId: formData.semesterId === 'all' ? null : formData.semesterId
      }
    };

    // Add absence hours filter if enabled
    if (formData.useAbsenceHours) {
      requestData.filterOptions.absenceThreshold = formData.absenceThreshold;
    }

    // Add date range filter if enabled
    if (formData.useDateRange && formData.absenceStartDate && formData.absenceEndDate) {
      requestData.filterOptions.startDate = formData.absenceStartDate;
      requestData.filterOptions.endDate = formData.absenceEndDate;
    }
    
    try {
      const result = await sendEmailAnnouncement(requestData);
      
      setSuccess(true);
      toast({
        title: "Success!",
        description: `Email sent successfully to ${result.recipientCount} students.`,
        variant: "success",
      });
      
      // Reset form after success
      setFormData({
        title: '',
        content: '',
        departmentId: 'all',
        semesterId: 'all',
        useAbsenceHours: false,
        absenceThreshold: 5,
        useDateRange: false,
        absenceStartDate: null,
        absenceEndDate: null
      });
      
    } catch (error) {
      console.error("Failed to send email announcement:", error);
      toast({
        title: "Error",
        description: "Failed to send email announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log("SendEmailAnnouncementPage: Rendering component. State: ", { formData, departments, semesters, loading, success });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Send Email Announcement</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column - Announcement Content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Content</CardTitle>
              <CardDescription>
                Enter the details of the announcement you want to send via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter title..." 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Announcement Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="Write your announcement here..." 
                  className="min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Recipient Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recipient Selection</CardTitle>
              <CardDescription>
                Choose which students will receive this email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(value) => handleInputChange('departmentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem 
                        key={dept.id} 
                        value={dept.id.toString()}
                        className="cursor-pointer"
                      >
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Filter */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={formData.semesterId} 
                  onValueChange={(value) => handleInputChange('semesterId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a semester" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map((sem) => (
                      <SelectItem 
                        key={sem.id} 
                        value={sem.id.toString()}
                        className="cursor-pointer"
                      >
                        {sem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Absence Hours Filter */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="useAbsenceHours" className="font-medium">Filter by Absence Hours</Label>
                  <Switch
                    id="useAbsenceHours"
                    checked={formData.useAbsenceHours}
                    onCheckedChange={(checked) => handleInputChange('useAbsenceHours', checked)}
                  />
                </div>
                
                {formData.useAbsenceHours && (
                  <div className="space-y-2 pl-2 border-l-2 border-primary/20 mt-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="absenceThreshold">
                          Minimum Absence Hours:
                        </Label>
                        <span className="font-medium">{formData.absenceThreshold} hours</span>
                      </div>
                      <Input
                        id="absenceThreshold"
                        type="range"
                        min={1}
                        max={40}
                        value={formData.absenceThreshold}
                        onChange={(e) => handleInputChange('absenceThreshold', Number(e.target.value))}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Students with {formData.absenceThreshold} or more absence hours will receive this email
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="useDateRange" className="font-medium">Filter by Absence Date Range</Label>
                  <Switch
                    id="useDateRange"
                    checked={formData.useDateRange}
                    onCheckedChange={(checked) => handleInputChange('useDateRange', checked)}
                  />
                </div>
                
                {formData.useDateRange && (
                  <div className="space-y-3 pl-2 border-l-2 border-primary/20 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="startDate"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.absenceStartDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.absenceStartDate ? (
                                format(formData.absenceStartDate, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.absenceStartDate}
                              onSelect={(date) => {
                                handleInputChange('absenceStartDate', date);
                                // Ensure end date is not before start date
                                if (formData.absenceEndDate && date > formData.absenceEndDate) {
                                  handleInputChange('absenceEndDate', date);
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="endDate">End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="endDate"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.absenceEndDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.absenceEndDate ? (
                                format(formData.absenceEndDate, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.absenceEndDate}
                              onSelect={(date) => handleInputChange('absenceEndDate', date)}
                              initialFocus
                              disabled={(date) => 
                                formData.absenceStartDate && 
                                date < formData.absenceStartDate
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Students with absences recorded during this date range will receive this email
                    </p>
                  </div>
                )}
              </div>

              {/* Filter Summary */}
              <div className="mt-4 pt-4 border-t border-dashed">
                <h4 className="font-medium text-sm mb-2">Recipients will include students who match:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <span>
                      Department: {formData.departmentId === 'all' ? 'All Departments' : 
                        departments.find(d => d.id.toString() === formData.departmentId)?.name || 'Loading...'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <span>
                      Semester: {formData.semesterId === 'all' ? 'All Semesters' : 
                        semesters.find(s => s.id.toString() === formData.semesterId)?.name || 'Loading...'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.useAbsenceHours ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={!formData.useAbsenceHours ? "text-muted-foreground" : ""}>
                      {formData.useAbsenceHours ? (
                        <>Students with {formData.absenceThreshold}+ absence hours</>
                      ) : (
                        <>Absence hours filter not applied</>
                      )}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    {formData.useDateRange && formData.absenceStartDate && formData.absenceEndDate ? (
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={!(formData.useDateRange && formData.absenceStartDate && formData.absenceEndDate) ? "text-muted-foreground" : ""}>
                      {formData.useDateRange && formData.absenceStartDate && formData.absenceEndDate ? (
                        <>Absences between {format(formData.absenceStartDate, "PP")} and {format(formData.absenceEndDate, "PP")}</>
                      ) : (
                        <>Date range filter not applied</>
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.title || !formData.content}
                className={cn(
                  "gap-2",
                  success ? "bg-green-600 hover:bg-green-700" : ""
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendEmailAnnouncementPage;
