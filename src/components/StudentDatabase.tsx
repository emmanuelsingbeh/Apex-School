import { useState } from 'react';
import { StudentSearch } from './StudentSearch';
import { StudentDetail } from './StudentDetail';
import { AddStudentForm } from './AddStudentForm';
import { AddAcademicRecordForm } from './AddAcademicRecordForm';
import { Student } from '@/types/student';

type View = 'search' | 'detail' | 'add-student' | 'add-record';

export const StudentDatabase = () => {
  const [currentView, setCurrentView] = useState<View>('search');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [recordStudentId, setRecordStudentId] = useState<string>('');

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentView('detail');
  };

  const handleAddStudent = () => {
    setCurrentView('add-student');
  };

  const handleAddRecord = (studentId: string) => {
    setRecordStudentId(studentId);
    setCurrentView('add-record');
  };

  const handleBack = () => {
    setCurrentView('search');
    setSelectedStudent(null);
    setRecordStudentId('');
  };

  const handleStudentAdded = (student: Student) => {
    setSelectedStudent(student);
    setCurrentView('detail');
  };

  const handleHome = () => {
    setCurrentView('search');
    setSelectedStudent(null);
    setRecordStudentId('');
  };

  const handleRecordAdded = () => {
    // Always go back to detail view when record is added
    setCurrentView('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-light to-background p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        {currentView === 'search' && (
          <StudentSearch 
            onStudentSelect={handleStudentSelect}
            onAddStudent={handleAddStudent}
          />
        )}
        
        {currentView === 'detail' && selectedStudent && (
          <StudentDetail 
            student={selectedStudent}
            onBack={handleHome}
            onAddRecord={handleAddRecord}
          />
        )}
        
        {currentView === 'add-student' && (
          <AddStudentForm 
            onBack={handleHome}
            onSuccess={handleStudentAdded}
          />
        )}
        
        {currentView === 'add-record' && recordStudentId && (
          <AddAcademicRecordForm 
            studentId={recordStudentId}
            onBack={() => setCurrentView('detail')}
            onSuccess={handleRecordAdded}
          />
        )}
      </div>
    </div>
  );
};
export default StudentDatabase;