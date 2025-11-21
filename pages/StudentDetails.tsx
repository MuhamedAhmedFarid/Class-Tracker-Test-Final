import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudentById, updateStudentAttendance, updateStudentDetails, deleteStudent } from '../services/studentService';
import { ATTENDANCE_KEY_MAP, DayOfWeek, Student, CreateStudentDTO } from '../types';
import { ChevronLeft, Save, User, CalendarCheck, Coins, Pencil, AlertCircle } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import StudentForm from '../components/StudentForm';
import { useAppContext } from '../contexts/AppContext';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useAppContext();

  // Local state
  const [attendanceState, setAttendanceState] = useState<Partial<Record<keyof Student, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudentById(id!),
    enabled: !!id,
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: (updates: Partial<Record<keyof Student, boolean>>) => 
      updateStudentAttendance(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setHasChanges(false);
    },
  });

  const updateDetailsMutation = useMutation({
    mutationFn: (data: CreateStudentDTO) => updateStudentDetails(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      navigate('/students', { replace: true });
    }
  });

  // Sync local state with fetched data
  useEffect(() => {
    if (student) {
      const initialState: Partial<Record<keyof Student, boolean>> = {};
      student.days_of_week.forEach((day) => {
        const key = ATTENDANCE_KEY_MAP[day as DayOfWeek];
        if (key) {
          initialState[key] = student[key] as boolean;
        }
      });
      // Also check keys for days that might have been removed from schedule but still have attendance
      Object.values(ATTENDANCE_KEY_MAP).forEach(key => {
         if (student[key] === true) initialState[key] = true;
      });
      
      setAttendanceState(initialState);
    }
  }, [student]);

  const handleToggle = (key: keyof Student, value: boolean) => {
    setAttendanceState(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateAttendanceMutation.mutate(attendanceState);
  };

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError || !student) return <div className="p-6 text-center text-red-500">{t('errorLoading')}</div>;

  // Calculate Total Due
  let attendedCount = 0;
  Object.entries(attendanceState).forEach(([key, value]) => {
    if (value === true) attendedCount++;
  });
  const currentCycleCost = attendedCount * student.hourly_rate;
  // Total Due = Current Cycle Cost - Paid this cycle + Outstanding from previous
  const totalDue = Math.max(0, (currentCycleCost - (student.paid_amount || 0)) + (student.outstanding_balance || 0));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
      {/* Top Navigation */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white pt-8 pb-16 px-4 rounded-b-[2.5rem] shadow-lg relative transition-colors">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
            <ChevronLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-lg font-semibold">{t('studentDetails')}</h1>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
            <Pencil size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full p-1 mb-3 shadow-md">
            <div className="w-full h-full rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center overflow-hidden">
               {student.image_url ? (
                 <img src={student.image_url} className="w-full h-full object-cover" />
               ) : (
                 <User size={40} className="text-emerald-600 dark:text-emerald-400" />
               )}
            </div>
          </div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <div className="flex gap-2 mt-2 opacity-90">
            {student.days_of_week.map(day => (
               <span key={day} className="text-xs bg-emerald-700/50 px-2 py-1 rounded text-white border border-emerald-500/30">
                 {t(day.slice(0,3))}
               </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 flex justify-between items-center border border-gray-100 dark:border-gray-700 transition-colors">
           <div>
             <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t('totalDue')}</p>
             <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalDue.toLocaleString('en-US')} <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">{t('egp')}</span></p>
             
             {(student.outstanding_balance || 0) > 0 && (
               <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 text-xs mt-1 font-medium">
                 <AlertCircle size={12} />
                 <span>{t('includesPastDue')}</span>
               </div>
             )}
           </div>
           <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
             <Coins size={24} />
           </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
            {t('attendance')}
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded">{t('currentWeek')}</span>
        </div>

        <div className="space-y-4">
          {student.days_of_week.map((day) => {
             const dayKey = ATTENDANCE_KEY_MAP[day as DayOfWeek];
             if (!dayKey) return null;
             
             const isAttended = attendanceState[dayKey] === true;

             return (
               <div key={day} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center transition-colors">
                 <span className="font-medium text-gray-700 dark:text-gray-200">{t(day)}</span>
                 
                 <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                   <button
                     onClick={() => handleToggle(dayKey, true)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                       isAttended 
                         ? 'bg-emerald-500 text-white shadow-md' 
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                     }`}
                   >
                     {t('present')}
                   </button>
                   <button
                     onClick={() => handleToggle(dayKey, false)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                       !isAttended 
                         ? 'bg-rose-500 text-white shadow-md' 
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                     }`}
                   >
                     {t('absent')}
                   </button>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Floating Save Button */}
      <div className={`fixed bottom-6 left-4 right-4 transition-transform duration-300 ${hasChanges ? 'translate-y-0' : 'translate-y-24'}`}>
        <button
          onClick={handleSave}
          disabled={updateAttendanceMutation.isPending}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl shadow-xl flex justify-center items-center gap-3 hover:bg-black dark:hover:bg-gray-100 transition-colors"
        >
          {updateAttendanceMutation.isPending ? (
            <Spinner />
          ) : (
            <>
              <Save size={20} />
              {t('saveChanges')}
            </>
          )}
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <StudentForm
          title={t('editStudent')}
          submitLabel={t('updateStudent')}
          initialData={student}
          onSubmit={(data) => updateDetailsMutation.mutate(data)}
          onDelete={() => deleteMutation.mutate()}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={updateDetailsMutation.isPending || deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default StudentDetails;