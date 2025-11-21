import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents } from '../services/studentService';
import { DAYS_OF_WEEK, ATTENDANCE_KEY_MAP } from '../types';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { Search, User, ChevronRight, DollarSign, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const { filteredStudents, totalOutstanding, totalLifetimeCollected } = useMemo(() => {
    if (!students) return { filteredStudents: [], totalOutstanding: 0, totalLifetimeCollected: 0 };

    let totalDueSum = 0;
    let totalCollectedSum = 0;

    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(student => {
      // Calculate exact attendance count based strictly on boolean flags (days attended only)
      let attendedCount = 0;
      DAYS_OF_WEEK.forEach(day => {
        const key = ATTENDANCE_KEY_MAP[day];
        if (student[key] === true) {
          attendedCount++;
        }
      });
      
      const currentCycleCost = attendedCount * student.hourly_rate;
      const paid = student.paid_amount || 0;
      const outstanding = student.outstanding_balance || 0;
      
      // Due = (Current Cost - Current Paid) + Outstanding Balance
      const due = Math.max(0, (currentCycleCost - paid) + outstanding);
      
      totalDueSum += due;
      totalCollectedSum += (student.total_collected || 0);
      
      // Return student with calculated fields for display
      return { ...student, due, paid, currentCycleCost, attendedCount };
    }).sort((a, b) => b.due - a.due); // Sort by highest debt first

    return { filteredStudents: filtered, totalOutstanding: totalDueSum, totalLifetimeCollected: totalCollectedSum };
  }, [students, searchQuery]);

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError) return <div className="p-6 text-center text-red-500">{t('errorLoading')}</div>;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="bg-emerald-600 dark:bg-emerald-700 px-6 pt-10 pb-8 rounded-b-[2.5rem] shadow-lg transition-colors">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
          <DollarSign className="text-emerald-200" />
          {t('financials')}
        </h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/reports/financials?tab=collected')}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white flex flex-col justify-between hover:bg-white/20 transition-colors text-left"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <Wallet size={14} className="text-emerald-300" />
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">{t('lifetimeCollected')}</p>
              </div>
              <p className="text-2xl font-bold">{totalLifetimeCollected.toLocaleString('en-US')}</p>
            </div>
            <div className="flex items-center justify-between mt-2 opacity-60">
              <p className="text-[10px]">{t('tapDetails')}</p>
              <ChevronRight size={12} className="rtl:rotate-180" />
            </div>
          </button>

          <button 
            onClick={() => navigate('/reports/financials?tab=due')}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white flex flex-col justify-between hover:bg-white/20 transition-colors text-left"
          >
             <div>
               <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <AlertCircle size={14} className="text-rose-300" />
                <p className="text-rose-100 text-[10px] font-bold uppercase tracking-wider">{t('totalDue')}</p>
              </div>
              <p className="text-2xl font-bold">{totalOutstanding.toLocaleString('en-US')}</p>
             </div>
             <div className="flex items-center justify-between mt-2 opacity-60">
              <p className="text-[10px]">{t('tapDetails')}</p>
              <ChevronRight size={12} className="rtl:rotate-180" />
            </div>
          </button>
        </div>
      </div>

      {/* Search & List */}
      <div className="px-4 -mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 flex items-center px-4 py-3 border border-gray-100 dark:border-gray-700 transition-colors">
          <Search size={18} className="text-gray-400 dark:text-gray-500 mr-3 rtl:ml-3 rtl:mr-0" />
          <input 
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          />
        </div>

        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div 
              key={student.id}
              onClick={() => navigate(`/reports/student/${student.id}`)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
            >
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 overflow-hidden shrink-0">
                  {student.image_url ? (
                    <img src={student.image_url} className="w-full h-full object-cover" alt={student.name} />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">{student.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {student.attendedCount.toLocaleString('en-US')} {t('classesWeek')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Financials */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end text-right">
                  {/* Due Amount */}
                  {student.due > 0 ? (
                     <div className="mb-0.5">
                      <p className="font-bold text-gray-900 dark:text-white leading-none">
                        {student.due.toLocaleString('en-US')} <span className="text-[10px] font-normal text-gray-400">{t('egp')}</span>
                      </p>
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide">{t('due')}</p>
                     </div>
                  ) : (
                    <div className="mb-0.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                       <span className="text-sm font-bold">{t('settled')}</span>
                       <CheckCircle2 size={14} />
                    </div>
                  )}
                  
                  {/* Paid Amount Display */}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    Life: {student.total_collected?.toLocaleString('en-US') || 0}
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 rtl:rotate-180" />
              </div>
            </div>
          ))}
          
          {filteredStudents.length === 0 && (
             <div className="text-center py-10 text-gray-400 dark:text-gray-500">
               <p>{t('noStudentsFound')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;