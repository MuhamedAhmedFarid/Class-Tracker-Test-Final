
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudentById, processPayment } from '../services/studentService';
import { DAYS_OF_WEEK, ATTENDANCE_KEY_MAP, Student } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, CreditCard, X, CheckCircle2, Coins, Wallet } from 'lucide-react';
import { Spinner } from '../components/Spinner';

const StudentReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Local State
  const [viewDate, setViewDate] = useState(new Date());
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

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
      setIsPayModalOpen(false);
      setPaymentAmount('');
    },
  });

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError || !student) return <div className="p-6 text-center text-red-500">Student not found.</div>;

  // --- Calendar Logic ---
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // --- Financial Calculations ---
  
  // 1. Total Cost of Attendance (Current Cycle)
  let currentCycleAttended = 0;
  DAYS_OF_WEEK.forEach(day => {
    if (student[ATTENDANCE_KEY_MAP[day]]) currentCycleAttended++;
  });
  const totalCost = currentCycleAttended * student.hourly_rate;
  
  // 2. Remaining Due
  const remainingDue = Math.max(0, totalCost - (student.paid_amount || 0));

  // 3. Projected Revenue for the VIEWED Month
  let scheduledDaysInViewedMonth = 0;
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dayName = DAYS_OF_WEEK[d.getDay()];
    if (student.days_of_week.includes(dayName)) {
      scheduledDaysInViewedMonth++;
    }
  }
  const projectedMonthlyRevenue = scheduledDaysInViewedMonth * student.hourly_rate;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    payMutation.mutate(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navigation Header */}
      <div className="bg-white sticky top-0 z-20 border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-gray-900">{student.name}</h1>
        <div className="w-8"></div>
      </div>

      <div className="px-4 py-6 space-y-6">
        
        {/* Financial Dashboard Card */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
           {/* Background Effect */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

           <div className="relative z-10 flex flex-col h-full">
              
              {/* Top Row: Total Generated & Paid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Coins size={14} className="text-emerald-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Cycle Cost</span>
                  </div>
                  <p className="text-xl font-bold text-white">{totalCost.toLocaleString()} <span className="text-xs font-normal opacity-60">EGP</span></p>
                </div>

                <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                   <div className="flex items-center gap-2 mb-1 opacity-60">
                    <Wallet size={14} className="text-blue-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Actually Paid</span>
                  </div>
                  <p className="text-xl font-bold text-blue-300">{student.paid_amount?.toLocaleString() || 0} <span className="text-xs font-normal text-white opacity-60">EGP</span></p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-700 w-full mb-5"></div>

              {/* Bottom Row: Remaining & Action */}
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Remaining Balance</p>
                    <p className="text-4xl font-bold text-emerald-400">{remainingDue.toLocaleString()} <span className="text-lg text-white font-normal">EGP</span></p>
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
                  {remainingDue === 0 ? 'Settled' : 'Record Payment'}
                  {remainingDue === 0 ? <CheckCircle2 size={16} /> : <CreditCard size={16} />}
                </button>
              </div>
           </div>
        </div>

        {/* Calendar Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Schedule</h2>
            {/* Projected for Month Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <TrendingUp size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">
                Est. {projectedMonthlyRevenue.toLocaleString()} EGP
              </span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-gray-900 font-bold text-base uppercase tracking-wide">
                {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-gray-400">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Actual Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const date = new Date(year, month, dayNum);
                const today = new Date();
                
                // Reset hours for accurate comparison
                today.setHours(0,0,0,0);
                const compareDate = new Date(date);
                compareDate.setHours(0,0,0,0);

                const dayName = DAYS_OF_WEEK[date.getDay()];
                const isScheduled = student.days_of_week.includes(dayName);
                const isToday = compareDate.getTime() === today.getTime();
                const isPast = compareDate < today;
                
                return (
                  <div 
                    key={dayNum} 
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-xs font-bold relative transition-all
                      ${isToday ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}
                      ${isScheduled 
                        ? isPast 
                          ? 'bg-emerald-100 text-emerald-700' // Past scheduled
                          : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' // Future scheduled
                        : 'text-gray-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    {dayNum}
                    {isScheduled && !isPast && (
                      <div className="absolute bottom-1 w-1 h-1 bg-white/50 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
               <button onClick={() => setIsPayModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={24} />
               </button>
             </div>

             <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex flex-col items-center border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining Due</span>
                <span className="text-3xl font-bold text-gray-900">{remainingDue.toLocaleString()} EGP</span>
             </div>

             <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Received Amount</label>
                  <div className="relative">
                     <input 
                       type="number" 
                       value={paymentAmount}
                       onChange={(e) => setPaymentAmount(e.target.value)}
                       placeholder="0.00"
                       autoFocus
                       className="w-full text-lg font-bold border border-gray-200 rounded-xl p-4 pl-4 pr-12 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">EGP</span>
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2">
                   <button 
                     type="button"
                     onClick={() => setPaymentAmount((remainingDue / 2).toString())}
                     className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors"
                   >
                     Pay 50%
                   </button>
                   <button 
                     type="button"
                     onClick={() => setPaymentAmount(remainingDue.toString())}
                     className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors"
                   >
                     Pay Full
                   </button>
                </div>

                <button
                  type="submit"
                  disabled={payMutation.isPending || !paymentAmount}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl mt-2 hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
                >
                  {payMutation.isPending ? <Spinner /> : (
                    <>
                      <CreditCard size={20} />
                      Confirm Payment
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
