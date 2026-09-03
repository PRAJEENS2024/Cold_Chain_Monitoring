import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, ShieldCheck, AlertTriangle, AlertOctagon, WifiOff, BellRing, Thermometer } from 'lucide-react';

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

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }: any) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-lg ${bgColorClass}`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <div>
        <div className="text-slate-500 text-sm font-medium">{title}</div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );

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
        />
        <StatCard 
          title="Safe" 
          value={stats.safe_shipments} 
          icon={ShieldCheck} 
          colorClass="text-success"
          bgColorClass="bg-emerald-50"
        />
        <StatCard 
          title="Warning" 
          value={stats.warning_shipments} 
          icon={AlertTriangle} 
          colorClass="text-warning"
          bgColorClass="bg-amber-50"
        />
        <StatCard 
          title="Critical" 
          value={stats.critical_shipments} 
          icon={AlertOctagon} 
          colorClass="text-critical"
          bgColorClass="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard 
          title="Active Alerts" 
          value={stats.active_alerts} 
          icon={BellRing} 
          colorClass="text-red-500"
          bgColorClass="bg-red-50"
        />
        <StatCard 
          title="Average Temp" 
          value={`${stats.average_temperature}°C`} 
          icon={Thermometer} 
          colorClass="text-blue-500"
          bgColorClass="bg-blue-50"
        />
        <StatCard 
          title="Offline Devices" 
          value={stats.offline_devices} 
          icon={WifiOff} 
          colorClass="text-slate-500"
          bgColorClass="bg-slate-100"
        />
      </div>
    </div>
  );
}
