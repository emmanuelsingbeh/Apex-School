import { useState } from 'react';
import { ArrowLeft, User, Phone, Building2, BookOpen, GraduationCap, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentData } from '@/hooks/useStudentData';
import { Student, AcademicRecord } from '@/types/student';
import { exportStudentToPDF } from '@/utils/exportUtils';

interface StudentDetailProps {
  student: Student;
  onBack: () => void;
  onAddRecord: (studentId: string) => void;
}

export const StudentDetail = ({ student, onBack, onAddRecord }: StudentDetailProps) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const { getStudentWithRecords, getStudentRecords, filterRecordsBySemester } = useStudentData();
  
  const studentWithRecords = getStudentWithRecords(student.id);
  const availableYears = studentWithRecords?.academicRecords.map(r => r.year) || [];
  const uniqueYears = [...new Set(availableYears)];
  
  const availableSemesters = selectedYear 
    ? [...new Set(studentWithRecords?.academicRecords
        .filter(r => r.year === selectedYear)
        .map(r => r.semester) || [])]
    : [];
  
  const selectedRecord = selectedYear && selectedSemester
    ? studentWithRecords?.academicRecords.find(r => r.year === selectedYear && r.semester === selectedSemester)
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Freshman': return 'bg-blue-100 text-blue-800';
      case 'Sophomore': return 'bg-green-100 text-green-800';
      case 'Junior': return 'bg-yellow-100 text-yellow-800';
      case 'Senior': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateGPA = (record: AcademicRecord) => {
    if (!record.courses.length) return 'N/A';
    
    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    record.courses.forEach(course => {
      const points = gradePoints[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 'N/A';
  };

  const handleExportStudentPDF = () => {
    if (studentWithRecords) {
      try {
        exportStudentToPDF(studentWithRecords);
      } catch (error) {
        console.error('Export to PDF failed:', error);
        alert('Export failed. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          className="hover:bg-academic-blue/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportStudentPDF}
            variant="outline"
            disabled={!studentWithRecords?.academicRecords.length}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            onClick={() => onAddRecord(student.id)} 
            variant="academic"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Academic Record
          </Button>
        </div>
      </div>

      {/* Student Basic Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-academic-blue" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-academic-navy">{student.fullName}</h3>
              <p className="text-muted-foreground">Student ID: {student.id}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">{student.sex}</Badge>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-academic-blue" />
              <span>{student.contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-academic-blue" />
              <span>{student.department}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Year Selection */}
      {uniqueYears.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-academic-green" />
              Academic Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Academic Year:</label>
                <Select value={selectedYear} onValueChange={(value) => {
                  setSelectedYear(value);
                  setSelectedSemester(''); // Reset semester when year changes
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose year..." />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueYears.map(year => {
                      const record = studentWithRecords?.academicRecords.find(r => r.year === year);
                      return (
                        <SelectItem key={year} value={year}>
                          {year} - {record?.status}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {availableSemesters.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Semester:</label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Choose..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map(semester => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Academic Record Details */}
      {selectedRecord && (
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Academic Year {selectedRecord.year}</CardTitle>
                <Badge className={getStatusColor(selectedRecord.status)}>
                  {selectedRecord.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-academic-light rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold text-academic-navy">{selectedRecord.courses.length}</p>
                </div>
                <div className="text-center p-4 bg-academic-light rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold text-academic-navy">
                    {selectedRecord.courses.reduce((sum, course) => sum + course.credits, 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-academic-light rounded-lg">
                  <p className="text-sm text-muted-foreground">GPA</p>
                  <p className="text-2xl font-bold text-academic-navy">{calculateGPA(selectedRecord)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-academic-green" />
                Courses & Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRecord.courses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No courses added for this academic year.</p>
              ) : (
                <div className="space-y-3">
                  {selectedRecord.courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-academic-light rounded-lg">
                      <div>
                        <h4 className="font-semibold">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-lg font-bold">
                          {course.grade}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">{course.credits} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {uniqueYears.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No academic records found for this student.</p>
            <Button onClick={() => onAddRecord(student.id)} variant="academic">
              Add First Academic Record
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};