import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Student, AcademicRecord, Course, StudentWithRecords } from '@/types/student';
import { toast } from 'sonner';

export const useStudentData = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear data when user logs out
      setStudents([]);
      setAcademicRecords([]);
      setIsLoaded(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id);

      if (studentsError) {
        console.error('Error loading students:', studentsError);
        toast.error('Failed to load students');
        return;
      }

      // Load academic records with courses
      const { data: recordsData, error: recordsError } = await supabase
        .from('academic_records')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id);

      if (recordsError) {
        console.error('Error loading academic records:', recordsError);
        toast.error('Failed to load academic records');
        return;
      }

      // Transform the data to match our existing format
      const transformedStudents = studentsData?.map(student => ({
        id: student.id,
        fullName: student.full_name,
        sex: student.sex,
        contact: student.contact,
        department: student.department
      })) || [];

      const transformedRecords = recordsData?.map(record => ({
        id: record.id,
        studentId: record.student_id,
        year: record.year,
        semester: record.semester as 'Semester 1' | 'Semester 2',
        status: record.status as 'Freshman' | 'Sophomore' | 'Junior' | 'Senior',
        courses: record.courses?.map((course: any) => ({
          id: course.id,
          courseName: course.course_name,
          courseCode: course.course_code,
          grade: course.grade,
          credits: course.credits
        })) || []
      })) || [];

      setStudents(transformedStudents);
      setAcademicRecords(transformedRecords);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const addStudent = async (student: Student) => {
    if (!user) {
      toast.error('You must be logged in to add students');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          id: student.id,
          user_id: user.id,
          full_name: student.fullName,
          sex: student.sex,
          contact: student.contact,
          department: student.department
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding student:', error);
        toast.error('Failed to add student');
        return;
      }

      // Transform back to our format
      const newStudent: Student = {
        id: data.id,
        fullName: data.full_name,
        sex: data.sex,
        contact: data.contact,
        department: data.department
      };

      setStudents(prev => [...prev, newStudent]);
      toast.success('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const addAcademicRecord = async (record: AcademicRecord) => {
    if (!user) {
      toast.error('You must be logged in to add academic records');
      return;
    }

    try {
      // Check if record already exists for this student/year/semester/status combination
      const existingRecord = academicRecords.find(
        r => r.studentId === record.studentId && 
             r.year === record.year && 
             r.semester === record.semester && 
             r.status === record.status
      );

      if (existingRecord) {
        // Add courses to existing record
        const coursesToAdd = record.courses.filter(
          newCourse => !existingRecord.courses.some(
            existingCourse => existingCourse.courseCode === newCourse.courseCode
          )
        );

        if (coursesToAdd.length > 0) {
          // Insert new courses
          const coursesData = coursesToAdd.map(course => ({
            id: course.id,
            user_id: user.id,
            academic_record_id: existingRecord.id,
            course_name: course.courseName,
            course_code: course.courseCode,
            grade: course.grade,
            credits: course.credits
          }));

          const { error: coursesError } = await supabase
            .from('courses')
            .insert(coursesData);

          if (coursesError) {
            console.error('Error adding courses:', coursesError);
            toast.error('Failed to add courses');
            return;
          }

          // Update local state
          setAcademicRecords(prev => prev.map(r => 
            r.id === existingRecord.id 
              ? { ...r, courses: [...r.courses, ...coursesToAdd] }
              : r
          ));
          toast.success('Courses added to existing record');
        } else {
          toast.info('All courses already exist in this record');
        }
      } else {
        // Create new academic record
        const { data: recordData, error: recordError } = await supabase
          .from('academic_records')
          .insert({
            id: record.id,
            user_id: user.id,
            student_id: record.studentId,
            year: record.year,
            semester: record.semester,
            status: record.status
          })
          .select()
          .single();

        if (recordError) {
          console.error('Error adding academic record:', recordError);
          toast.error('Failed to add academic record');
          return;
        }

        // Add courses to the new record
        if (record.courses.length > 0) {
          const coursesData = record.courses.map(course => ({
            id: course.id,
            user_id: user.id,
            academic_record_id: recordData.id,
            course_name: course.courseName,
            course_code: course.courseCode,
            grade: course.grade,
            credits: course.credits
          }));

          const { error: coursesError } = await supabase
            .from('courses')
            .insert(coursesData);

          if (coursesError) {
            console.error('Error adding courses:', coursesError);
            toast.error('Failed to add courses');
            return;
          }
        }

        // Transform back to our format
        const newRecord: AcademicRecord = {
          id: recordData.id,
          studentId: recordData.student_id,
          year: recordData.year,
          semester: recordData.semester as 'Semester 1' | 'Semester 2',
          status: recordData.status as 'Freshman' | 'Sophomore' | 'Junior' | 'Senior',
          courses: record.courses
        };

        setAcademicRecords(prev => [...prev, newRecord]);
        toast.success('Academic record added successfully');
      }
    } catch (error) {
      console.error('Error adding academic record:', error);
      toast.error('Failed to add academic record');
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete students');
      return;
    }

    try {
      // Delete student (this will cascade delete academic records and courses)
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
        return;
      }

      // Update local state
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setAcademicRecords(prev => prev.filter(r => r.studentId !== studentId));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const filterRecordsBySemester = (studentId: string, year: string, semester: string): AcademicRecord[] => {
    return academicRecords.filter(
      record => record.studentId === studentId && 
                record.year === year && 
                record.semester === semester
    );
  };

  const getStudentWithRecords = (studentId: string): StudentWithRecords | null => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const studentRecords = academicRecords.filter(r => r.studentId === studentId);
    return {
      ...student,
      academicRecords: studentRecords
    };
  };

  const getStudentRecords = (studentId: string): AcademicRecord[] => {
    return academicRecords.filter(r => r.studentId === studentId);
  };

  const searchStudents = (query: string): Student[] => {
    if (!query.trim()) return students;
    
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student =>
      student.fullName.toLowerCase().includes(lowercaseQuery) ||
      student.id.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    students,
    academicRecords,
    isLoaded,
    addStudent,
    addAcademicRecord,
    deleteStudent,
    filterRecordsBySemester,
    getStudentWithRecords,
    getStudentRecords,
    searchStudents,
    refreshData: loadData
  };
};
