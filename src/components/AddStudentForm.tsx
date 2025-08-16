import { useState } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentData } from '@/hooks/useStudentData';
import { Student } from '@/types/student';
import { useToast } from '@/hooks/use-toast';

interface AddStudentFormProps {
  onBack: () => void;
  onSuccess: (student: Student) => void;
}

export const AddStudentForm = ({ onBack, onSuccess }: AddStudentFormProps) => {
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    sex: '' as 'Male' | 'Female' | 'Other' | '',
    contact: '',
    department: '' as 'Education' | 'Sociology' | 'Criminal Justice' | ''
  });
  
  const { addStudent, students } = useStudentData();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.id.trim()) {
      toast({ title: "Error", description: "Student ID is required", variant: "destructive" });
      return;
    }
    
    if (!formData.fullName.trim()) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" });
      return;
    }
    
    if (!formData.sex) {
      toast({ title: "Error", description: "Sex is required", variant: "destructive" });
      return;
    }
    
    if (!formData.department) {
      toast({ title: "Error", description: "Department is required", variant: "destructive" });
      return;
    }
    
    // Check if student ID already exists
    if (students.find(s => s.id === formData.id)) {
      toast({ title: "Error", description: "Student ID already exists", variant: "destructive" });
      return;
    }

    const newStudent: Student = {
      id: formData.id.trim(),
      fullName: formData.fullName.trim(),
      sex: formData.sex,
      contact: formData.contact.trim(),
      department: formData.department as 'Education' | 'Sociology' | 'Criminal Justice'
    };

    addStudent(newStudent);
    toast({ title: "Success", description: "Student added successfully!" });
    onSuccess(newStudent);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="hover:bg-academic-blue/10">
          <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          <span className="text-sm md:text-base">Back</span>
        </Button>
      </div>

      <Card className="shadow-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <User className="h-4 w-4 md:h-5 md:w-5 text-academic-blue" />
            Add New Student
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm md:text-base">Student ID *</Label>
                <Input
                  id="studentId"
                  placeholder="Enter student ID"
                  value={formData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  required
                  className="text-sm md:text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm md:text-base">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                  className="text-sm md:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex" className="text-sm md:text-base">Sex *</Label>
                <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                  <SelectTrigger className="text-sm md:text-base">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm md:text-base">Contact</Label>
                <Input
                  id="contact"
                  placeholder="Phone number or email"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className="text-sm md:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm md:text-base">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Sociology">Sociology</SelectItem>
                  <SelectItem value="Criminal Justice">Criminal Justice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button type="button" variant="outline" onClick={onBack} className="text-sm md:text-base">
                Cancel
              </Button>
              <Button type="submit" variant="academic" className="text-sm md:text-base">
                <Save className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Add Student
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};