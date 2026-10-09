import { useEffect, useState } from 'react';
import api from '../api';
import { useTheme } from '../ThemeContext';
import { 
  Thermometer, 
  DoorOpen, 
  DoorClosed, 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  Activity, 
  RefreshCw,
  Radio,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Download,
  Flame,
  Snowflake,
  Sliders
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReadingPoint {
  time: string;
  temp: number;
}

interface DeviceTelemetry {
  device_id: string;
  status: string;
  last_seen: string | null;
  last_updated_seconds_ago: number | null;
  current_temp: number | null;
  door_open: boolean;
  door_status: string;
  readings: ReadingPoint[];
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lcdBacklight, setLcdBacklight] = useState(true);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const fetchTelemetry = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await api.get('/api/iot/device/ESP-001/telemetry', {
        params: { _t: Date.now() }
      });
      setTelemetry(res.data);
      setError(null);
      if (manual) {
        setSyncFeedback('Synchronized with ThingSpeak Channel 3483882 successfully');
        setTimeout(() => setSyncFeedback(null), 3500);
      }
    } catch (err: any) {
      setError('Unable to retrieve device data from backend.');
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 10000); // 10s live poll
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return 'Never';
    if (seconds < 15) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1m ago';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(seconds / 60);
    return `${hours}h ago`;
  };

  const exportTelemetryCsv = () => {
    if (!telemetry?.readings?.length) return;
    const header = "Timestamp (UTC),Temperature (°C),Device ID,Status\n";
    const rows = telemetry.readings.map(r => `${r.time},${r.temp},ESP-001,${telemetry.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `coldchain_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 dark:border-cyanGlow/20 border-t-primary dark:border-t-cyanGlow rounded-full animate-spin"></div>
          <Activity className="w-7 h-7 text-primary dark:text-cyanGlow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-extrabold text-lg tracking-tight font-heading">
          Connecting to Physical ESP-001 Telemetry Stream...
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Polling ThingSpeak Channel 3483882 via FastAPI Core
        </p>
      </div>
    );
  }

  const isOnline = telemetry?.status === 'ONLINE';
  const hasTelemetry = telemetry && telemetry.current_temp !== null;
  const currentTemp = telemetry?.current_temp ?? null;
  const isTempSafe = currentTemp !== null && currentTemp >= 2.0 && currentTemp <= 8.0;

  // Stats computation
  const readingValues = telemetry?.readings.map(r => r.temp) || [];
  const minTemp = readingValues.length ? Math.min(...readingValues) : (currentTemp ?? '--');
  const maxTemp = readingValues.length ? Math.max(...readingValues) : (currentTemp ?? '--');
  const avgTemp = readingValues.length 
    ? (readingValues.reduce((a, b) => a + b, 0) / readingValues.length).toFixed(1) 
    : (currentTemp ?? '--');

  // Distribution for Donut Chart
  const safeCount = readingValues.filter(t => t >= 2.0 && t <= 8.0).length;
  const highExcursionCount = readingValues.filter(t => t > 8.0).length;
  const subZeroCount = readingValues.filter(t => t < 2.0).length;
  const totalPoints = readingValues.length || 1;

  const distributionData = [
    { name: 'Safe Range (2-8°C)', value: safeCount || (isTempSafe ? 1 : 0), color: '#10b981' },
    { name: 'High Excursion (>8°C)', value: highExcursionCount || (!isTempSafe && currentTemp && currentTemp > 8 ? 1 : 0), color: '#ef4444' },
    { name: 'Sub-Zero (<2°C)', value: subZeroCount || (!isTempSafe && currentTemp && currentTemp < 2 ? 1 : 0), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // LCD text format (mirrors physical 16x2 display)
  const lcdLine1 = currentTemp !== null 
    ? `T:${currentTemp.toFixed(1)}C ${isTempSafe ? 'SAFE' : 'WARN'}`.padEnd(16, ' ') 
    : 'TEMP: --.- C    ';
  const lcdLine2 = telemetry?.door_open 
    ? 'DOOR: OPEN [!]  ' 
    : 'DOOR: CLOSED [OK]';

  // SVG Radial Gauge Calculations
  const gaugeMin = 0;
  const gaugeMax = 12;
  const clampedTemp = currentTemp !== null ? Math.max(gaugeMin, Math.min(gaugeMax, currentTemp)) : 4.0;
  const gaugeFraction = (clampedTemp - gaugeMin) / (gaugeMax - gaugeMin);
  const gaugeRadius = 75;
  const gaugeCircumference = Math.PI * gaugeRadius; // Semi-circle arc
  const gaugeStrokeDashoffset = gaugeCircumference * (1 - gaugeFraction);

  return (
    <div className="space-y-6">
      {/* Top Banner / Device Command Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary dark:text-cyanGlow" />
              ESP-001 Live Cold Chain Command
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/10' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              {isOnline ? 'Online • Streaming' : 'Standby / Offline'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-primary dark:text-cyanGlow border border-blue-200 dark:border-blue-800">
              <Radio className="w-3 h-3 text-primary dark:text-cyanGlow animate-pulse" /> Channel 3483882
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1.5 flex flex-wrap items-center gap-2">
            <span>Physical Node ESP32 DevKit</span>
            <span>•</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">MAC: 04:b2:47:54:b1:88</span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400">Firmware v1.0.0</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> GDP 21 CFR Part 11 Active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportTelemetryCsv}
            className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
            title="Download Telemetry History CSV"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-98 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync ThingSpeak'}</span>
          </button>
        </div>
      </div>

      {/* Connection, Sync & Error Banners */}
      {syncFeedback && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 p-3.5 rounded-xl flex items-center gap-2.5 font-bold text-xs shadow-sm transition-all animate-bounce-subtle">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-center gap-3 font-semibold shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && !isOnline && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-4 rounded-xl flex items-center gap-3 font-medium shadow-sm">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Node Telemetry Standby</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Listening for next ESP-001 ThingSpeak transmission. Physical sensors and LCD remain fully active.
            </p>
          </div>
        </div>
      )}

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Current Temperature */}
        <div className={`bg-white dark:bg-[#0f172a] rounded-2xl p-5 border shadow-flat dark:shadow-premium-dark hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          hasTelemetry
            ? (isTempSafe ? 'border-blue-200 dark:border-cyan-800/80' : 'border-amber-300 dark:border-amber-600/80')
            : 'border-slate-200 dark:border-slate-800'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 dark:from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Live DS18B20 Temp
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2 font-heading tracking-tight flex items-baseline gap-1.5">
                <span>{hasTelemetry ? `${currentTemp}` : '--'}</span>
                <span className="text-lg text-slate-400">°C</span>
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              hasTelemetry 
                ? (isTempSafe ? 'bg-blue-50 dark:bg-cyan-950/60 text-primary dark:text-cyanGlow border border-blue-200 dark:border-cyan-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800') 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Safe Band: 2.0°C – 8.0°C</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              hasTelemetry 
                ? (isTempSafe ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300') 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {hasTelemetry ? (isTempSafe ? 'In Range' : 'Excursion Alert') : '--'}
            </span>
          </div>
        </div>

        {/* Card 2: Door Status */}
        <div className={`bg-white dark:bg-[#0f172a] rounded-2xl p-5 border shadow-flat dark:shadow-premium-dark hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          telemetry?.door_open ? 'border-red-300 dark:border-red-800' : 'border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none ${
            telemetry?.door_open ? 'bg-red-500/5' : 'bg-emerald-500/5'
          }`}></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {telemetry?.door_open ? <DoorOpen className="w-3.5 h-3.5 text-red-500" /> : <DoorClosed className="w-3.5 h-3.5 text-emerald-500" />}
                Reed Switch State
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold mt-2 font-heading tracking-tight">
                {hasTelemetry ? (
                  <span className={telemetry.door_open ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {telemetry.door_status}
                  </span>
                ) : (
                  <span className="text-slate-400">--</span>
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              hasTelemetry
                ? (telemetry.door_open ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800')
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {hasTelemetry && telemetry.door_open ? (
                <DoorOpen className="w-6 h-6 animate-pulse" />
              ) : (
                <DoorClosed className="w-6 h-6" />
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Pin: GPIO 13 (Reed)</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              hasTelemetry && telemetry.door_open ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
            }`}>
              {hasTelemetry ? (telemetry.door_open ? '1 (OPEN)' : '0 (CLOSED)') : '--'}
            </span>
          </div>
        </div>

        {/* Card 3: Cloud Node Link */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-flat dark:shadow-premium-dark hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Cloud Node Link
              </span>
              <h3 className={`text-3xl sm:text-4xl font-extrabold mt-2 font-heading tracking-tight ${
                isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {telemetry ? telemetry.status : 'OFFLINE'}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              isOnline ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Cadence: 15s Polling</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">Ch 3483882</span>
          </div>
        </div>

        {/* Card 4: Last Updated Time */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-flat dark:shadow-premium-dark hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Freshness Sync
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mt-2 font-heading tracking-tight">
                {telemetry ? formatLastUpdated(telemetry.last_updated_seconds_ago) : 'Never'}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-cyan-950/60 text-primary dark:text-cyanGlow border border-blue-200 dark:border-cyan-800 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Data Transport</span>
            <span className="font-semibold text-primary dark:text-cyanGlow">HTTPS Live REST</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Radial Gauge + 16x2 LCD Mirror + Excursion Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Precision SVG Radial Temperature Gauge */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-primary dark:text-cyanGlow" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Thermal Precision Dial
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTempSafe ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {isTempSafe ? 'OPTIMAL' : 'EXCURSION'}
              </span>
            </div>

            {/* SVG Arc Gauge */}
            <div className="relative flex flex-col items-center justify-center my-4">
              <div className="relative w-52 h-32 flex items-center justify-center overflow-hidden">
                <svg className="w-52 h-52 -mt-10 transform -rotate-180" viewBox="0 0 200 200">
                  {/* Background Arc */}
                  <path
                    d="M 25 100 A 75 75 0 0 1 175 100"
                    fill="none"
                    stroke={isDark ? "#1e293b" : "#e2e8f0"}
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Safe Zone Arc Range (2°C to 8°C out of 0-12°C = 16.6% to 66.6%) */}
                  <path
                    d="M 50 75 A 75 75 0 0 1 150 75"
                    fill="none"
                    stroke={isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.2)"}
                    strokeWidth="16"
                  />
                  {/* Dynamic Value Arc */}
                  <path
                    d="M 25 100 A 75 75 0 0 1 175 100"
                    fill="none"
                    stroke={isTempSafe ? (isDark ? "#00ffcc" : "#10b981") : "#f59e0b"}
                    strokeWidth="16"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeStrokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                {/* Dial Center Readings */}
                <div className="absolute bottom-2 flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                    {hasTelemetry ? `${currentTemp}°C` : '--'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 mt-0.5">
                    Target: 2.0°C – 8.0°C
                  </span>
                </div>
              </div>

              {/* Min and Max Markers below Dial */}
              <div className="w-full flex justify-between px-6 text-[11px] font-mono font-bold text-slate-400">
                <span className="flex items-center gap-0.5"><Snowflake className="w-3 h-3 text-blue-400" /> 0°C</span>
                <span className="text-emerald-500 font-sans">Safe Zone (2-8°C)</span>
                <span className="flex items-center gap-0.5">12°C <Flame className="w-3 h-3 text-red-400" /></span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500 dark:text-slate-400">
            <span>DS18B20 Resolution:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">12-bit (0.0625°C)</span>
          </div>
        </div>

        {/* Column 2: Hyper-realistic 16x2 I2C LCD Mirror Card */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0e1726] to-[#070d17] rounded-2xl p-6 text-white shadow-premium border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold tracking-tight text-slate-200">16x2 Hardware LCD Mirror</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLcdBacklight(!lcdBacklight)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700 transition-colors"
                  title="Toggle LCD Backlight"
                >
                  <Sliders className="w-2.5 h-2.5" />
                  <span>BL: {lcdBacklight ? 'ON' : 'OFF'}</span>
                </button>
                <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>0x27 I2C</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Character-by-character live digital reflection of the physical ESP32 LCD:
            </p>
            
            {/* The 16x2 LCD Matrix Screen */}
            <div className={`mt-4 p-4 rounded-xl lcd-screen-container transition-opacity duration-300 ${lcdBacklight ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex flex-col space-y-1 font-mono text-sm sm:text-base font-bold lcd-glow-text select-none">
                <div className="flex items-center justify-between">
                  <span>{lcdLine1}</span>
                  <span className="text-[10px] text-cyan-400/60 font-sans tracking-normal">ROW 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lcdLine2}</span>
                  <span className="text-[10px] text-cyan-400/60 font-sans tracking-normal">ROW 2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Wiring: GPIO 21 (SDA) • GPIO 22 (SCL)</span>
            <span className="text-emerald-400 font-bold">LiquidCrystal_I2C</span>
          </div>
        </div>

        {/* Column 3: Excursion Breakdown Donut Chart */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Thermal Integrity Ratio
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-primary dark:text-cyanGlow">
                Last {totalPoints} Points
              </span>
            </div>

            <div className="h-44 w-full flex items-center justify-center my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: isDark ? '#ffffff' : '#0f172a'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <div>Safe Zone</div>
                <div className="text-base font-extrabold">{safeCount} pts</div>
              </div>
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                <div>High Excursion</div>
                <div className="text-base font-extrabold">{highExcursionCount} pts</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <div>Sub-Zero</div>
                <div className="text-base font-extrabold">{subZeroCount} pts</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Compliance Integrity Score:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {((safeCount / totalPoints) * 100).toFixed(0)}% Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Sensor Telemetry Summary Bar */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-flat dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Real-Time Sensor Telemetry Statistics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous thermal calculations computed dynamically from ThingSpeak buffer
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
            {readingValues.length} Packets Buffered
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-blue-500" /> Minimum Recorded
            </span>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 font-heading">
              {minTemp !== '--' ? `${minTemp} °C` : '--'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900">
            <span className="text-[11px] font-bold text-primary dark:text-cyanGlow uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Average Temperature
            </span>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 font-heading">
              {avgTemp !== '--' ? `${avgTemp} °C` : '--'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Maximum Recorded
            </span>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1 font-heading">
              {maxTemp !== '--' ? `${maxTemp} °C` : '--'}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compliance Audit Trail
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            WHO PQS & FDA 21 CFR Part 11 Validated Ingestion Pipeline
          </span>
        </div>
      </div>

      {/* Historical Temperature Area Chart */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary dark:text-cyanGlow" />
              Live Sensor Thermal Stream (ESP-001)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-precision readings ingested from DS18B20 1-Wire probe via ThingSpeak
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Upper Limit: 8.0°C
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Lower Limit: 2.0°C
            </span>
          </div>
        </div>

        {telemetry && telemetry.readings && telemetry.readings.length > 0 ? (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry.readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#00ffcc" : "#2874F0"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isDark ? "#00ffcc" : "#2874F0"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="time" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit="°C" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isDark ? '#ffffff' : '#0f172a'
                  }}
                  formatter={(val: any) => [`${val} °C`, 'Sensor Telemetry']}
                  labelFormatter={(lbl) => `Time: ${lbl} UTC`}
                />
                <ReferenceLine y={8.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '8.0°C Max', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={2.0} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: '2.0°C Min', fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke={isDark ? "#00ffcc" : "#2874F0"} 
                  strokeWidth={2.5} 
                  fill="url(#dashboardTempGrad)" 
                  activeDot={{ r: 6, stroke: isDark ? '#090d16' : '#ffffff', strokeWidth: 2, fill: isDark ? '#00ffcc' : '#2874F0' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-850/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Thermometer className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
            <p className="font-semibold text-sm">No telemetry packets recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Packets will render automatically upon ThingSpeak poller sync.</p>
          </div>
        )}
      </div>

      {/* Hardware Pipeline Specification Footer Card */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-800 dark:text-white p-5 rounded-2xl shadow-sm dark:shadow-premium border border-blue-200/80 dark:border-slate-700/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300">
        <div>
          <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-heading">
            <Cpu className="w-4 h-4 text-primary dark:text-accent" />
            <span>End-to-End Cold Chain Pipeline Architecture</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            DS18B20 & Reed Switch → ESP32 (16x2 LCD) → ThingSpeak (Ch 3483882) → FastAPI Engine → SQLite → React Dashboard
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="px-3 py-1 bg-white dark:bg-white/10 rounded-lg border border-blue-200/80 dark:border-white/15 shadow-2xs">
            LCD: <span className="text-emerald-600 dark:text-emerald-400 font-bold">16x2 I2C Active</span>
          </div>
          <div className="px-3 py-1 bg-white dark:bg-white/10 rounded-lg border border-blue-200/80 dark:border-white/15 shadow-2xs">
            Door State: <span className="text-primary dark:text-accent font-bold">{telemetry?.door_open ? '1 (OPEN)' : '0 (CLOSED)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
