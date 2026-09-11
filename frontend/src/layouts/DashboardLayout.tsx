import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Activity, 
  Cpu, 
  BellRing, 
  LineChart, 
  FileText,
  LogOut,
  Settings,
  ChevronDown,
  Menu
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Shipments', path: '/app/shipments', icon: Package },
    { name: 'Live Monitoring', path: '/app/monitoring', icon: Activity },
    { name: 'Devices', path: '/app/devices', icon: Cpu },
    { name: 'Alerts', path: '/app/alerts', icon: BellRing },
    { name: 'Analytics', path: '/app/analytics', icon: LineChart },
    { name: 'Reports', path: '/app/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar - White, clean, eCommerce style */}
      <aside className={`bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-all duration-300 shadow-flat ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="p-4 flex items-center justify-center h-16 border-b border-slate-100">
          <h2 className={`text-xl font-bold text-primary tracking-wide flex items-center gap-2 transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>
            <Activity className="text-accent w-6 h-6" />
            ColdChain
          </h2>
          {/* Collapsed logo */}
          {!isSidebarOpen && (
            <div className="hidden lg:flex items-center justify-center w-full">
              <Activity className="text-primary w-6 h-6" />
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/app' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50/50 text-primary font-semibold border-l-4 border-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary border-l-4 border-transparent'
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 w-full rounded-sm text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'lg:px-0'}`}
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header - Flipkart Blue */}
        <header className="h-16 bg-primary flex items-center justify-between px-6 sticky top-0 z-20 shadow-elevated">
          <div className="flex items-center gap-4 text-white">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-sm transition-colors focus:outline-none">
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-medium text-lg tracking-wide hidden sm:block">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/app' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="relative p-2 text-white hover:bg-white/10 rounded-sm transition-colors">
               <BellRing className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-primary"></span>
             </button>
             
             <div className="relative">
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-white/10 rounded-sm transition-all"
               >
                 <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary font-bold shadow-sm">
                   {user?.username.charAt(0).toUpperCase()}
                 </div>
                 <div className="text-sm font-medium text-white hidden sm:block">{user?.username}</div>
                 <ChevronDown className="w-4 h-4 text-white/80 hidden sm:block" />
               </button>
               
               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-elevated border border-slate-200 py-2 z-50">
                   <div className="px-4 py-2 border-b border-slate-100 mb-2">
                     <p className="text-sm font-bold text-slate-800">{user?.username}</p>
                     <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                   </div>
                   <button 
                     onClick={() => alert("Settings panel opening...")} 
                     className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2"
                   >
                     <Settings className="w-4 h-4 text-slate-400" /> Settings
                   </button>
                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                     <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                   </button>
                 </div>
               )}
             </div>
          </div>
        </header>
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
