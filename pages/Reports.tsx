
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents } from '../services/studentService';
import { DAYS_OF_WEEK, ATTENDANCE_KEY_MAP, Student } from '../types';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { Search, User, ChevronRight, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  // Helper to calculate amount due for a single student
  const calculateDue = (student: Student) => {
    let attendedCount = 0;
    DAYS_OF_WEEK.forEach(day => {
      const key = ATTENDANCE_KEY_MAP[day];
      if (student[key]) attendedCount++;
    });
    const totalCost = attendedCount * student.hourly_rate;
    const due = totalCost - (student.paid_amount || 0);
    return Math.max(0, due); // Ensure no negative due logic in UI
  };

  const { filteredStudents, totalOutstanding } = useMemo(() => {
    if (!students) return { filteredStudents: [], totalOutstanding: 0 };

    let total = 0;
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(student => {
      const due = calculateDue(student);
      total += due;
      return { ...student, due };
    }).sort((a, b) => b.due - a.due); // Sort by highest debt

    return { filteredStudents: filtered, totalOutstanding: total };
  }, [students, searchQuery]);

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError) return <div className="p-6 text-center text-red-500">Failed to load data.</div>;

  return (
    <div className="min-h-full bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-emerald-600 px-6 pt-10 pb-8 rounded-b-[2.5rem] shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
          <DollarSign className="text-emerald-200" />
          Financial Reports
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Outstanding</p>
          <p className="text-4xl font-bold">{totalOutstanding.toLocaleString()} <span className="text-lg font-normal opacity-80">EGP</span></p>
          <p className="text-xs text-emerald-100 mt-2 opacity-80">Total due from {students?.length} students</p>
        </div>
      </div>

      {/* Search & List */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm mb-4 flex items-center px-4 py-3 border border-gray-100">
          <Search size={18} className="text-gray-400 mr-3" />
          <input 
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div 
              key={student.id}
              onClick={() => navigate(`/reports/student/${student.id}`)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden">
                  {student.image_url ? (
                    <img src={student.image_url} className="w-full h-full object-cover" alt={student.name} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{student.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={10} />
                    {student.days_of_week.length} classes/week
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  {student.due > 0 ? (
                     <>
                      <p className="font-bold text-gray-900">{student.due.toLocaleString()} EGP</p>
                      <p className="text-[10px] text-rose-500 font-bold uppercase">Due</p>
                     </>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                        Paid <CheckCircle2 size={12} />
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </div>
          ))}
          
          {filteredStudents.length === 0 && (
             <div className="text-center py-10 text-gray-400">
               <p>No students found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
