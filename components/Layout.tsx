import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileBarChart } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAppContext();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col max-w-lg mx-auto shadow-2xl transition-colors duration-300">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe max-w-lg mx-auto z-50 transition-colors duration-300">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('home')}</span>
          </button>
          
          <button
            onClick={() => navigate('/students')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/students') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            <Users size={24} strokeWidth={isActive('/students') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('students')}</span>
          </button>

          <button
            onClick={() => navigate('/reports')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/reports') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            <FileBarChart size={24} strokeWidth={isActive('/reports') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t('reports')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;