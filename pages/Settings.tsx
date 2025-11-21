import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, Moon, Sun, Smartphone, Check } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, t } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 sticky top-0 z-10 px-4 py-4 flex items-center justify-between shadow-sm border-b border-gray-100 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft size={24} className="rtl:rotate-180" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 dark:text-white">{t('settings')}</h1>
        <div className="w-8"></div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Language Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Globe size={18} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">{t('language')}</h2>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => setLanguage('en')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                language === 'en' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
                  : 'bg-gray-50 dark:bg-gray-700/30 border-transparent'
              }`}
            >
              <span className={`font-medium ${language === 'en' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>English</span>
              {language === 'en' && <Check size={18} className="text-emerald-600 dark:text-emerald-400" />}
            </button>
            
            <button 
              onClick={() => setLanguage('ar')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                language === 'ar' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
                  : 'bg-gray-50 dark:bg-gray-700/30 border-transparent'
              }`}
            >
              <span className={`font-medium ${language === 'ar' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>العربية</span>
              {language === 'ar' && <Check size={18} className="text-emerald-600 dark:text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Moon size={18} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">{t('appearance')}</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                theme === 'light' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400' 
                  : 'bg-gray-50 dark:bg-gray-700/30 border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <Sun size={24} />
              <span className="text-xs font-bold">{t('light')}</span>
            </button>

            <button 
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400' 
                  : 'bg-gray-50 dark:bg-gray-700/30 border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <Moon size={24} />
              <span className="text-xs font-bold">{t('dark')}</span>
            </button>

            <button 
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                theme === 'system' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400' 
                  : 'bg-gray-50 dark:bg-gray-700/30 border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <Smartphone size={24} />
              <span className="text-xs font-bold">{t('system')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;