import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentData } from '@/hooks/useStudentData';
import { AcademicRecord, Course } from '@/types/student';
import { useToast } from '@/hooks/use-toast';

interface AddAcademicRecordFormProps {
  studentId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddAcademicRecordForm = ({ studentId, onBack, onSuccess }: AddAcademicRecordFormProps) => {
  const [formData, setFormData] = useState({
    year: '',
    semester: '' as 'Semester 1' | 'Semester 2' | '',
    status: '' as 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | ''
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState({
    courseName: '',
    courseCode: '',
    grade: '',
    credits: 1
  });

  const { addAcademicRecord, students } = useStudentData();
  const { toast } = useToast();

  const student = students.find(s => s.id === studentId);
  const currentYear = new Date().getFullYear();

  const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'NG', 'IP'];

  const addCourse = () => {
    if (!currentCourse.courseName.trim() || !currentCourse.courseCode.trim() || !currentCourse.grade) {
      toast({ title: "Error", description: "Please fill in all course details", variant: "destructive" });
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      courseName: currentCourse.courseName.trim(),
      courseCode: currentCourse.courseCode.trim(),
      grade: currentCourse.grade,
      credits: currentCourse.credits
    };

    setCourses(prev => [...prev, newCourse]);
    setCurrentCourse({
      courseName: '',
      courseCode: '',
      grade: '',
      credits: 1
    });
  };

  const removeCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.year || !formData.semester || !formData.status) {
      toast({ title: "Error", description: "Please fill in year, semester and status", variant: "destructive" });
      return;
    }

    const newRecord: AcademicRecord = {
      id: Date.now().toString(),
      studentId,
      year: formData.year,
      semester: formData.semester as 'Semester 1' | 'Semester 2',
      status: formData.status,
      courses: [...courses]
    };

    addAcademicRecord(newRecord);
    toast({ title: "Success", description: "Academic record added successfully!" });
    onSuccess();
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="hover:bg-academic-blue/10">
          <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          <span className="text-sm md:text-base">Back</span>
        </Button>
      </div>

      <Card className="shadow-card max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-academic-green" />
            <span className="text-sm md:text-base">Add Academic Record for {student?.fullName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm md:text-base">Academic Year *</Label>
                <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger className="text-sm md:text-base">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                   {Array.from({ length: 50 }, (_, i) => currentYear - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                    {year}
                     </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester" className="text-sm md:text-base">Semester *</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value as any }))}>
                  <SelectTrigger className="text-sm md:text-base">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm md:text-base">Academic Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                  <SelectTrigger className="text-sm md:text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Course Section */}
            <Card className="bg-academic-light/50">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Add Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">Course Name</Label>
                    <Input
                      placeholder="e.g., Mathematics"
                      value={currentCourse.courseName}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, courseName: e.target.value }))}
                      className="text-sm md:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">Course Code</Label>
                    <Input
                      placeholder="e.g., MATH101"
                      value={currentCourse.courseCode}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, courseCode: e.target.value }))}
                      className="text-sm md:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">Grade</Label>
                    <Select value={currentCourse.grade} onValueChange={(value) => setCurrentCourse(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger className="text-sm md:text-base">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">Credits</Label>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={currentCourse.credits}
                      onChange={(e) => setCurrentCourse(prev => ({ ...prev, credits: parseInt(e.target.value) || 1 }))}
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>
                
                <Button type="button" onClick={addCourse} variant="info" size="sm" className="text-sm md:text-base">
                  <Plus className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Add Course
                </Button>
              </CardContent>
            </Card>

            {/* Added Courses List */}
            {courses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Added Courses ({courses.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-academic-light rounded-lg gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm md:text-base">{course.courseName}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">{course.courseCode}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base md:text-lg">{course.grade}</span>
                          <span className="text-xs md:text-sm text-muted-foreground">{course.credits} credits</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCourse(course.id)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="text-sm md:text-base">
                Cancel
              </Button>
              <Button type="submit" variant="academic" className="text-sm md:text-base">
                <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Save Academic Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
