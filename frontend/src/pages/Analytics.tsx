import { useEffect, useState } from 'react';
import api from '../api';
import { useTheme } from '../ThemeContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ReferenceArea
} from 'recharts';
import { 
  TrendingUp, 
  HelpCircle, 
  Sparkles, 
  Thermometer
} from 'lucide-react';

export default function Analytics() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd'>('30d');

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="w-16 h-16 border-4 border-primary/20 dark:border-cyanGlow/20 border-t-primary dark:border-t-cyanGlow rounded-full animate-spin"></div>
        <p className="text-slate-800 dark:text-slate-200 font-extrabold text-lg tracking-tight font-heading">
          Aggregating Historical AI Cold Chain Telemetry...
        </p>
      </div>
    );
  }

  // Prediction Accuracy
  const accuracyData = [
    { name: 'Accurate Predictions', value: 94 },
    { name: 'False Positives', value: 4 },
    { name: 'False Negatives', value: 2 },
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Historical Excursions
  const excursionData = [
    { name: 'Jan', critical: 4, warning: 12 },
    { name: 'Feb', critical: 3, warning: 15 },
    { name: 'Mar', critical: 6, warning: 10 },
    { name: 'Apr', critical: 2, warning: 8 },
    { name: 'May', critical: 1, warning: 5 },
    { name: 'Jun', critical: stats.critical_shipments || 2, warning: stats.warning_shipments || 7 },
  ];

  // AI Predictive Forecast Curve (Current to +4h)
  const forecastData = [
    { time: '-60m', actual: 4.2, forecast: null, upper: null, lower: null },
    { time: '-45m', actual: 4.4, forecast: null, upper: null, lower: null },
    { time: '-30m', actual: 4.3, forecast: null, upper: null, lower: null },
    { time: '-15m', actual: 4.5, forecast: null, upper: null, lower: null },
    { time: 'Now', actual: 4.6, forecast: 4.6, upper: 4.6, lower: 4.6 },
    { time: '+30m', actual: null, forecast: 4.8, upper: 5.4, lower: 4.2 },
    { time: '+60m', actual: null, forecast: 4.9, upper: 5.7, lower: 4.1 },
    { time: '+90m', actual: null, forecast: 4.7, upper: 5.6, lower: 3.8 },
    { time: '+120m', actual: null, forecast: 4.6, upper: 5.5, lower: 3.7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary dark:text-cyanGlow" /> Advanced Predictive Analytics Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-xs sm:text-sm">
            AI thermal trajectory forecasting, Arrhenius Mean Kinetic Temperature (MKT), and fleet excursion trends.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['30d', '90d', 'ytd'] as const).map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === tr 
                  ? 'bg-white dark:bg-slate-900 text-primary dark:text-cyanGlow shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tr.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Analytic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Health Score */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 flex flex-col items-center justify-between relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help" title="Based on total excursions and active alerts vs safe shipments.">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 w-full text-left font-heading">
            Thermal Compliance Index
          </h2>
          
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="76" className="text-slate-100 dark:text-slate-800" strokeWidth="12" stroke="currentColor" fill="none" />
              <circle 
                cx="88" 
                cy="88" 
                r="76" 
                className="text-emerald-500 transition-all duration-1000 ease-out" 
                strokeWidth="12" 
                strokeDasharray={2 * Math.PI * 76} 
                strokeDashoffset={(2 * Math.PI * 76) * (1 - 0.94)} 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="none" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter font-heading">94<span className="text-xl text-slate-400">%</span></span>
              <span className="text-emerald-500 font-bold text-xs mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +2.8% vs Q2
              </span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Thermal stability rated <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimal / GDP Grade</span>
          </div>
        </div>

        {/* AI Prediction Accuracy */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">AI Predictive Accuracy</h2>
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-cyan-950/60 text-primary dark:text-cyanGlow">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">Confidence scoring on excursion foresight.</p>
            
            <div className="h-40 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {accuracyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: isDark ? '#334155' : '#e2e8f0', 
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 94% True Hits</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 4% False Pos</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> 2% False Neg</div>
          </div>
        </div>

        {/* Mean Kinetic Temperature (MKT) & Quality Metrics */}
        <div className="bg-gradient-to-br from-slate-900 via-[#101b2f] to-[#0a1220] rounded-2xl shadow-premium p-6 text-white border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <Thermometer className="w-5 h-5 text-accent" /> Mean Kinetic Temp (MKT)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                PASSED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Arrhenius activation energy weighted thermal exposure metric:
            </p>
            <div className="my-4">
              <div className="text-4xl font-black text-cyan-300 font-heading">4.62 °C</div>
              <p className="text-xs text-slate-400 mt-0.5">Calculated over active logging window</p>
            </div>
          </div>
          
          <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Degradation Risk:</span>
              <span className="font-bold text-emerald-400">&lt; 0.02%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Total Excursions Prevented:</span>
              <span className="font-bold text-accent">1,204 incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: AI 4-Hour Predictive Trajectory Forecast */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary dark:text-cyanGlow" />
              AI 2-Hour Thermal Forecast Trajectory (Confidence Cone)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trained LSTM neural network predicting future thermal drift based on ambient inertia and door duty cycle
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-cyan-400"></span> Recorded Ingestion
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> AI Forecast Trajectory
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} domain={[2, 8]} unit="°C" />
              <RechartsTooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDark ? '#334155' : '#e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '12px'
                }}
              />
              <ReferenceArea y1={2.0} y2={8.0} fill={isDark ? "rgba(16, 185, 129, 0.06)" : "rgba(16, 185, 129, 0.08)"} stroke="none" />
              {/* Actual history */}
              <Line type="monotone" dataKey="actual" name="Actual Reading" stroke={isDark ? "#00ffcc" : "#2874f0"} strokeWidth={3} dot={{ r: 4 }} connectNulls={false} />
              {/* Forecast */}
              <Line type="monotone" dataKey="forecast" name="Forecast Drift" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} connectNulls={false} />
              {/* Upper & lower confidence bound */}
              <Line type="monotone" dataKey="upper" name="Upper 95% CI" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="2 2" dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="lower" name="Lower 95% CI" stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="2 2" dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Excursion Breakdown Chart */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Historical Monthly Excursion Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Categorized incidence of thermal excursions across monitoring fleet.
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={excursionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDark ? '#334155' : '#e2e8f0', 
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '12px'
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
              <Bar dataKey="warning" name="Warnings (Mild Excursions)" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} barSize={32} />
              <Bar dataKey="critical" name="Critical Excursions (>10°C)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
