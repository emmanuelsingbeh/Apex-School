import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Student, AcademicRecord, StudentWithRecords } from '@/types/student';
import apexLogo from '@/assets/apex.jpg';

export const exportToExcel = (students: Student[], academicRecords: AcademicRecord[]) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Students sheet
  const studentsData = students.map(student => ({
    'Student ID': student.id,
    'Full Name': student.fullName,
    'Sex': student.sex,
    'Contact': student.contact,
    'Department': student.department
  }));
  const studentsWS = XLSX.utils.json_to_sheet(studentsData);
  XLSX.utils.book_append_sheet(wb, studentsWS, 'Students');

  // Academic Records sheet
  const recordsData = academicRecords.map(record => {
    const student = students.find(s => s.id === record.studentId);
    return {
      'Student ID': record.studentId,
      'Student Name': student?.fullName || 'Unknown',
      'Year': record.year,
      'Semester': record.semester,
      'Status': record.status,
      'Courses Count': record.courses.length,
      'Total Credits': record.courses.reduce((sum, course) => sum + course.credits, 0)
    };
  });
  const recordsWS = XLSX.utils.json_to_sheet(recordsData);
  XLSX.utils.book_append_sheet(wb, recordsWS, 'Academic Records');

  // Detailed Courses sheet
  const coursesData: any[] = [];
  academicRecords.forEach(record => {
    const student = students.find(s => s.id === record.studentId);
    record.courses.forEach(course => {
      coursesData.push({
        'Student ID': record.studentId,
        'Student Name': student?.fullName || 'Unknown',
        'Year': record.year,
        'Semester': record.semester,
        'Status': record.status,
        'Course Code': course.courseCode,
        'Course Name': course.courseName,
        'Grade': course.grade,
        'Credits': course.credits
      });
    });
  });
  const coursesWS = XLSX.utils.json_to_sheet(coursesData);
  XLSX.utils.book_append_sheet(wb, coursesWS, 'Detailed Courses');

  // Save file
  const fileName = `students_database_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToPDF = (students: Student[], academicRecords: AcademicRecord[]) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 30;

  // University Header with logo
  try {
    doc.addImage(apexLogo, 'JPEG', 20, 10, 25, 25);
  } catch (error) {
    // Fallback to placeholder if logo fails to load
    doc.setDrawColor(0, 0, 0);
    doc.rect(20, 10, 25, 25);
    doc.setFontSize(8);
    doc.text('LOGO', 27, 25);
  }

  // University Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Apex University of Liberia (AUL)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('College of Education & Liberal Art', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text('72nd S.K.D. Boulevard, Paynesville City, Montserrado County, Liberia', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text('Tel: (+231) 771596881/888993477', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Report Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('STUDENT DATABASE REPORT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  
  // Report date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Summary Statistics Box
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPosition - 5, pageWidth - 40, 25, 'FD');
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SUMMARY STATISTICS', 25, yPosition + 3);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Students: ${students.length}`, 25, yPosition + 10);
  doc.text(`Total Academic Records: ${academicRecords.length}`, 25, yPosition + 16);
  
  // Department breakdown
  const deptCounts = students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let deptText = 'Departments: ';
  Object.entries(deptCounts).forEach(([dept, count], index) => {
    deptText += `${dept} (${count})`;
    if (index < Object.entries(deptCounts).length - 1) deptText += ', ';
  });
  doc.text(deptText, pageWidth / 2 + 10, yPosition + 10);
  
  yPosition += 35;

  // Students Table Header
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('STUDENT DIRECTORY', 20, yPosition);
  yPosition += 10;

  // Table headers
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(230, 230, 230);
  
  const tableY = yPosition;
  const rowHeight = 12;
  
  // Header row
  doc.rect(20, tableY, 15, rowHeight, 'FD'); // No.
  doc.rect(35, tableY, 50, rowHeight, 'FD'); // Name
  doc.rect(85, tableY, 25, rowHeight, 'FD'); // Student ID
  doc.rect(110, tableY, 15, rowHeight, 'FD'); // Sex
  doc.rect(125, tableY, 35, rowHeight, 'FD'); // Contact
  doc.rect(160, tableY, 30, rowHeight, 'FD'); // Department
  
  doc.text('No.', 25, tableY + 8, { align: 'center' });
  doc.text('Student Name', 60, tableY + 8, { align: 'center' });
  doc.text('Student ID', 97, tableY + 8, { align: 'center' });
  doc.text('Sex', 117, tableY + 8, { align: 'center' });
  doc.text('Contact', 142, tableY + 8, { align: 'center' });
  doc.text('Department', 175, tableY + 8, { align: 'center' });
  
  yPosition += rowHeight;

  // Student data rows
  doc.setFont(undefined, 'normal');
  students.forEach((student, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
      
      // Redraw headers on new page
      doc.setFont(undefined, 'bold');
      doc.rect(20, yPosition, 15, rowHeight, 'FD');
      doc.rect(35, yPosition, 50, rowHeight, 'FD');
      doc.rect(85, yPosition, 25, rowHeight, 'FD');
      doc.rect(110, yPosition, 15, rowHeight, 'FD');
      doc.rect(125, yPosition, 35, rowHeight, 'FD');
      doc.rect(160, yPosition, 30, rowHeight, 'FD');
      
      doc.text('No.', 25, yPosition + 8, { align: 'center' });
      doc.text('Student Name', 60, yPosition + 8, { align: 'center' });
      doc.text('Student ID', 97, yPosition + 8, { align: 'center' });
      doc.text('Sex', 117, yPosition + 8, { align: 'center' });
      doc.text('Contact', 142, yPosition + 8, { align: 'center' });
      doc.text('Department', 175, yPosition + 8, { align: 'center' });
      
      yPosition += rowHeight;
      doc.setFont(undefined, 'normal');
    }

    // Alternating row colors
    if (index % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, yPosition, 170, rowHeight, 'F');
    }

    // Draw borders
    doc.rect(20, yPosition, 15, rowHeight);
    doc.rect(35, yPosition, 50, rowHeight);
    doc.rect(85, yPosition, 25, rowHeight);
    doc.rect(110, yPosition, 15, rowHeight);
    doc.rect(125, yPosition, 35, rowHeight);
    doc.rect(160, yPosition, 30, rowHeight);

    // Student data
    doc.text((index + 1).toString(), 27, yPosition + 8, { align: 'center' });
    doc.text(student.fullName.substring(0, 20), 37, yPosition + 8);
    doc.text(student.id, 87, yPosition + 8);
    doc.text(student.sex.charAt(0), 117, yPosition + 8, { align: 'center' });
    doc.text(student.contact.substring(0, 15), 127, yPosition + 8);
    doc.text(student.department.substring(0, 12), 162, yPosition + 8);
    
    yPosition += rowHeight;
  });

  // Academic Records Summary
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 30;
  } else {
    yPosition += 20;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('ACADEMIC RECORDS SUMMARY', 20, yPosition);
  yPosition += 15;

  academicRecords.forEach((record, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    const student = students.find(s => s.id === record.studentId);
    const totalCredits = record.courses.reduce((sum, c) => sum + c.credits, 0);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${student?.fullName || 'Unknown Student'}`, 20, yPosition);
    yPosition += 6;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Student ID: ${record.studentId}`, 25, yPosition);
    doc.text(`Academic Year: ${record.year}`, 25, yPosition + 5);
    doc.text(`Semester: ${record.semester}`, 25, yPosition + 10);
    doc.text(`Status: ${record.status}`, 25, yPosition + 15);
    doc.text(`Courses Enrolled: ${record.courses.length}`, 120, yPosition);
    doc.text(`Total Credit Hours: ${totalCredits}`, 120, yPosition + 5);
    
    yPosition += 25;
  });

  // Footer - add page numbers to all pages
  const totalPages = doc.internal.pages.length - 1; // Subtract 1 because pages array includes an empty first element
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    doc.text('Apex University of Liberia - Student Database Report', 20, pageHeight - 10);
  }

  // Save file
  const fileName = `AUL_Students_Database_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportStudentToPDF = (studentWithRecords: StudentWithRecords) => {
  const doc = new jsPDF();
  let yPosition = 30;
  const pageWidth = doc.internal.pageSize.width;

  // Add university logo
  try {
    doc.addImage(apexLogo, 'JPEG', 20, 10, 25, 25);
  } catch (error) {
    // Fallback to placeholder if logo fails to load
    doc.setDrawColor(0, 0, 0);
    doc.rect(20, 10, 25, 25);
    doc.setFontSize(8);
    doc.text('LOGO', 27, 25);
  }

  // University Header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Apex University Of Liberia (AUL)', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('72nd S.K.D. Boulevard, Paynesville City', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text('Montserrado County, Liberia', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text('Office Of The Dean Of Admission, Records & Registration', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Title
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Student Grade Ledger', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Student Info - Left aligned format to match the reference image
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  doc.text(`Student Name    : ${studentWithRecords.fullName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Student ID      : ${studentWithRecords.id}`, 20, yPosition);
  yPosition += 6;
  doc.text(`College         : College Of Education & Liberal Art`, 20, yPosition);
  yPosition += 6;
  doc.text(`Major           : ${studentWithRecords.department.toUpperCase()}`, 20, yPosition);
  yPosition += 15;

  // Group academic records by year, semester, and status
  const groupedRecords = studentWithRecords.academicRecords.reduce((acc, record) => {
    const key = `${record.year}-${record.semester}-${record.status}`;
    if (!acc[key]) {
      acc[key] = {
        year: record.year,
        semester: record.semester,
        status: record.status,
        courses: []
      };
    }
    acc[key].courses.push(...record.courses);
    return acc;
  }, {} as Record<string, { year: string; semester: string; status: string; courses: any[] }>);

  // Academic Records
  Object.values(groupedRecords).forEach((groupedRecord) => {
    if (yPosition > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPosition = 20;
    }

    // Academic Year and Semester header with exact formatting
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    
    // Create bordered header section like in the reference
    doc.setDrawColor(0, 0, 0);
    doc.rect(20, yPosition - 5, pageWidth - 40, 15);
    doc.text(`Academic Year: ${groupedRecord.year}  Semester: ${groupedRecord.semester}`, 25, yPosition + 2);
    yPosition += 15;

    // Table structure exactly like reference image
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    // Draw table border
    const tableStartY = yPosition;
    const tableWidth = pageWidth - 40;
    const cellHeight = 8;
    
    // Headers row with borders
    doc.rect(20, yPosition, 70, cellHeight); // Description
    doc.rect(90, yPosition, 25, cellHeight); // Code
    doc.rect(115, yPosition, 15, cellHeight); // No.
    doc.rect(130, yPosition, 20, cellHeight); // Grade
    doc.rect(150, yPosition, 20, cellHeight); // CrHrs
    doc.rect(170, yPosition, 20, cellHeight); // Points
    
    // Header text
    doc.text('Description', 22, yPosition + 5);
    doc.text('Code', 92, yPosition + 5);
    doc.text('No.', 117, yPosition + 5);
    doc.text('Grade', 132, yPosition + 5);
    doc.text('CrHrs', 152, yPosition + 5);
    doc.text('Points', 172, yPosition + 5);
    yPosition += cellHeight;

    // Course data with exact table formatting
    doc.setFont(undefined, 'normal');
    let totalCredits = 0;
    let totalPoints = 0;

    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    groupedRecord.courses.forEach((course, index) => {
      if (yPosition > doc.internal.pageSize.height - 25) {
        doc.addPage();
        yPosition = 20;
      }

      const points = (gradePoints[course.grade] || 0) * course.credits;
      totalCredits += course.credits;
      totalPoints += points;

      // Draw row borders
      doc.rect(20, yPosition, 70, cellHeight); // Description
      doc.rect(90, yPosition, 25, cellHeight); // Code
      doc.rect(115, yPosition, 15, cellHeight); // No.
      doc.rect(130, yPosition, 20, cellHeight); // Grade
      doc.rect(150, yPosition, 20, cellHeight); // CrHrs
      doc.rect(170, yPosition, 20, cellHeight); // Points

      // Course data text
      doc.text(course.courseName.substring(0, 30), 22, yPosition + 5); // Limit text length
      doc.text(course.courseCode, 92, yPosition + 5);
      doc.text('101', 117, yPosition + 5); // Course number placeholder
      doc.text(course.grade, 135, yPosition + 5);
      doc.text(course.credits.toString(), 157, yPosition + 5);
      doc.text(points.toFixed(2), 175, yPosition + 5);
      yPosition += cellHeight;
    });

    // Totals row with border
    doc.setFont(undefined, 'bold');
    doc.rect(20, yPosition, 130, cellHeight); // Total label area
    doc.rect(150, yPosition, 20, cellHeight); // Total credits
    doc.rect(170, yPosition, 20, cellHeight); // Total points
    
    doc.text('Total Credit Hours:', 22, yPosition + 5);
    doc.text(totalCredits.toString(), 157, yPosition + 5);
    doc.text(totalPoints.toFixed(2), 175, yPosition + 5);
    yPosition += cellHeight + 5;

    // GPA with border
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    doc.rect(20, yPosition, 130, cellHeight);
    doc.rect(170, yPosition, 20, cellHeight);
    doc.text('Grade Point Average:', 22, yPosition + 5);
    doc.text(gpa, 175, yPosition + 5);
    yPosition += 25;
  });

  // Footer
  if (yPosition > doc.internal.pageSize.height - 30) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Dean of Admissions, Records & Registration', pageWidth / 2, yPosition + 20, { align: 'center' });

  // Page number
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Page 1 of 1', pageWidth - 30, doc.internal.pageSize.height - 10);

  // Save file
  const fileName = `${studentWithRecords.fullName.replace(/\s+/g, '_')}_transcript_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};