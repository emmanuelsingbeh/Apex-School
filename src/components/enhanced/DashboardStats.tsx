import { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudentData } from '@/hooks/useStudentData';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  delay?: number;
}

const StatsCard = ({ title, value, icon, trend, delay = 0 }: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayValue(prev => {
          if (prev >= value) {
            clearInterval(interval);
            return value;
          }
          return Math.min(prev + Math.ceil(value / 20), value);
        });
      }, 50);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Card className="hover-lift animate-fade-in shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-academic-navy">{displayValue}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-academic-green" />
                <span className="text-sm text-academic-green">+{trend}%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gradient-academic rounded-xl shadow-glow">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardStats = () => {
  const { students, academicRecords } = useStudentData();

  const totalStudents = students.length;
  const totalRecords = academicRecords.length;
  const departmentStats = students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageGPA = academicRecords.length > 0 
    ? (academicRecords.reduce((sum, record) => {
        const gpa = calculateRecordGPA(record);
        return sum + (isNaN(gpa) ? 0 : gpa);
      }, 0) / academicRecords.length).toFixed(2)
    : '0.00';

  function calculateRecordGPA(record: any) {
    if (!record.courses.length) return 0;
    
    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    record.courses.forEach((course: any) => {
      const points = gradePoints[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          icon={<Users className="h-6 w-6 text-white" />}
          trend={12}
          delay={0}
        />
        <StatsCard
          title="Academic Records"
          value={totalRecords}
          icon={<BookOpen className="h-6 w-6 text-white" />}
          trend={8}
          delay={200}
        />
        <StatsCard
          title="Average GPA"
          value={parseFloat(averageGPA)}
          icon={<GraduationCap className="h-6 w-6 text-white" />}
          trend={5}
          delay={400}
        />
        <StatsCard
          title="Departments"
          value={Object.keys(departmentStats).length}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          delay={600}
        />
      </div>

      {/* Department Distribution */}
      <Card className="animate-slide-up shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-academic-blue" />
            Department Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(departmentStats).map(([dept, count], index) => (
              <div
                key={dept}
                className="p-4 bg-gradient-card rounded-lg border hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-academic-navy">{dept}</h3>
                    <p className="text-sm text-muted-foreground">Department</p>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {count}
                  </Badge>
                </div>
                <div className="mt-3 bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-academic h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(count / totalStudents) * 100}%`,
                      animationDelay: `${index * 200 + 800}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};