import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, ShieldCheck, AlertTriangle, AlertOctagon, WifiOff, BellRing, Thermometer, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  active_shipments: number;
  safe_shipments: number;
  warning_shipments: number;
  critical_shipments: number;
  offline_devices: number;
  active_alerts: number;
  average_temperature: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard-stats');
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
  }

  const generateSparklineData = (trend: 'up' | 'down' | 'stable') => {
    return Array.from({ length: 10 }, (_, i) => ({
      value: trend === 'up' ? i + Math.random() * 5 : trend === 'down' ? 10 - i + Math.random() * 5 : 5 + Math.random() * 2
    }));
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, trend = 'stable' }: any) => {
    const data = React.useMemo(() => generateSparklineData(trend), [trend]);
    return (
      <div className="bg-white rounded-sm p-5 border border-slate-200 shadow-flat flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-elevated transition-all duration-200 group cursor-default relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div className={`p-3 rounded-md ${bgColorClass}`}>
            <Icon className={`w-5 h-5 ${colorClass}`} />
          </div>
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} dot={false} className={colorClass} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="relative z-10 mt-1">
          <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-0.5">{title}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
          <p className="text-slate-500 mt-1">Real-time status of all monitored cold-chain shipments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Shipments" 
          value={stats.active_shipments} 
          icon={Package} 
          colorClass="text-primary"
          bgColorClass="bg-blue-50"
          trend="up"
        />
        <StatCard 
          title="Safe" 
          value={stats.safe_shipments} 
          icon={ShieldCheck} 
          colorClass="text-success"
          bgColorClass="bg-emerald-50"
          trend="stable"
        />
        <StatCard 
          title="Warning" 
          value={stats.warning_shipments} 
          icon={AlertTriangle} 
          colorClass="text-warning"
          bgColorClass="bg-amber-50"
          trend="up"
        />
        <StatCard 
          title="Critical" 
          value={stats.critical_shipments} 
          icon={AlertOctagon} 
          colorClass="text-critical"
          bgColorClass="bg-red-50"
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard 
          title="Active Alerts" 
          value={stats.active_alerts} 
          icon={BellRing} 
          colorClass="text-red-500"
          bgColorClass="bg-red-50"
          trend="down"
        />
        <StatCard 
          title="Average Temp" 
          value={`${stats.average_temperature}°C`} 
          icon={Thermometer} 
          colorClass="text-blue-500"
          bgColorClass="bg-blue-50"
          trend="stable"
        />
        <StatCard 
          title="Offline Devices" 
          value={stats.offline_devices} 
          icon={WifiOff} 
          colorClass="text-slate-500"
          bgColorClass="bg-slate-100"
          trend="stable"
        />
      </div>

      {/* System Activity Placeholder */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-flat p-6 mt-6">
        <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide">
          <Activity className="w-5 h-5 text-primary" /> Recent System Activity
        </h2>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-slate-200">
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] bg-white p-4 rounded-sm border border-slate-200 shadow-flat">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-primary text-sm">Shipment CC-1020 Dispatched</div>
                <time className="text-xs text-slate-500">10 mins ago</time>
              </div>
              <div className="text-slate-600 text-sm">Vaccine shipment left Miami distribution center.</div>
            </div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-red-50 text-red-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] bg-white p-4 rounded-sm border border-slate-200 shadow-flat">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-red-600 text-sm">Temperature Excursion</div>
                <time className="text-xs text-slate-500">1 hour ago</time>
              </div>
              <div className="text-slate-600 text-sm">Shipment CC-0982 exceeded maximum threshold (8.2°C).</div>
            </div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-blue-50 text-blue-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] bg-white p-4 rounded-sm border border-slate-200 shadow-flat">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-primary text-sm">Device ESP-005 Offline</div>
                <time className="text-xs text-slate-500">2 hours ago</time>
              </div>
              <div className="text-slate-600 text-sm">Lost heartbeat connection in transit zone.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
