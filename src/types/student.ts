export interface Student {
  id: string;
  fullName: string;
  sex: 'Male' | 'Female' | 'Other';
  contact: string;
  department: 'Education' | 'Sociology' | 'Criminal Justice';
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  year: string;
  semester: 'Semester 1' | 'Semester 2';
  status: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  courses: Course[];
}

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  grade: string;
  credits: number;
}

export interface StudentWithRecords extends Student {
  academicRecords: AcademicRecord[];
}