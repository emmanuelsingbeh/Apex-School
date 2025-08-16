import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types/student';

interface SearchFilters {
  department: string;
  sex: string;
  sortBy: 'name' | 'id' | 'department';
  sortOrder: 'asc' | 'desc';
}

interface EnhancedSearchProps {
  students: Student[];
  onResultsChange: (filteredStudents: Student[]) => void;
  className?: string;
}

export const EnhancedSearch = ({ students, onResultsChange, className }: EnhancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    department: '',
    sex: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const filteredStudents = useMemo(() => {
    let results = students.filter(student => {
      const matchesSearch = 
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.contact.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = !filters.department || student.department === filters.department;
      const matchesSex = !filters.sex || student.sex === filters.sex;

      return matchesSearch && matchesDepartment && matchesSex;
    });

    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return results;
  }, [students, searchQuery, filters]);

  // Update parent component when results change
  useEffect(() => {
    onResultsChange(filteredStudents);
  }, [filteredStudents, onResultsChange]);

  const clearFilters = () => {
    setFilters({
      department: '',
      sex: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'name' && value !== 'asc'
  ).length + (searchQuery ? 1 : 0);

  const departments = [...new Set(students.map(s => s.department))];
  const sexOptions = [...new Set(students.map(s => s.sex))];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <Card className="shadow-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-300 focus:shadow-glow"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative hover-lift"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-bounce-in"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="shadow-card animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-academic-blue" />
                Advanced Filters
              </h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select 
                  value={filters.department} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sex</label>
                <Select 
                  value={filters.sex} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sex: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {sexOptions.map(sex => (
                      <SelectItem key={sex} value={sex}>{sex}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="id">Student ID</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortOrder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredStudents.length} of {students.length} students found
        </span>
        {searchQuery && (
          <span>
            Searching for: <Badge variant="outline">{searchQuery}</Badge>
          </span>
        )}
      </div>
    </div>
  );
};