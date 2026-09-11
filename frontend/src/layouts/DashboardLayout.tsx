import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Shipments', path: '/shipments', icon: Package },
    { name: 'Live Monitoring', path: '/monitoring', icon: Activity },
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Alerts', path: '/alerts', icon: BellRing },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col fixed h-full z-30 transition-all duration-300 shadow-2xl ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          <h2 className={`text-xl font-bold text-white tracking-wide flex items-center gap-2 transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <Activity className="text-white w-5 h-5" />
            </div>
            ColdChain
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold shadow-inner' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`flex items-center justify-center lg:justify-start gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ${!isSidebarOpen && 'lg:px-0'}`}
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-5 h-5" />
            <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none">
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-bold text-slate-800 text-xl tracking-tight">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="relative p-2 text-slate-400 hover:text-primary rounded-full hover:bg-blue-50 transition-colors">
               <BellRing className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             
             <div className="relative">
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
               >
                 <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-primary flex items-center justify-center text-white font-bold shadow-sm">
                   {user?.username.charAt(0).toUpperCase()}
                 </div>
                 <div className="text-sm font-medium text-slate-700 hidden sm:block">{user?.username}</div>
                 <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
               </button>
               
               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-premium border border-slate-100 py-2 z-50">
                   <div className="px-4 py-2 border-b border-slate-100 mb-2">
                     <p className="text-sm font-bold text-slate-800">{user?.username}</p>
                     <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                   </div>
                   <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
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
        
        <div className="flex-1 p-8 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
