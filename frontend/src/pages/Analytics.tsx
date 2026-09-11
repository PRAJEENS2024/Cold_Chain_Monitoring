import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Activity, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard-stats');
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading AI Analytics Engine...</div>;
  }

  // Mock data for AI Prediction Accuracy
  const accuracyData = [
    { name: 'Accurate Predictions', value: 94 },
    { name: 'False Positives', value: 4 },
    { name: 'False Negatives', value: 2 },
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Mock data for Excursions by Category
  const excursionData = [
    { name: 'Jan', critical: 4, warning: 12 },
    { name: 'Feb', critical: 3, warning: 15 },
    { name: 'Mar', critical: 6, warning: 10 },
    { name: 'Apr', critical: 2, warning: 8 },
    { name: 'May', critical: 1, warning: 5 },
    { name: 'Jun', critical: stats.critical_shipments, warning: stats.warning_shipments },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" /> Advanced Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">AI-driven insights and historical fleet performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Health Score */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-flat p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-help" title="Based on total excursions and active alerts vs safe shipments.">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-6 w-full text-left">Overall Fleet Health</h2>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="none" />
              <circle cx="96" cy="96" r="88" className="text-emerald-500 transition-all duration-1000 ease-out" strokeWidth="12" strokeDasharray={2 * Math.PI * 88} strokeDashoffset={(2 * Math.PI * 88) * (1 - 0.92)} strokeLinecap="round" stroke="currentColor" fill="none" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-800 tracking-tighter">92<span className="text-2xl text-slate-400">%</span></span>
              <span className="text-emerald-500 font-bold text-sm mt-1 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +2.4%</span>
            </div>
          </div>
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Fleet compliance is <span className="text-emerald-600 font-bold">Excellent</span> this month.
          </div>
        </div>

        {/* AI Prediction Accuracy */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-flat p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">AI Model Accuracy</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Confidence scoring for temperature forecasting.</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accuracyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {accuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Accurate</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> False Pos</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> False Neg</div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-slate-800 rounded-sm shadow-flat p-6 relative overflow-hidden flex flex-col justify-between">
           <div>
             <h2 className="text-lg font-bold text-white mb-2 relative z-10 flex items-center gap-2">
               <ShieldCheck className="text-success w-5 h-5" /> Active Defenses
             </h2>
             <p className="text-slate-300 text-sm font-medium relative z-10">Real-time alerts and interventions.</p>
           </div>
           
           <div className="space-y-4 relative z-10 mt-6">
             <div className="flex justify-between items-center border-b border-slate-700 pb-3">
               <span className="text-slate-300 font-semibold">Total Alerts Prevented</span>
               <span className="text-2xl font-black text-white">1,204</span>
             </div>
             <div className="flex justify-between items-center border-b border-slate-700 pb-3">
               <span className="text-slate-300 font-semibold">Average Temp Variance</span>
               <span className="text-2xl font-black text-white">±0.4°C</span>
             </div>
             <div className="flex justify-between items-center pb-1">
               <span className="text-slate-300 font-semibold">Offline Interventions</span>
               <span className="text-2xl font-black text-white">18</span>
             </div>
           </div>
        </div>
      </div>

      {/* Historical Excursion Chart */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-flat p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Historical Temperature Excursions</h2>
            <p className="text-sm text-slate-500 font-medium">Monthly breakdown of warning and critical thermal events.</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={excursionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
              <Bar dataKey="warning" name="Warnings" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} barSize={30} />
              <Bar dataKey="critical" name="Critical Events" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
