import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileBarChart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col max-w-lg mx-auto shadow-2xl">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe max-w-lg mx-auto z-50">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/') ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/students')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/students') ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <Users size={24} strokeWidth={isActive('/students') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Students</span>
          </button>

          <button
            onClick={() => navigate('/reports')} // Placeholder
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive('/reports') ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <FileBarChart size={24} strokeWidth={isActive('/reports') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Reports</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;