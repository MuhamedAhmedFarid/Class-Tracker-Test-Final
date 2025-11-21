import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudents, createStudent } from '../services/studentService';
import { DAYS_OF_WEEK, CreateStudentDTO } from '../types';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Filter } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import StudentForm from '../components/StudentForm';
import { useAppContext } from '../contexts/AppContext';

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const Students: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useAppContext();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDayFilter, setActiveDayFilter] = useState<string | null>(null);
  const [minRateFilter, setMinRateFilter] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
    },
  });

  // Filtering Logic
  const filteredStudents = students?.filter(student => {
    const matchesName = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay = activeDayFilter ? student.days_of_week.includes(activeDayFilter) : true;
    const matchesRate = minRateFilter ? student.hourly_rate > minRateFilter : true;
    return matchesName && matchesDay && matchesRate;
  }) || [];

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError) return <div className="p-6 text-center text-red-500">{t('errorLoading')}</div>;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 pb-24 relative transition-colors duration-300">
      {/* Header & Search */}
      <div className="bg-white dark:bg-gray-800 px-4 pt-8 pb-4 sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('students')}</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-md transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 rtl:left-auto rtl:right-3" size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Horizontal Filters */}
        <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center text-gray-400 dark:text-gray-500 px-2"><Filter size={16} /></div>
          
          {/* Rate Filters */}
          <button 
            onClick={() => setMinRateFilter(minRateFilter === 50 ? null : 50)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              minRateFilter === 50 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
            }`}
          >
            {t('rateFilter50')}
          </button>
          <button 
            onClick={() => setMinRateFilter(minRateFilter === 100 ? null : 100)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              minRateFilter === 100 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
            }`}
          >
             {t('rateFilter100')}
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          {/* Day Filters (Shortened) */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
             const fullDay = DAYS_OF_WEEK[idx === 6 ? 0 : idx + 1]; // Map Mon->Monday
             const isActive = activeDayFilter === fullDay;
             return (
              <button
                key={day}
                onClick={() => setActiveDayFilter(isActive ? null : fullDay)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  isActive ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                }`}
              >
                {t(day)}
              </button>
             );
          })}
        </div>
      </div>

      {/* Student List */}
      <div className="px-4 mt-4 space-y-3">
        {filteredStudents.map((student) => (
          <div 
            key={student.id}
            onClick={() => navigate(`/student/${student.id}`)}
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col cursor-pointer active:scale-[0.99] transition-all group"
          >
             <div className="flex justify-between items-start">
                <div className="flex items-center">
                   <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 mr-3 rtl:mr-0 rtl:ml-3 overflow-hidden">
                      {student.image_url ? (
                        <img src={student.image_url} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{student.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {student.days_of_week.map(d => (
                          <span key={d} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{t(d.slice(0,3))}</span>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{student.hourly_rate.toLocaleString('en-US')} {t('egp')}</span>
                  {student.start_time && <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTime(student.start_time)}</span>}
                </div>
             </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-10 text-sm">{t('noStudentsFound')}</p>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <StudentForm
          title={t('addNewStudent')}
          submitLabel={t('createStudent')}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
};

export default Students;