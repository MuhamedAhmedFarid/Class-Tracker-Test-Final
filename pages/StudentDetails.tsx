
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudentById, updateStudentAttendance } from '../services/studentService';
import { ATTENDANCE_KEY_MAP, DayOfWeek, Student } from '../types';
import { ChevronLeft, Save, User, CalendarCheck, Coins } from 'lucide-react';
import { Spinner } from '../components/Spinner';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state to manage toggles before saving
  const [attendanceState, setAttendanceState] = useState<Partial<Record<keyof Student, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => fetchStudentById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Record<keyof Student, boolean>>) => 
      updateStudentAttendance(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      setHasChanges(false);
    },
  });

  // Sync local state with fetched data
  useEffect(() => {
    if (student) {
      const initialState: Partial<Record<keyof Student, boolean>> = {};
      student.days_of_week.forEach((day) => {
        const key = ATTENDANCE_KEY_MAP[day as DayOfWeek];
        if (key) {
          initialState[key] = student[key];
        }
      });
      setAttendanceState(initialState);
    }
  }, [student]);

  const handleToggle = (key: keyof Student, value: boolean) => {
    setAttendanceState(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(attendanceState);
  };

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError || !student) return <div className="p-6 text-center text-red-500">Student not found.</div>;

  // Calculate Total Due
  let attendedCount = 0;
  Object.entries(attendanceState).forEach(([key, value]) => {
    // Only count if it's in the student's schedule logic (though strict schema implies we check specific columns)
    if (value === true) attendedCount++;
  });
  const totalCost = attendedCount * student.hourly_rate;
  // Subtract paid amount, but don't go below zero visually here since we are editing state
  const totalDue = Math.max(0, totalCost - (student.paid_amount || 0));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Navigation */}
      <div className="bg-emerald-600 text-white pt-8 pb-16 px-4 rounded-b-[2.5rem] shadow-lg relative">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Student Details</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full p-1 mb-3 shadow-md">
            <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
               {student.image_url ? (
                 <img src={student.image_url} className="w-full h-full object-cover" />
               ) : (
                 <User size={40} className="text-emerald-600" />
               )}
            </div>
          </div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <div className="flex gap-2 mt-2 opacity-90">
            {student.days_of_week.map(day => (
               <span key={day} className="text-xs bg-emerald-700/50 px-2 py-1 rounded text-white border border-emerald-500/30">
                 {day.slice(0,3)}
               </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm p-6 flex justify-between items-center border border-gray-100">
           <div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Balance</p>
             <p className="text-3xl font-bold text-gray-900 mt-1">{totalDue.toLocaleString()} <span className="text-sm text-gray-400 font-normal">EGP</span></p>
             {student.paid_amount > 0 && (
               <p className="text-xs text-emerald-600 mt-1 font-medium">
                 (Paid: {student.paid_amount} EGP)
               </p>
             )}
           </div>
           <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
             <Coins size={24} />
           </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck size={20} className="text-emerald-600" />
            Attendance
          </h3>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Current Cycle</span>
        </div>

        <div className="space-y-4">
          {student.days_of_week.map((day) => {
             const dayKey = ATTENDANCE_KEY_MAP[day as DayOfWeek];
             if (!dayKey) return null;
             
             const isAttended = attendanceState[dayKey] === true;

             return (
               <div key={day} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                 <span className="font-medium text-gray-700">{day}</span>
                 
                 <div className="flex bg-gray-100 rounded-xl p-1">
                   <button
                     onClick={() => handleToggle(dayKey, true)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                       isAttended 
                         ? 'bg-emerald-500 text-white shadow-md' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Present
                   </button>
                   <button
                     onClick={() => handleToggle(dayKey, false)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                       !isAttended 
                         ? 'bg-rose-500 text-white shadow-md' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     Absent
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
          disabled={updateMutation.isPending}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl flex justify-center items-center gap-3 hover:bg-black transition-colors"
        >
          {updateMutation.isPending ? (
            <Spinner />
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentDetails;
