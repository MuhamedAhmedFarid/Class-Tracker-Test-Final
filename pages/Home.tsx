
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents } from '../services/studentService';
import { DAYS_OF_WEEK, Student } from '../types';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, User, Clock } from 'lucide-react';
import { Spinner } from '../components/Spinner';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  // Get current day index (0-6) and map to DayOfWeek string
  const todayIndex = new Date().getDay();
  const todayName = DAYS_OF_WEEK[todayIndex];

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  // Filter students for today
  const todaysStudents = students?.filter(student => 
    student.days_of_week.includes(todayName)
  ) || [];

  // Sort by Start Time if available, otherwise Name
  const sortedStudents = [...todaysStudents].sort((a, b) => {
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time);
    }
    return a.name.localeCompare(b.name);
  });

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError) return <div className="p-6 text-center text-red-500">Failed to load students.</div>;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Today's Classes</h1>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
             <Calendar size={20} className="text-emerald-600" />
          </div>
        </div>
        <p className="text-emerald-600 font-medium">{currentDateStr}</p>
        <div className="mt-6 flex space-x-4">
           <div className="bg-emerald-50 p-3 rounded-2xl flex-1">
              <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{sortedStudents.length}</p>
           </div>
           <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl flex-1">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">-</p>
           </div>
        </div>
      </header>

      {/* List */}
      <div className="px-4 mt-6 pb-4">
        {sortedStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Calendar size={32} />
            </div>
            <p className="text-lg font-medium text-gray-500">No Classes Today</p>
            <p className="text-sm text-gray-400 mt-1">Enjoy your day off!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStudents.map((student) => (
              <div 
                key={student.id}
                onClick={() => navigate(`/student/${student.id}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center active:scale-[0.98] transition-transform duration-150 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden mr-4 border border-gray-200">
                  {student.image_url ? (
                    <img src={student.image_url} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">{student.name}</h3>
                  
                  <div className="flex items-center gap-3 mt-1">
                    {/* Time Display */}
                    {student.start_time ? (
                      <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-bold">
                        <Clock size={12} className="mr-1" />
                        {student.start_time}
                        {student.end_time ? ` - ${student.end_time}` : ''}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No time set</span>
                    )}
                    
                    {/* Rate Display (Optional here, but kept for completeness) */}
                    {/* <span className="text-xs text-gray-500">{student.hourly_rate} EGP/hr</span> */}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
