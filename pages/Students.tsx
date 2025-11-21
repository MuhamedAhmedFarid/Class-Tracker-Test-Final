
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudents, createStudent } from '../services/studentService';
import { DAYS_OF_WEEK, Student, CreateStudentDTO, DayOfWeek } from '../types';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, User, Filter, Check } from 'lucide-react';
import { Spinner } from '../components/Spinner';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDayFilter, setActiveDayFilter] = useState<string | null>(null);
  const [minRateFilter, setMinRateFilter] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateStudentDTO>({
    name: '',
    hourly_rate: 0,
    days_of_week: [],
    start_time: '',
    end_time: '',
  });

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
      setFormData({ name: '', hourly_rate: 0, days_of_week: [], start_time: '', end_time: '' });
    },
  });

  // Filtering Logic
  const filteredStudents = students?.filter(student => {
    const matchesName = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay = activeDayFilter ? student.days_of_week.includes(activeDayFilter) : true;
    const matchesRate = minRateFilter ? student.hourly_rate > minRateFilter : true;
    return matchesName && matchesDay && matchesRate;
  }) || [];

  const toggleDaySelection = (day: string) => {
    setFormData(prev => {
      const exists = prev.days_of_week.includes(day);
      return {
        ...prev,
        days_of_week: exists 
          ? prev.days_of_week.filter(d => d !== day)
          : [...prev.days_of_week, day]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="pt-12"><Spinner /></div>;
  if (isError) return <div className="p-6 text-center text-red-500">Error loading students.</div>;

  return (
    <div className="min-h-full bg-gray-50 pb-24 relative">
      {/* Header & Search */}
      <div className="bg-white px-4 pt-8 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-md transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 text-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Horizontal Filters */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center text-gray-400 px-2"><Filter size={16} /></div>
          
          {/* Rate Filters */}
          <button 
            onClick={() => setMinRateFilter(minRateFilter === 50 ? null : 50)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              minRateFilter === 50 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {'>'} 50 EGP
          </button>
          <button 
            onClick={() => setMinRateFilter(minRateFilter === 100 ? null : 100)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              minRateFilter === 100 ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {'>'} 100 EGP
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Day Filters (Shortened) */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
             const fullDay = DAYS_OF_WEEK[idx === 6 ? 0 : idx + 1]; // Map Mon->Monday
             const isActive = activeDayFilter === fullDay;
             return (
              <button
                key={day}
                onClick={() => setActiveDayFilter(isActive ? null : fullDay)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  isActive ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {day}
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
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-[0.99] transition-transform"
          >
             <div className="flex justify-between items-start">
                <div className="flex items-center">
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mr-3">
                      <User size={20} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900">{student.name}</h3>
                      <p className="text-xs text-gray-500">{student.days_of_week.join(', ')}</p>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-emerald-600">{student.hourly_rate} EGP</span>
                  {student.start_time && <span className="text-xs text-gray-400 mt-1">{student.start_time}</span>}
                </div>
             </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-sm">No students found.</p>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  autoFocus
                  type="text"
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hourly Rate (EGP)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="0.00"
                  value={formData.hourly_rate}
                  onChange={e => setFormData({...formData, hourly_rate: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Start Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={formData.start_time || ''}
                      onChange={e => setFormData({...formData, start_time: e.target.value})}
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">End Time</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={formData.end_time || ''}
                      onChange={e => setFormData({...formData, end_time: e.target.value})}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Schedule Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = formData.days_of_week.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-200 shadow-md' 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-emerald-700 transition-colors flex justify-center items-center"
              >
                {createMutation.isPending ? <Spinner /> : 'Create Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
