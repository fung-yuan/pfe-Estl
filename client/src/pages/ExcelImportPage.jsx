import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Progress } from "../components/ui/progress";
import { DownloadIcon } from 'lucide-react';
import axiosInstance from "../lib/axiosInstance";
import { useNavigate } from 'react-router-dom';

const ExcelImportPage = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("import");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);
  
  // Example template data for documentation
  const templateStructures = [
    {
      name: "Users Sheet",
      columns: [
        { name: "username", description: "Unique username for the user", required: true, example: "john.doe" },
        { name: "email", description: "User's email address", required: true, example: "john.doe@example.com" },
        { name: "password", description: "Initial password (will be encrypted)", required: true, example: "password123" },
        { name: "roles", description: "Comma-separated list of roles", required: false, example: "ADMIN,USER" }
      ]
    },
    {
      name: "Departments Sheet",
      columns: [
        { name: "name", description: "Department name", required: true, example: "Computer Science" }
      ]
    },
    {
      name: "Semesters Sheet",
      columns: [
        { name: "name", description: "Semester name", required: true, example: "Fall 2025" }
      ]
    },
    {
      name: "Subjects Sheet",
      columns: [
        { name: "code", description: "Subject code", required: true, example: "CS101" },
        { name: "name", description: "Subject name", required: true, example: "Introduction to Computer Science" },
        { name: "department", description: "Department name (must exist)", required: true, example: "Computer Science" },
        { name: "semester", description: "Semester name (must exist)", required: true, example: "Fall 2025" }
      ]
    },
    {
      name: "Students Sheet",
      columns: [
        { name: "studentId", description: "Unique student ID", required: true, example: "STU12345" },
        { name: "fullName", description: "Student's full name", required: true, example: "John Doe" },
        { name: "email", description: "Student's email address", required: true, example: "john.student@example.com" },
        { name: "department", description: "Department name (must exist)", required: true, example: "Computer Science" },
        { name: "semester", description: "Semester name (must exist)", required: true, example: "Fall 2025" }
      ]
    }
  ];
  
  // Handle file selection from input element
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // Validate file type and set it if valid
  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type.includes('excel') || 
          selectedFile.type.includes('spreadsheet') ||
          selectedFile.name.endsWith('.xlsx') ||
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
      }
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Handle click on the drop zone
  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload",
        variant: "destructive"
      });
      return;
    }
    
    // Check if we have an auth token before proceeding
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    setProgress(10);
    
    // Define progressInterval outside the try block so it's accessible in the catch block
    let progressInterval;
    
    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      console.log('Uploading file to backend...');
      
      // Check if the backend server is running
      try {
        // First, try a simple ping to the backend server using the ultra-simple ping endpoint
        const pingResponse = await fetch('http://localhost:8080/api/ping', { timeout: 2000 });
        if (!pingResponse.ok) {
          // If response is not OK (e.g., 4xx, 5xx), throw an error to be caught by the catch block
          throw new Error(`Ping failed with status: ${pingResponse.status}`);
        }
      } catch (pingError) {
        console.error('Backend server ping failed:', pingError);
        clearInterval(progressInterval);
        setProgress(0);
        setIsUploading(false);
        
        toast({
          title: "Backend Server Unavailable",
          description: "The backend server is not running. Please start the server and try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Use the full URL to ensure we're connecting to the right server
      const response = await axiosInstance.post('http://localhost:8080/api/admin/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': authToken,
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 60000 // 60 seconds timeout for large files
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('Upload successful:', response.data);
      
      const data = response.data;
      setResult(data);
      
      toast({
        title: "Import Completed",
        description: `Imported ${data.successCount} records successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Clear progress interval if it exists
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(0);
      setIsUploading(false);
      
      // Provide more specific error messages based on the error type
      let errorTitle = "Import Failed";
      let errorDescription = "";
      
      if (error.code === 'ERR_NETWORK') {
        errorTitle = "Network Error";
        errorDescription = "Could not connect to the backend server. Please check if the server is running.";
      } else if (error.response) {
        // Server responded with an error status code
        if (error.response.status === 401) {
          errorTitle = "Authentication Error";
          errorDescription = "You are not authorized to perform this action. Please log in again.";
        } else if (error.response.status === 400) {
          errorTitle = "Invalid File";
          errorDescription = error.response.data || "The Excel file format is invalid or missing required data.";
        } else if (error.response.status === 413) {
          errorTitle = "File Too Large";
          errorDescription = "The Excel file is too large. Please try a smaller file.";
        } else {
          errorDescription = error.response.data || `Server error (${error.response.status}): Please try again later.`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorDescription = "No response from server. Please check your network connection.";
      } else {
        // Something else happened while setting up the request
        errorDescription = error.message || "An unknown error occurred";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const downloadSampleTemplate = async () => {
    // Generate a toast notification
    toast({
      title: "Template Download",
      description: "Downloading Excel template...",
    });
    
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        toast({
          title: "Authentication Required",
          description: "Please log in to download the template",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      // Use fetch with authentication headers to get the template
      const response = await fetch('/api/admin/import/template', {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      // Get the filename from the response headers or use a default name
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'import-template.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]*/g, '');
        }
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Template downloaded successfully!",
        variant: "success"
      });
    } catch (error) {
      console.error('Template download error:', error);
      
      let errorTitle = "Download Failed";
      let errorDescription = "";
      
      if (error.message?.includes('status: 401')) {
        errorTitle = "Authentication Error";
        errorDescription = "You are not authorized to download this template. Please log in again.";
      } else if (error.message?.includes('status: 404')) {
        errorTitle = "Template Not Found";
        errorDescription = "The requested template could not be found.";
      } else {
        errorDescription = error.message || "An error occurred while downloading the template.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="import" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Import Tool</h1>
          <TabsList>
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Excel Data Import</CardTitle>
              <CardDescription>
                Upload an Excel file to import data into the system. The file must follow the required template structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <FileSpreadsheet className="h-12 w-12 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">Upload Excel File</h3>
                    <p className="text-sm text-gray-500">
                      Upload an Excel file (.xlsx) containing your data. Make sure it follows the template structure.
                    </p>
                  </div>
                </div>
                
                <div 
                  className={`border border-dashed rounded-lg p-8 mb-6 ${dragActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleDropzoneClick}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="text-center mb-6">
                    <Upload className={`h-10 w-10 mx-auto mb-2 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-500 mb-4">
                      Drag and drop your Excel file here, or click to browse
                    </p>
                    <Input 
                      type="file" 
                      id="file-upload"
                      accept=".xlsx,.xls" 
                      onChange={handleFileChange}
                      className="hidden" /* Hide the default input */
                      ref={fileInputRef}
                    />
                    {file && (
                      <p className="text-sm font-medium">
                        Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering handleDropzoneClick
                        downloadSampleTemplate();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                </div>

                {/* Upload button placed outside the drop zone */}
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!file || isUploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload & Import'}
                  </Button>
                </div>
                
                {isUploading && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Uploading and processing...</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
              
              {result && (
                <Alert className="mt-4">
                  <AlertTitle>Import Results</AlertTitle>
                  <AlertDescription>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-green-700 font-semibold text-lg">{result.successCount}</p>
                        <p className="text-sm text-green-600">Records imported</p>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <p className="text-amber-700 font-semibold text-lg">{result.warnings?.length || 0}</p>
                        <p className="text-sm text-amber-600">Warnings</p>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-700 font-semibold text-lg">{result.failureCount}</p>
                        <p className="text-sm text-red-600">Failed records</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      <div className="bg-blue-50 p-2 rounded border border-blue-200 text-center">
                        <p className="text-blue-700 font-medium">{result.usersImported}</p>
                        <p className="text-xs text-blue-600">Users</p>
                      </div>
                      
                      <div className="bg-purple-50 p-2 rounded border border-purple-200 text-center">
                        <p className="text-purple-700 font-medium">{result.departmentsImported}</p>
                        <p className="text-xs text-purple-600">Departments</p>
                      </div>
                      
                      <div className="bg-emerald-50 p-2 rounded border border-emerald-200 text-center">
                        <p className="text-emerald-700 font-medium">{result.semestersImported}</p>
                        <p className="text-xs text-emerald-600">Semesters</p>
                      </div>
                      
                      <div className="bg-pink-50 p-2 rounded border border-pink-200 text-center">
                        <p className="text-pink-700 font-medium">{result.studentsImported}</p>
                        <p className="text-xs text-pink-600">Students</p>
                      </div>
                      
                      <div className="bg-orange-50 p-2 rounded border border-orange-200 text-center">
                        <p className="text-orange-700 font-medium">{result.subjectsImported}</p>
                        <p className="text-xs text-orange-600">Subjects</p>
                      </div>
                    </div>
                    
                    {result.errors?.length > 0 && (
                      <Accordion type="single" collapsible className="mb-4">
                        <AccordionItem value="errors">
                          <AccordionTrigger className="text-red-600 font-medium">
                            Errors ({result.errors.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-red-600">
                              {result.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                    
                    {result.warnings?.length > 0 && (
                      <Accordion type="single" collapsible className="mb-4">
                        <AccordionItem value="warnings">
                          <AccordionTrigger className="text-amber-600 font-medium">
                            Warnings ({result.warnings.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-amber-600">
                              {result.warnings.map((warning, i) => (
                                <li key={i}>{warning}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                    
                    {result.successMessages?.length > 0 && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="success">
                          <AccordionTrigger className="text-green-600 font-medium">
                            Successful Imports ({result.successMessages.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-green-600 max-h-40 overflow-y-auto">
                              {result.successMessages.map((msg, i) => (
                                <li key={i}>{msg}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Excel Import Documentation</CardTitle>
              <CardDescription>
                Learn how to prepare your Excel file for importing data into the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-bold mb-4">Overview</h3>
                  <p className="mb-2">
                    The Excel import tool allows administrators to bulk import data into the system using a structured Excel file.
                    The file must contain separate sheets for each entity type, with specific column headers for each sheet.
                  </p>
                  <p className="mb-4">
                    This documentation explains the required structure for your Excel file and provides guidance on how to prepare your data.
                  </p>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                    <h4 className="text-amber-800 font-medium mb-2">Important Notes</h4>
                    <ul className="list-disc pl-5 space-y-1 text-amber-700">
                      <li>The first row of each sheet must contain the column headers exactly as specified</li>
                      <li>Required fields must have values for each row</li>
                      <li>Relationships between entities (e.g., department references) must use exact names</li>
                      <li>Import sheets in the following order: Departments, Semesters, Users, Subjects, Students</li>
                      <li>The maximum file size is 10MB</li>
                      <li>Each sheet can have up to 1000 rows</li>
                    </ul>
                  </div>
                </section>
                
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Required Excel Structure</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={downloadSampleTemplate}
                      className="flex items-center gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Download Template
                    </Button>
                  </div>
                  
                  <p className="mb-4">
                    Your Excel file should contain the following sheets, each with the specified columns:
                  </p>
                  
                  <Accordion type="multiple" className="mb-6">
                    {templateStructures.map((structure, index) => (
                      <AccordionItem value={`sheet-${index}`} key={index}>
                        <AccordionTrigger className="font-medium">
                          {structure.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Column</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead>Required</TableHead>
                                  <TableHead>Example</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {structure.columns.map((column, colIndex) => (
                                  <TableRow key={colIndex}>
                                    <TableCell className="font-medium">{column.name}</TableCell>
                                    <TableCell>{column.description}</TableCell>
                                    <TableCell>
                                      {column.required ? (
                                        <Badge variant="default">Required</Badge>
                                      ) : (
                                        <Badge variant="outline">Optional</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                                        {column.example}
                                      </code>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
                
                <section>
                  <h3 className="text-lg font-bold mb-4">Step-by-Step Guide</h3>
                  
                  <ol className="space-y-4 list-decimal pl-5">
                    <li>
                      <p className="font-medium">Prepare your Excel file</p>
                      <p className="text-gray-600">
                        Create a new Excel file with the required sheets. Each sheet should have the first row as headers,
                        matching exactly the column names specified above.
                      </p>
                    </li>
                    
                    <li>
                      <p className="font-medium">Fill in your data</p>
                      <p className="text-gray-600">
                        Add your data rows under the headers. Make sure to provide values for all required fields.
                        For relationships (like department names), use exact names that match existing records or new records
                        you're creating in other sheets.
                      </p>
                    </li>
                    
                    <li>
                      <p className="font-medium">Order matters for relationships</p>
                      <p className="text-gray-600">
                        It's recommended to import in this order: Departments → Semesters → Users → Subjects → Students.
                        This ensures that dependent entities (like Students that need Departments) have their related entities
                        already imported.
                      </p>
                    </li>
                    
                    <li>
                      <p className="font-medium">Upload your file</p>
                      <p className="text-gray-600">
                        Go to the Import tab, select your file, and click "Upload & Import".
                        The system will process your file and display the results.
                      </p>
                    </li>
                    
                    <li>
                      <p className="font-medium">Review import results</p>
                      <p className="text-gray-600">
                        After the import is complete, check the results to see which records were successfully imported
                        and if there were any errors or warnings.
                      </p>
                    </li>
                  </ol>
                </section>
                
                <section>
                  <h3 className="text-lg font-bold mb-4">Troubleshooting</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Common errors and how to fix them:</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600 mt-2">
                        <li>
                          <span className="text-red-600 font-medium">Missing required field</span>: 
                          Ensure all required fields have values for each row.
                        </li>
                        <li>
                          <span className="text-red-600 font-medium">Department/Semester not found</span>: 
                          Make sure the referenced department or semester exists in the system or is included in the
                          respective sheet with the exact same name.
                        </li>
                        <li>
                          <span className="text-red-600 font-medium">Duplicate record</span>: 
                          The system will skip records that already exist (based on unique identifiers like username, email, studentId).
                        </li>
                        <li>
                          <span className="text-red-600 font-medium">Invalid data format</span>: 
                          Ensure data is in the correct format (e.g., valid emails, proper role names).
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              <Button variant="outline" onClick={() => setActiveTab("import")}>
                Go to Import Tool
              </Button>
              <Button onClick={downloadSampleTemplate} className="flex items-center gap-2">
                <DownloadIcon className="h-4 w-4" />
                Download Sample Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExcelImportPage;
