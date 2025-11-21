import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents, fetchPayments } from '../services/studentService';
import { ATTENDANCE_KEY_MAP, DAYS_OF_WEEK } from '../types';
import { ChevronLeft, Wallet, AlertCircle, Calendar, Coins, CheckCircle2, User, X } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { useAppContext } from '../contexts/AppContext';

type DateFilter = 'current_month' | 'last_month' | 'all_time' | 'custom';

const FinancialDetails: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useAppContext();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'due' ? 'due' : 'collected';
  
  const [activeTab, setActiveTab] = useState<'collected' | 'due'>(initialTab);
  const [dateFilter, setDateFilter] = useState<DateFilter>('current_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Data
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  // --- Logic for Collected View ---
  const { filteredPayments, totalCollectedPeriod } = useMemo(() => {
    if (!payments) return { filteredPayments: [], totalCollectedPeriod: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Determine start/end dates for filters
    const filtered = payments.filter(p => {
      const pDate = new Date(p.date);
      pDate.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'all_time') return true;
      
      if (dateFilter === 'current_month') {
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      }
      
      if (dateFilter === 'last_month') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return pDate.getMonth() === lastMonthDate.getMonth() && pDate.getFullYear() === lastMonthDate.getFullYear();
      }

      if (dateFilter === 'custom') {
        if (!startDate) return true; // Show all if only custom selected but no date
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(); // Default end to today if missing
        end.setHours(23, 59, 59, 999);
        
        return pDate >= start && pDate <= end;
      }
      
      return true;
    });

    // Sort descending by date
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = filtered.reduce((sum, p) => sum + p.amount, 0);
    return { filteredPayments: filtered, totalCollectedPeriod: total };
  }, [payments, dateFilter, startDate, endDate]);

  // --- Logic for Due View ---
  const { studentsWithDue, totalDue } = useMemo(() => {
    if (!students) return { studentsWithDue: [], totalDue: 0 };

    let sumDue = 0;
    const list = students.map(s => {
      let attendedCount = 0;
      DAYS_OF_WEEK.forEach(day => {
        if (s[ATTENDANCE_KEY_MAP[day]]) attendedCount++;
      });
      const cost = attendedCount * s.hourly_rate;
      // Due = (Cost - Paid) + Outstanding
      const due = Math.max(0, (cost - (s.paid_amount || 0)) + (s.outstanding_balance || 0));
      sumDue += due;
      return { ...s, due };
    })
    .filter(s => s.due > 0)
    .sort((a, b) => b.due - a.due);

    return { studentsWithDue: list, totalDue: sumDue };
  }, [students]);

  const locale = language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';

  if (loadingPayments || loadingStudents) return <div className="pt-12"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 sticky top-0 z-10 px-4 py-4 flex items-center justify-between shadow-sm border-b border-gray-100 dark:border-gray-700">
        <button onClick={() => navigate('/reports')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft size={24} className="rtl:rotate-180" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 dark:text-white">{t('financials')}</h1>
        <div className="w-8"></div>
      </div>

      <div className="p-4">
        {/* Tabs */}
        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('collected')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2 ${
              activeTab === 'collected' 
                ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Wallet size={16} />
            {t('collected')}
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2 ${
              activeTab === 'due' 
                ? 'bg-white dark:bg-gray-600 text-rose-500 dark:text-rose-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <AlertCircle size={16} />
            {t('due')}
          </button>
        </div>

        {/* CONTENT: COLLECTED */}
        {activeTab === 'collected' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Date Filters */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'current_month', label: t('currentMonth') },
                  { id: 'last_month', label: t('lastMonth') },
                  { id: 'all_time', label: t('allTime') },
                  { id: 'custom', label: t('customRange') },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setDateFilter(filter.id as DateFilter)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
                      dateFilter === filter.id 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              
              {/* Custom Date Inputs */}
              {dateFilter === 'custom' && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-3 items-center animate-[slideDown_0.2s_ease-out]">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">{t('startDate')}</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium text-gray-700 dark:text-white outline-none focus:border-emerald-500 transition-colors dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">{t('endDate')}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs font-medium text-gray-700 dark:text-white outline-none focus:border-emerald-500 transition-colors dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-emerald-600 dark:bg-emerald-700 rounded-3xl p-6 text-white mb-6 shadow-lg transition-colors">
              <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
                {t('totalCollected')}
              </p>
              <p className="text-3xl font-bold">{totalCollectedPeriod.toLocaleString('en-US')} <span className="text-sm font-normal opacity-70">{t('egp')}</span></p>
            </div>

            {/* Transaction List */}
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              {t('transactionHistory')}
            </h3>
            <div className="space-y-3 pb-10">
              {filteredPayments.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">{t('noPaymentsPeriod')}</p>
              ) : (
                filteredPayments.map((payment) => {
                  const studentName = payment.student_name || students?.find(s => s.id === payment.student_id)?.name || t('unknownStudent');
                  return (
                    <div key={payment.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Coins size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{studentName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(payment.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+{payment.amount.toLocaleString('en-US')} {t('egp')}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CONTENT: DUE */}
        {activeTab === 'due' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
             {/* Summary Card */}
            <div className="bg-rose-500 dark:bg-rose-600 rounded-3xl p-6 text-white mb-6 shadow-lg transition-colors">
              <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
                {t('totalDue')}
              </p>
              <p className="text-3xl font-bold">{totalDue.toLocaleString('en-US')} <span className="text-sm font-normal opacity-70">{t('egp')}</span></p>
            </div>

             <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              {t('studentsWithDue')}
            </h3>
            <div className="space-y-3 pb-10">
              {studentsWithDue.length === 0 ? (
                <div className="text-center py-10">
                   <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-3">
                     <CheckCircle2 size={32} />
                   </div>
                   <p className="text-gray-900 dark:text-white font-bold">{t('allSettled')}</p>
                   <p className="text-sm text-gray-400 mt-1">{t('noOutstanding')}</p>
                </div>
              ) : (
                studentsWithDue.map((student) => (
                  <div 
                    key={student.id} 
                    onClick={() => navigate(`/reports/student/${student.id}`)}
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all"
                  >
                     <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
                         <AlertCircle size={20} />
                      </div>
                      <div>
                         <p className="font-bold text-gray-900 dark:text-white text-sm">{student.name}</p>
                         <p className="text-xs text-gray-400">{t('rate')}: {student.hourly_rate.toLocaleString('en-US')} {t('egp')}</p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-500 dark:text-rose-400">{student.due.toLocaleString('en-US')} {t('egp')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FinancialDetails;