import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Plus,
  FileSpreadsheet,
  FileText,
  Trash2,
  LogOut,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudentData } from '@/hooks/useStudentData';
import { useAuth } from '@/hooks/useAuth';
import { Student } from '@/types/student';
import { initializeSampleData } from '@/utils/sampleData';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import academicHero from '@/assets/academic-hero.jpg';
import aulLogo from '@/assets/aul-logo.png';
import apexLogo from '@/assets/apex.jpg';

// Enhanced components
import { DashboardStats } from '@/components/enhanced/DashboardStats';
import { EnhancedSearch } from '@/components/enhanced/EnhancedSearch';
import { StudentListSkeleton } from '@/components/enhanced/LoadingSkeletons';
import { BreadcrumbNavigation } from '@/components/enhanced/BreadcrumbNavigation';

interface StudentSearchProps {
  onStudentSelect: (student: Student) => void;
  onAddStudent: () => void;
}

export const StudentSearch = ({ onStudentSelect, onAddStudent }: StudentSearchProps) => {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const { students, academicRecords, deleteStudent, isLoaded } = useStudentData();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initializeSampleData();
  }, []);

  const handleExportExcel = () => {
    try {
      exportToExcel(students, academicRecords);
      toast.success('Excel export completed successfully!');
    } catch (error) {
      console.error('Export to Excel failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(students, academicRecords);
      toast.success('PDF export completed successfully!');
    } catch (error) {
      console.error('Export to PDF failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const confirmDelete = confirm(`Are you sure you want to delete ${student?.fullName} and their academic records?`);
    if (!confirmDelete) return;

    deleteStudent(studentId);
    toast.success('Student deleted successfully');
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Failed to logout');
      } else {
        toast.success('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', onClick: () => {}, isActive: true }
  ];

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-red-600 hover:text-red-800"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
        <StudentListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Logout */}
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation items={breadcrumbItems} />
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="text-red-600 hover:text-red-800 hover-lift"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden rounded-xl shadow-lg-enhanced animate-slide-up">
        <div
          className="h-48 md:h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${academicHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between p-4 md:p-8 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="relative">
                <img 
                  src={apexLogo} 
                  alt="Apex University of Liberia Logo" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg shadow-glow hover-lift"
                />
                <div className="absolute inset-0 bg-gradient-glow rounded-lg animate-pulse-glow"></div>
              </div>
              <div className="text-white text-center md:text-left">
                <h1 className="text-xl md:text-4xl font-bold mb-1 md:mb-2 animate-bounce-in">
                  Apex University of Liberia
                </h1>
                <p className="text-white/90 text-sm md:text-xl mb-2 md:mb-3 animate-fade-in">
                  Student Database Management System
                </p>
                <div className="text-white/80 text-xs md:text-sm animate-slide-up">
                  <p className="font-medium mb-1">College of Education and Liberal Art</p>
                  <p className="mb-1 hidden md:block">72nd S.K.D. Boulevard, Paynesville City, Montserrado County, Liberia</p>
                  <p className="hidden md:block">Tel: (+231) 771596881/888993477 | Email: arrowjohubockarie88Ajb@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onAddStudent}
                variant="academic"
                size="sm"
                className="hover-lift animate-bounce-in text-xs md:text-sm"
              >
                <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <DashboardStats />

      {/* Enhanced Search */}
      <EnhancedSearch 
        students={students}
        onResultsChange={setFilteredStudents}
        className="animate-slide-up"
      />

      {/* Students List Section */}
      <div className="space-y-4 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-academic-blue" />
            Students ({filteredStudents.length})
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              size="sm"
              disabled={students.length === 0}
              className="flex-1 sm:flex-none text-xs md:text-sm hover-lift"
            >
              <FileSpreadsheet className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              disabled={students.length === 0}
              className="flex-1 sm:flex-none text-xs md:text-sm hover-lift"
            >
              <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              PDF
            </Button>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <Card className="shadow-card animate-scale-in">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                {students.length === 0 ? 'No Students Yet' : 'No Results Found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {students.length === 0
                  ? 'Get started by adding your first student to the database.'
                  : 'Try adjusting your search criteria or filters.'}
              </p>
              {students.length === 0 && (
                <Button onClick={onAddStudent} variant="academic" className="hover-lift">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Student
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredStudents.map((student, index) => (
              <Card
                key={student.id}
                className="hover-lift shadow-card transition-all duration-300 hover:shadow-academic animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div
                    className="cursor-pointer w-full group"
                    onClick={() => onStudentSelect(student)}
                  >
                    <h3 className="font-semibold text-base md:text-lg group-hover:text-academic-blue transition-colors">
                      {student.fullName}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">ID: {student.id}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{student.contact}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Department: {student.department}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs hover-lift">
                      {student.sex}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 self-end sm:self-center transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
