import { Student, AcademicRecord } from '@/types/student';

export const sampleStudents: Student[] = [
  {
    id: 'STU001',
    fullName: 'Emma Johnson',
    sex: 'Female',
    contact: '+1 (555) 123-4567',
    department: 'Education'
  },
  {
    id: 'STU002',
    fullName: 'Michael Chen',
    sex: 'Male',
    contact: 'michael.chen@email.com',
    department: 'Sociology'
  },
  {
    id: 'STU003',
    fullName: 'Sarah Rodriguez',
    sex: 'Female',
    contact: '+1 (555) 987-6543',
    department: 'Criminal Justice'
  }
];

export const sampleAcademicRecords: AcademicRecord[] = [
  {
    id: 'REC001',
    studentId: 'STU001',
    year: '2024',
    semester: 'Semester 1',
    status: 'Senior',
    courses: [
      {
        id: 'C001',
        courseName: 'Advanced Calculus',
        courseCode: 'MATH401',
        grade: 'A',
        credits: 3
      },
      {
        id: 'C002',
        courseName: 'Computer Science Principles',
        courseCode: 'CS101',
        grade: 'A-',
        credits: 4
      },
      {
        id: 'C003',
        courseName: 'Physics II',
        courseCode: 'PHYS201',
        grade: 'B+',
        credits: 3
      }
    ]
  },
  {
    id: 'REC002',
    studentId: 'STU001',
    year: '2023',
    semester: 'Semester 2',
    status: 'Junior',
    courses: [
      {
        id: 'C004',
        courseName: 'Organic Chemistry',
        courseCode: 'CHEM301',
        grade: 'B',
        credits: 4
      },
      {
        id: 'C005',
        courseName: 'Statistics',
        courseCode: 'MATH301',
        grade: 'A',
        credits: 3
      }
    ]
  },
  {
    id: 'REC003',
    studentId: 'STU002',
    year: '2024',
    semester: 'Semester 1',
    status: 'Sophomore',
    courses: [
      {
        id: 'C006',
        courseName: 'Introduction to Programming',
        courseCode: 'CS150',
        grade: 'A+',
        credits: 4
      },
      {
        id: 'C007',
        courseName: 'English Literature',
        courseCode: 'ENG201',
        grade: 'B+',
        credits: 3
      },
      {
        id: 'C008',
        courseName: 'World History',
        courseCode: 'HIST101',
        grade: 'A-',
        credits: 3
      }
    ]
  },
  {
    id: 'REC004',
    studentId: 'STU003',
    year: '2024',
    semester: 'Semester 2',
    status: 'Freshman',
    courses: [
      {
        id: 'C009',
        courseName: 'College Algebra',
        courseCode: 'MATH101',
        grade: 'B',
        credits: 3
      },
      {
        id: 'C010',
        courseName: 'Biology I',
        courseCode: 'BIO101',
        grade: 'A',
        credits: 4
      }
    ]
  }
];

export const initializeSampleData = () => {
  const existingStudents = localStorage.getItem('grade-galaxy-students');
  const existingRecords = localStorage.getItem('grade-galaxy-academic-records');
  
  if (!existingStudents) {
    localStorage.setItem('grade-galaxy-students', JSON.stringify(sampleStudents));
  }
  
  if (!existingRecords) {
    localStorage.setItem('grade-galaxy-academic-records', JSON.stringify(sampleAcademicRecords));
  }
};