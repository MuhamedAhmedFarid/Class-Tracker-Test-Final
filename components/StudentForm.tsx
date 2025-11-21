import React, { useState, useEffect } from 'react';
import { CreateStudentDTO, DAYS_OF_WEEK } from '../types';
import { X, Trash2 } from 'lucide-react';
import { Spinner } from './Spinner';
import { useAppContext } from '../contexts/AppContext';

interface StudentFormProps {
  initialData?: CreateStudentDTO;
  onSubmit: (data: CreateStudentDTO) => void;
  onDelete?: () => void;
  isSubmitting: boolean;
  onCancel: () => void;
  title: string;
  submitLabel: string;
}

const StudentForm: React.FC<StudentFormProps> = ({ 
  initialData, 
  onSubmit, 
  onDelete,
  isSubmitting, 
  onCancel, 
  title, 
  submitLabel 
}) => {
  const { t } = useAppContext();
  const [formData, setFormData] = useState<CreateStudentDTO>({
    name: '',
    hourly_rate: 0,
    days_of_week: [],
    start_time: '',
    end_time: '',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        hourly_rate: initialData.hourly_rate || 0,
        days_of_week: initialData.days_of_week || [],
        start_time: initialData.start_time || '',
        end_time: initialData.end_time || '',
      });
    }
  }, [initialData]);

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
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto no-scrollbar border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('fullName')}</label>
            <input
              autoFocus
              type="text"
              className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-gray-400 dark:placeholder-gray-600"
              placeholder={t('fullNamePlaceholder')}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('hourlyRate')}</label>
            <input
              type="number"
              className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="0.00"
              value={formData.hourly_rate}
              onChange={e => setFormData({...formData, hourly_rate: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('startTime')}</label>
                <input
                  type="time"
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors dark:[color-scheme:dark]"
                  value={formData.start_time || ''}
                  onChange={e => setFormData({...formData, start_time: e.target.value})}
                />
             </div>
             <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('endTime')}</label>
                <input
                  type="time"
                  className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors dark:[color-scheme:dark]"
                  value={formData.end_time || ''}
                  onChange={e => setFormData({...formData, end_time: e.target.value})}
                />
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('scheduleDays')}</label>
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
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-200 dark:shadow-none shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t(day.slice(0, 3))}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-emerald-700 transition-colors flex justify-center items-center shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? <Spinner /> : submitLabel}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('deleteConfirm'))) {
                  onDelete();
                }
              }}
              className="w-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold py-3 rounded-xl mt-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex justify-center items-center gap-2"
            >
              <Trash2 size={18} />
              {t('deleteStudent')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentForm;