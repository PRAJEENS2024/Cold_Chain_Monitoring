import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  BellRing, 
  FileText, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Menu,
  Radio,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, tag: 'Live' },
    { name: 'Live Monitoring', path: '/app/monitoring', icon: Activity, tag: 'Stream' },
    { name: 'Device Info', path: '/app/devices', icon: Cpu, tag: 'Hardware' },
    { name: 'Alerts', path: '/app/alerts', icon: BellRing, tag: 'Realtime' },
    { name: 'Reports', path: '/app/reports', icon: FileText, tag: 'Audit' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar - Enterprise Slate Surface with Smooth Shadow */}
      <aside className={`bg-white border-r border-slate-200/90 flex flex-col fixed h-full z-30 transition-all duration-300 shadow-premium ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}`}>
        {/* Brand Header */}
        <div className="px-5 flex items-center justify-between h-16 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
          <Link to="/app" className={`flex items-center gap-2.5 transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white shadow-md shadow-primary/25">
              <Zap className="w-5 h-5 text-accent fill-accent" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none flex items-center gap-1 font-heading">
                ColdChain <span className="text-[10px] bg-blue-100 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Pro</span>
              </h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Enterprise IoT Platform</p>
            </div>
          </Link>
          {/* Collapsed Brand Icon */}
          {!isSidebarOpen && (
            <div className="hidden lg:flex items-center justify-center w-full">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white shadow-md shadow-primary/25">
                <Zap className="w-5 h-5 text-accent fill-accent" />
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${!isSidebarOpen && 'lg:hidden'}`}>
            Navigation Hub
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/app' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-50/90 text-primary font-semibold shadow-sm border border-blue-200/70' 
                    : 'text-slate-600 hover:bg-slate-50/80 hover:text-primary border border-transparent'
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-400 group-hover:text-primary group-hover:bg-blue-50/60'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm tracking-tight transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>
                    {item.name}
                  </span>
                </div>
                {item.tag && isSidebarOpen && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-primary'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Hardware Status Widget in Sidebar */}
        <div className={`p-3 mx-3 mb-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-md border border-slate-700/60 ${!isSidebarOpen && 'lg:hidden'}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Radio className="w-3.5 h-3.5 text-accent animate-pulse" /> Node ESP-001
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">ThingSpeak Ch:</span>
              <span className="font-mono text-cyan-300 font-semibold">3483882</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cadence:</span>
              <span className="text-emerald-300 font-medium">15s Live Polling</span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={handleLogout}
            className={`flex items-center justify-center lg:justify-start gap-3 px-3.5 py-2.5 w-full rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all font-medium text-sm group ${!isSidebarOpen && 'lg:px-0'}`}
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className={`transition-opacity duration-300 ${!isSidebarOpen && 'lg:hidden'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header - Enterprise Flipkart Vibrant Blue with Gradient & Glow */}
        <header className="h-16 bg-gradient-to-r from-[#2874f0] via-[#2268de] to-[#1a5bc9] text-white flex items-center justify-between px-6 sticky top-0 z-20 shadow-md border-b border-blue-400/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-white/15 rounded-xl transition-all duration-200 focus:outline-none active:scale-95"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight font-heading hidden sm:block">
                {navItems.find(i => location.pathname === i.path || (i.path !== '/app' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 border border-white/20 text-white backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                IoT Node Connected
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Clock Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-black/20 rounded-xl border border-white/10 text-xs font-mono text-blue-100 backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{currentTime || '--:--:--'}</span>
            </div>

            {/* Notification Bell */}
            <Link 
              to="/app/alerts" 
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-all duration-200"
              title="Alert Notifications"
            >
              <BellRing className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[#2874f0] shadow-sm animate-pulse"></span>
            </Link>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 hover:bg-white/15 rounded-xl transition-all duration-200 border border-transparent hover:border-white/20 active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-yellow-200 flex items-center justify-center text-slate-900 font-extrabold shadow-sm text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <div className="text-sm font-bold text-white tracking-tight">{user?.username || 'Operator'}</div>
                  <div className="text-[10px] text-blue-100/80 font-medium capitalize">{user?.role || 'User'}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-premium border border-slate-200/90 py-2.5 z-50 animate-slide-up-fade">
                  <div className="px-4 py-2.5 border-b border-slate-100 mb-1.5">
                    <p className="text-sm font-extrabold text-slate-800">{user?.username}</p>
                    <p className="text-xs text-slate-500 font-medium">{user?.email || 'admin@coldchain.local'}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-primary border border-blue-200">
                      <ShieldCheck className="w-3 h-3" /> Certified Operator
                    </div>
                  </div>
                  <button 
                    onClick={() => { setIsProfileOpen(false); navigate('/app/devices'); }} 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <Cpu className="w-4 h-4 text-slate-400" /> Device Diagnostics
                  </button>
                  <button 
                    onClick={() => { setIsProfileOpen(false); navigate('/app/reports'); }} 
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400" /> Compliance Audit
                  </button>
                  <div className="my-1 border-t border-slate-100"></div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content Viewport */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
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
