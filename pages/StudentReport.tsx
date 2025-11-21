import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudentById, processPayment } from '../services/studentService';
import { DAYS_OF_WEEK, ATTENDANCE_KEY_MAP } from '../types';
import { ChevronLeft, ChevronRight, CreditCard, X, CheckCircle2, Coins, Wallet, Calendar as CalendarIcon } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { useAppContext } from '../contexts/AppContext';

const StudentReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useAppContext();
  
  // Local State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [viewDate, setViewDate] = useState(new Date());

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudentById(id!),
    enabled: !!id,
  });

  const payMutation = useMutation({
    mutationFn: (amount: number) => processPayment(id!, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Refresh list for reports
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Refresh financial transaction history
      setIsPayModalOpen(false);
      setPaymentAmount('');
    },
  });

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError || !student) return <div className="p-6 text-center text-red-500">{t('errorLoading')}</div>;

  // --- Financial Calculations ---
  let currentCycleAttended = 0;
  DAYS_OF_WEEK.forEach(day => {
    if (student[ATTENDANCE_KEY_MAP[day]]) currentCycleAttended++;
  });
  const cycleCost = currentCycleAttended * student.hourly_rate;
  // Due = (Cycle Cost - Cycle Paid) + Outstanding
  const remainingDue = Math.max(0, (cycleCost - (student.paid_amount || 0)) + (student.outstanding_balance || 0));

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    payMutation.mutate(amount);
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday" for logic check
      const isScheduled = student.days_of_week.includes(dayName);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
         <div key={day} className="flex flex-col items-center justify-center h-10 w-10 mb-1">
            <div className={`
              h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold relative transition-colors
              ${isToday ? 'bg-emerald-600 text-white shadow-md' : ''}
              ${!isToday && isScheduled ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : ''}
              ${!isToday && !isScheduled ? 'text-gray-600 dark:text-gray-400' : ''}
            `}>
              {/* Always display English numbers */}
              {day}
            </div>
            {isScheduled && !isToday && (
              <div className="h-1 w-1 bg-emerald-400 rounded-full mt-0.5"></div>
            )}
         </div>
      );
    }
    return days;
  };

  // Use 'ar-EG-u-nu-latn' to get Arabic text but Latin (English) numerals
  const monthName = viewDate.toLocaleDateString(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { month: 'long' });
  const yearNum = viewDate.toLocaleDateString(language === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors duration-300">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-700 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate('/reports')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft size={24} className="rtl:rotate-180" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 dark:text-white">{student.name}</h1>
        <div className="w-8"></div>
      </div>

      <div className="px-4 py-6 space-y-6">
        
        {/* Financial Dashboard Card */}
        <div className="bg-gray-900 dark:bg-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-gray-800 dark:border-gray-800">
           {/* Background Effect */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

           <div className="relative z-10 flex flex-col h-full">
              {/* Top Row: Total Generated & Paid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Coins size={14} className="text-emerald-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('cycleCost')}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{cycleCost.toLocaleString('en-US')} <span className="text-xs font-normal opacity-60">{t('egp')}</span></p>
                  <p className="text-[10px] text-emerald-200/70 mt-1">{currentCycleAttended.toLocaleString('en-US')} {t('classesWeek')}</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                   <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Wallet size={14} className="text-blue-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('outstanding')}</span>
                  </div>
                  <p className="text-xl font-bold text-blue-300">{student.outstanding_balance?.toLocaleString('en-US') || 0} <span className="text-xs font-normal text-white opacity-60">{t('egp')}</span></p>
                  <p className="text-[10px] text-blue-200/70 mt-1">{t('carriedOver')}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-700 w-full mb-5"></div>

              {/* Bottom Row: Remaining & Action */}
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('totalDue')}</p>
                    <p className="text-4xl font-bold text-emerald-400">{remainingDue.toLocaleString('en-US')} <span className="text-lg text-white font-normal">{t('egp')}</span></p>
                 </div>

                 <button 
                  onClick={() => {
                    setPaymentAmount(remainingDue.toString());
                    setIsPayModalOpen(true);
                  }}
                  disabled={remainingDue === 0}
                  className={`px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                     remainingDue === 0 
                       ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                       : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {remainingDue === 0 ? t('settled') : t('pay')}
                  {remainingDue === 0 ? <CheckCircle2 size={16} /> : <CreditCard size={16} />}
                </button>
              </div>
           </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon size={20} className="text-emerald-600 dark:text-emerald-400" />
              {t('schedule')}
            </h2>
            
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-full p-1">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full shadow-sm transition-all text-gray-500 dark:text-gray-300">
                <ChevronLeft size={16} className="rtl:rotate-180" />
              </button>
              <span className="text-sm font-bold text-gray-700 dark:text-white w-28 text-center">
                {monthName} {yearNum}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full shadow-sm transition-all text-gray-500 dark:text-gray-300">
                <ChevronRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => {
               // Map index to short day names starting from Sunday
               const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
               return (
                  <div key={i} className="text-xs font-bold text-gray-400 dark:text-gray-500 py-2">
                     {t(daysShort[i]).charAt(0)}
                  </div>
               )
            })}
          </div>
          
          <div className="grid grid-cols-7 gap-y-1 place-items-center">
            {renderCalendarDays()}
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 mt-6 justify-center">
             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-3 h-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full border border-emerald-200 dark:border-emerald-800"></div>
                <span>{t('scheduledDay')}</span>
             </div>
             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                <span>{t('today')}</span>
             </div>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out] border border-gray-100 dark:border-gray-700">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('recordPayment')}</h2>
               <button onClick={() => setIsPayModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                 <X size={24} />
               </button>
             </div>

             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl mb-6 flex flex-col items-center border border-gray-100 dark:border-gray-600">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-1">{t('remainingDue')}</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{remainingDue.toLocaleString('en-US')} {t('egp')}</span>
             </div>

             <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('receivedAmount')}</label>
                  <div className="relative">
                     <input 
                       type="number" 
                       value={paymentAmount}
                       onChange={(e) => setPaymentAmount(e.target.value)}
                       placeholder="0.00"
                       autoFocus
                       className="w-full text-lg font-bold border border-gray-200 dark:border-gray-700 rounded-xl p-4 pl-4 pr-12 rtl:pr-4 rtl:pl-12 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-gray-400 dark:placeholder-gray-600"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold text-sm rtl:right-auto rtl:left-4">{t('egp')}</span>
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2">
                   <button 
                     type="button"
                     onClick={() => setPaymentAmount((remainingDue / 2).toString())}
                     className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                   >
                     50%
                   </button>
                   <button 
                     type="button"
                     onClick={() => setPaymentAmount(remainingDue.toString())}
                     className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                   >
                     {t('fullAmount')}
                   </button>
                </div>

                <button
                  type="submit"
                  disabled={payMutation.isPending || !paymentAmount}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl mt-2 hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {payMutation.isPending ? <Spinner /> : (
                    <>
                      <CreditCard size={20} />
                      {t('confirmPayment')}
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;