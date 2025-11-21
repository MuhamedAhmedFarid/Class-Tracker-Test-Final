import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents } from '../services/studentService';
import { DAYS_OF_WEEK } from '../types';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, User, Clock, Settings } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { useAppContext } from '../contexts/AppContext';

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  
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

  // Use 'ar-EG-u-nu-latn' for Arabic with Latin numerals, or 'en-US' for English
  const locale = language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';
  
  const currentDateStr = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError) return <div className="p-6 text-center text-red-500">{t('errorLoading')}</div>;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 px-6 pt-12 pb-6 rounded-b-3xl shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('todaysClasses')}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium">{currentDateStr}</p>
        <div className="mt-6 flex space-x-4 rtl:space-x-reverse">
           <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl flex-1">
              <p className="text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">{t('totalStudents')}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{sortedStudents.length.toLocaleString('en-US')}</p>
           </div>
           <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl flex-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{t('pending')}</p>
              <p className="text-2xl font-bold text-gray-400 dark:text-gray-500 mt-1">-</p>
           </div>
        </div>
      </header>

      {/* List */}
      <div className="px-4 mt-6 pb-4">
        {sortedStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4 transition-colors">
              <Calendar size={32} />
            </div>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">{t('noClasses')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('enjoyDayOff')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStudents.map((student) => (
              <div 
                key={student.id}
                onClick={() => navigate(`/student/${student.id}`)}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center active:scale-[0.98] transition-all duration-150 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden mr-4 rtl:mr-0 rtl:ml-4 border border-gray-200 dark:border-gray-600">
                  {student.image_url ? (
                    <img src={student.image_url} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{student.name}</h3>
                  
                  <div className="flex items-center gap-3 mt-1">
                    {/* Time Display */}
                    {student.start_time ? (
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md text-xs font-bold">
                        <Clock size={12} className="mr-1 rtl:ml-1 rtl:mr-0" />
                        {formatTime(student.start_time)}
                        {student.end_time ? ` - ${formatTime(student.end_time)}` : ''}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">{t('noTimeSet')}</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 rtl:rotate-180" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;