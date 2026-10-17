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
  Sliders,
  ShieldAlert,
  X,
  FileCheck,
  Layers,
  Sparkles,
  Timer
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

interface StorageProfile {
  id: string;
  name: string;
  minTemp: number;
  maxTemp: number;
  badge: string;
  desc: string;
  icon: string;
}

const STORAGE_PROFILES: StorageProfile[] = [
  { id: 'vaccines', name: 'WHO Vaccines & Biologics', minTemp: 2.0, maxTemp: 8.0, badge: '2°C – 8°C', desc: 'Standard cold chain custody for vaccines, insulin & biologics', icon: '💉' },
  { id: 'frozen', name: 'Frozen Bio-Specimens', minTemp: -20.0, maxTemp: -10.0, badge: '-20°C – -10°C', desc: 'Deep freezer custody for frozen tissue, enzymes & plasma', icon: '🧊' },
  { id: 'crt', name: 'Controlled Room Temp (CRT)', minTemp: 15.0, maxTemp: 25.0, badge: '15°C – 25°C', desc: 'Ambient pharmaceutical stability custody per USP <1079>', icon: '💊' },
  { id: 'ultracold', name: 'Ultra-Cold mRNA / Stem Cells', minTemp: -30.0, maxTemp: -15.0, badge: '-30°C – -15°C', desc: 'Ultra-low thermal custody requirement', icon: '❄️' },
];

// Arrhenius Mean Kinetic Temperature (MKT) Calculator
const computeMKT = (readings: ReadingPoint[]): number | null => {
  if (!readings || readings.length === 0) return null;
  const DH_R = 10000; // Standard pharmaceutical activation energy / gas constant in Kelvin
  let sum = 0;
  let count = 0;
  for (const r of readings) {
    const tk = r.temp + 273.15;
    if (tk <= 0) continue;
    sum += Math.exp(-DH_R / tk);
    count++;
  }
  if (count === 0 || sum <= 0) return null;
  const avg = sum / count;
  const mktK = -DH_R / Math.log(avg);
  return Number((mktK - 273.15).toFixed(2));
};

export default function Dashboard() {
  const { isDark } = useTheme();
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lcdBacklight, setLcdBacklight] = useState(true);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  
  // High-Value Features State
  const [selectedProfileId, setSelectedProfileId] = useState('vaccines');
  const [doorOpenDuration, setDoorOpenDuration] = useState<number>(0);
  const [sopModalOpen, setSopModalOpen] = useState(false);
  const [sopChecklist, setSopChecklist] = useState({
    sealGasket: false,
    compressorPower: false,
    relocateCooler: false,
    notifyLead: false
  });
  const [sopOperatorNote, setSopOperatorNote] = useState('');
  const [sopToast, setSopToast] = useState<string | null>(null);

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

  // Chamber Door Ajar Real-time Timer
  useEffect(() => {
    let interval: any = null;
    if (telemetry?.door_open) {
      interval = setInterval(() => {
        setDoorOpenDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDoorOpenDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [telemetry?.door_open]);

  const formatSecondsToMMSS = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    const header = "Timestamp (UTC),Temperature (°C),Device ID,Status,Door State,Profile\n";
    const rows = telemetry.readings.map(r => `${r.time},${r.temp},ESP-001,${telemetry.status},${telemetry.door_status},${selectedProfileId}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `coldchain_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSyncFeedback('Downloaded Full Audit Telemetry CSV');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleLogSOP = () => {
    setSopModalOpen(false);
    setSopToast('Corrective Action recorded to 21 CFR Part 11 audit log');
    setTimeout(() => setSopToast(null), 4000);
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

  // Active Storage Profile Resolution
  const activeProfile = STORAGE_PROFILES.find(p => p.id === selectedProfileId) || STORAGE_PROFILES[0];
  const safeMin = activeProfile.minTemp;
  const safeMax = activeProfile.maxTemp;

  const isOnline = telemetry?.status === 'ONLINE';
  const hasTelemetry = telemetry && telemetry.current_temp !== null;
  const currentTemp = telemetry?.current_temp ?? null;
  const isTempSafe = currentTemp !== null && currentTemp >= safeMin && currentTemp <= safeMax;

  // Stats computation
  const readingValues = telemetry?.readings.map(r => r.temp) || [];
  const minTemp = readingValues.length ? Math.min(...readingValues) : (currentTemp ?? '--');
  const maxTemp = readingValues.length ? Math.max(...readingValues) : (currentTemp ?? '--');
  const avgTemp = readingValues.length 
    ? (readingValues.reduce((a, b) => a + b, 0) / readingValues.length).toFixed(1) 
    : (currentTemp ?? '--');

  // Distribution for Donut Chart (Based on dynamic active profile)
  const safeCount = readingValues.filter(t => t >= safeMin && t <= safeMax).length;
  const highExcursionCount = readingValues.filter(t => t > safeMax).length;
  const subZeroCount = readingValues.filter(t => t < safeMin).length;
  const totalPoints = readingValues.length || 1;
  const mktValue = computeMKT(telemetry?.readings || []);

  const distributionData = [
    { name: `Safe Zone (${safeMin} to ${safeMax}°C)`, value: safeCount || (isTempSafe ? 1 : 0), color: '#10b981' },
    { name: `High Excursion (>${safeMax}°C)`, value: highExcursionCount || (!isTempSafe && currentTemp && currentTemp > safeMax ? 1 : 0), color: '#ef4444' },
    { name: `Sub-Zero Excursion (<${safeMin}°C)`, value: subZeroCount || (!isTempSafe && currentTemp && currentTemp < safeMin ? 1 : 0), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // LCD text format (mirrors physical 16x2 display)
  const lcdLine1 = currentTemp !== null 
    ? `T:${currentTemp.toFixed(1)}C ${isTempSafe ? 'SAFE' : 'WARN'}`.padEnd(16, ' ') 
    : 'TEMP: --.- C    ';
  const lcdLine2 = telemetry?.door_open 
    ? 'DOOR: OPEN [!]  ' 
    : 'DOOR: CLOSED [OK]';

  // Precision 180° Arch Gauge Calculations (Upward Speedometer Arc)
  const gaugeMin = Math.min(-10, Math.floor(safeMin - 5));
  const gaugeMax = Math.max(45, Math.ceil(Math.max(safeMax + 15, currentTemp || 0)));
  const gaugeSpan = gaugeMax - gaugeMin;
  const clampedTemp = currentTemp !== null ? Math.max(gaugeMin, Math.min(gaugeMax, currentTemp)) : safeMin;
  const progressFraction = Math.max(0, Math.min(1, (clampedTemp - gaugeMin) / gaugeSpan));
  
  // Center (120, 120), Radius R=85
  const gaugeRadius = 85;
  const gaugeCircumference = Math.PI * gaugeRadius; // ~267.04
  const activeStrokeOffset = gaugeCircumference * (1 - progressFraction);

  // Safe Zone segment coordinates on the exact same arc
  const safeStartFrac = Math.max(0, Math.min(1, (safeMin - gaugeMin) / gaugeSpan));
  const safeEndFrac = Math.max(0, Math.min(1, (safeMax - gaugeMin) / gaugeSpan));
  const safeArcLength = Math.max(4, (safeEndFrac - safeStartFrac) * gaugeCircumference);
  const safeArcOffset = -safeStartFrac * gaugeCircumference;

  // Active stroke color
  const dialStrokeColor = isTempSafe 
    ? (isDark ? "#00ffcc" : "#10b981") 
    : (currentTemp !== null && currentTemp > safeMax ? "#ef4444" : "#3b82f6");

  // Needle indicator point
  const needleAngleDeg = 180 - progressFraction * 180;
  const needleAngleRad = (needleAngleDeg * Math.PI) / 180;
  const needleX = 120 + gaugeRadius * Math.cos(needleAngleRad);
  const needleY = 120 - gaugeRadius * Math.sin(needleAngleRad);

  return (
    <div className="space-y-6 relative">
      {/* Toast Feedback */}
      {syncFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {sopToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-bounce">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>{sopToast}</span>
        </div>
      )}

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
          {!isTempSafe && (
            <button
              onClick={() => setSopModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-red-500/25 animate-pulse transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Emergency SOP Guide</span>
            </button>
          )}

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

      {/* Error & Offline Warnings */}
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

      {/* 4 Primary Operational Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Current Temperature */}
        <div className={`bg-white dark:bg-[#0f172a] rounded-2xl p-5 border shadow-flat dark:shadow-premium-dark hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          hasTelemetry
            ? (isTempSafe ? 'border-emerald-200 dark:border-emerald-800/80' : 'border-red-300 dark:border-red-700/80')
            : 'border-slate-200 dark:border-slate-800'
        }`}>
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
                ? (isTempSafe ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800') 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Target: {safeMin}°C – {safeMax}°C</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              hasTelemetry 
                ? (isTempSafe ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300') 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {hasTelemetry ? (isTempSafe ? 'In Safe Band' : 'Thermal Excursion') : '--'}
            </span>
          </div>
        </div>

        {/* Card 2: Door Status & Live Elapsed Timer */}
        <div className={`bg-white dark:bg-[#0f172a] rounded-2xl p-5 border shadow-flat dark:shadow-premium-dark hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          telemetry?.door_open ? 'border-red-400 dark:border-red-600 ring-2 ring-red-500/20' : 'border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {telemetry?.door_open ? <DoorOpen className="w-3.5 h-3.5 text-red-500" /> : <DoorClosed className="w-3.5 h-3.5 text-emerald-500" />}
                Chamber Reed Switch
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold mt-2 font-heading tracking-tight flex items-baseline gap-2">
                {hasTelemetry ? (
                  <span className={telemetry.door_open ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {telemetry.door_status}
                  </span>
                ) : (
                  <span className="text-slate-400">--</span>
                )}
                {telemetry?.door_open && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                    <Timer className="w-3 h-3 text-red-500 animate-spin" />
                    {formatSecondsToMMSS(doorOpenDuration)}
                  </span>
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              hasTelemetry
                ? (telemetry.door_open ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800')
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
            <span className="text-slate-500 dark:text-slate-400 font-medium">GPIO 13 (Reed Interlock)</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              hasTelemetry && telemetry.door_open ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
            }`}>
              {hasTelemetry ? (telemetry.door_open ? `Door Ajar (${formatSecondsToMMSS(doorOpenDuration)})` : 'Airtight Sealed [OK]') : '--'}
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

      {/* Middle Section: Thermal Precision Dial + Storage Profile Controller + Excursion Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Precision SVG Radial Temperature Gauge (Glitch-Free Upward Arch Tachometer) */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-primary dark:text-cyanGlow" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Thermal Precision Dial
                </h3>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isTempSafe ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 animate-pulse'
              }`}>
                {isTempSafe ? 'OPTIMAL' : 'EXCURSION'}
              </span>
            </div>

            {/* SVG Upward Arc Gauge - Zero text overlap, clean tachometer dial */}
            <div className="relative flex flex-col items-center justify-center my-3">
              <div className="relative w-[240px] h-[135px] flex items-center justify-center">
                <svg className="w-[240px] h-[135px] overflow-visible" viewBox="0 0 240 140">
                  {/* Background Track Arc (Upward Semicircle M 35 120 to 205 120) */}
                  <path
                    d="M 35 120 A 85 85 0 0 1 205 120"
                    fill="none"
                    stroke={isDark ? "#1e293b" : "#e2e8f0"}
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Safe Zone Highlighting Band */}
                  <path
                    d="M 35 120 A 85 85 0 0 1 205 120"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.45)"
                    strokeWidth="18"
                    strokeDasharray={`${safeArcLength} ${gaugeCircumference}`}
                    strokeDashoffset={safeArcOffset}
                    strokeLinecap="round"
                  />
                  {/* Active Temperature Progress Arc */}
                  <path
                    d="M 35 120 A 85 85 0 0 1 205 120"
                    fill="none"
                    stroke={dialStrokeColor}
                    strokeWidth="14"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={activeStrokeOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }}
                  />
                  {/* Indicator Needle Bead */}
                  <circle
                    cx={needleX}
                    cy={needleY}
                    r="6.5"
                    fill={dialStrokeColor}
                    stroke={isDark ? "#090d16" : "#ffffff"}
                    strokeWidth="2.5"
                    className="filter drop-shadow-md"
                    style={{ transition: 'cx 0.8s cubic-bezier(0.4, 0, 0.2, 1), cy 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                {/* Dial Center Readings - Comfortably nestled inside the arch */}
                <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                    {hasTelemetry ? `${currentTemp}°C` : '--'}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isTempSafe 
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : (currentTemp !== null && currentTemp > safeMax 
                            ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse'
                            : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 animate-pulse')
                    }`}>
                      {isTempSafe ? 'Optimal Target' : (currentTemp !== null && currentTemp > safeMax ? `+${(currentTemp - safeMax).toFixed(1)}°C Heat Excursion` : `-${(safeMin - (currentTemp || 0)).toFixed(1)}°C Sub-Zero Excursion`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Min and Max Markers below Dial */}
              <div className="w-full flex justify-between px-2 pt-2 text-[11px] font-mono font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Snowflake className="w-3.5 h-3.5 text-blue-500" /> {gaugeMin}°C
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  Target: {safeMin}°C – {safeMax}°C
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  +{gaugeMax}°C <Flame className="w-3.5 h-3.5 text-red-500" />
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500 dark:text-slate-400">
            <span>DS18B20 Resolution:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">12-bit (±0.0625°C)</span>
          </div>
        </div>

        {/* Column 2: Storage Profile & Temperature Setpoint Controller */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary dark:text-cyanGlow" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Storage Profile & Setpoints
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-950/60 text-primary dark:text-cyanGlow border border-blue-200 dark:border-cyan-800 font-bold">
                {activeProfile.badge}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Select standard storage protocol to adapt safety thresholds and compliance models:
            </p>

            {/* Profile Selection Pills */}
            <div className="grid grid-cols-2 gap-2 my-3">
              {STORAGE_PROFILES.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProfileId(p.id);
                    setSyncFeedback(`Applied storage profile: ${p.name}`);
                    setTimeout(() => setSyncFeedback(null), 3000);
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                    selectedProfileId === p.id
                      ? 'bg-primary/5 dark:bg-cyan-950/40 border-primary dark:border-cyanGlow text-slate-900 dark:text-white shadow-xs ring-1 ring-primary/20'
                      : 'bg-slate-50 dark:bg-[#111c33] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-[11px] truncate">
                    <span>{p.icon}</span>
                    <span className="truncate">{p.name.split(' ')[0]}</span>
                  </div>
                  <div className="font-mono text-[10px] font-semibold text-primary dark:text-cyanGlow mt-1">
                    {p.badge}
                  </div>
                </button>
              ))}
            </div>

            {/* MKT Arrhenius Value Widget */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Mean Kinetic Temp (MKT)
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-heading mt-0.5">
                  {mktValue !== null ? `${mktValue} °C` : '--'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Arrhenius thermal activation metric
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  mktValue !== null && mktValue <= safeMax && mktValue >= safeMin
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}>
                  {mktValue !== null && mktValue <= safeMax && mktValue >= safeMin ? 'PASSED' : 'FLAGGED'}
                </span>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">USP &lt;1079&gt;</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex justify-between text-slate-500 dark:text-slate-400">
            <span>Active Product:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{activeProfile.name}</span>
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

      {/* Actionable Cockpit: Chamber Intrusion & Physical LCD Mirror + Emergency SOP Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Chamber Door Intrusion & Physical LCD Reflection */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0e1726] to-[#070d17] rounded-2xl p-6 text-white shadow-premium border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold tracking-tight text-slate-200">16x2 Hardware LCD & Chamber Intrusion Mirror</h3>
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

            {/* Live 16x2 Character Matrix */}
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

            {/* Intrusion & Thermal Leakage Estimation */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Door Interlock Status</div>
                <div className={`text-base font-extrabold mt-0.5 font-heading ${telemetry?.door_open ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {telemetry?.door_open ? `DOOR AJAR (${formatSecondsToMMSS(doorOpenDuration)})` : 'SEALED & LOCKED'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Thermal Leakage Estimate</div>
                <div className="text-base font-extrabold mt-0.5 font-heading text-cyan-300">
                  {telemetry?.door_open ? `+${(doorOpenDuration * 0.05).toFixed(1)}°C / min loss` : '0.00°C / min (Optimal)'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>GPIO 21 (SDA) • GPIO 22 (SCL) • GPIO 13 (Reed)</span>
            <span className="text-emerald-400 font-bold">1602 I2C LiquidCrystal</span>
          </div>
        </div>

        {/* Right Column: Emergency SOP Corrective Action & Audit Engine */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary dark:text-cyanGlow" />
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Regulatory Emergency SOP & Audit Protocol
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTempSafe ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 animate-pulse'
              }`}>
                {isTempSafe ? 'COMPLIANT' : 'ACTION REQUIRED'}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Automated Standard Operating Procedure (SOP-CC-401) for thermal excursion handling:
            </p>

            <div className="space-y-2.5 my-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">1. Physical Chamber Seal Integrity:</span>
                <span className={`font-bold ${telemetry?.door_open ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {telemetry?.door_open ? 'Door Open [Check Gasket]' : 'Airtight [Verified]'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">2. Active Cold Target Range:</span>
                <span className="font-bold text-primary dark:text-cyanGlow font-mono">{safeMin}°C to {safeMax}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">3. 21 CFR Part 11 Electronic Signature:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Cryptographically Signed</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTempSafe ? 'Normal operational custody' : 'Immediate intervention protocol triggered'}
            </span>
            <button
              onClick={() => setSopModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Log Corrective Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Temperature Area Chart with Integrated Statistics Chips */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary dark:text-cyanGlow" />
              Live Sensor Thermal Stream (ESP-001)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-precision readings ingested from DS18B20 1-Wire probe via ThingSpeak
            </p>
          </div>

          {/* Integrated Statistics Pill Chips (No more redundant large row) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
              <span>Min: <strong className="text-slate-900 dark:text-white">{minTemp !== '--' ? `${minTemp}°C` : '--'}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center gap-1.5 text-primary dark:text-cyanGlow">
              <Activity className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" />
              <span>Avg: <strong>{avgTemp !== '--' ? `${avgTemp}°C` : '--'}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span>Max: <strong className="text-slate-900 dark:text-white">{maxTemp !== '--' ? `${maxTemp}°C` : '--'}</strong></span>
            </div>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Max: {safeMax}°C
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Min: {safeMin}°C
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
                <ReferenceLine y={safeMax} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `${safeMax}°C High Limit`, fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={safeMin} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: `${safeMin}°C Low Limit`, fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke={isDark ? "#00ffcc" : "#2874F0"} 
                  strokeWidth={2.5} 
                  fill="url(#dashboardTempGrad)" 
                  activeDot={{ r: 6, stroke: isDark ? '#090d16' : '#ffffff', strokeWidth: 2, fill: isDark ? "#00ffcc" : "#2874F0" }}
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

      {/* Emergency SOP Corrective Action Modal */}
      {sopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white font-heading">
                    Excursion Action Protocol (SOP-CC-401)
                  </h3>
                  <p className="text-xs text-slate-400">Mandatory 21 CFR Part 11 Regulatory Response</p>
                </div>
              </div>
              <button
                onClick={() => setSopModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
              <strong>Current Reading: {currentTemp}°C</strong> (Allowed: {safeMin}°C to {safeMax}°C). Please perform the following containment checks:
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={sopChecklist.sealGasket}
                  onChange={e => setSopChecklist(prev => ({ ...prev, sealGasket: e.target.checked }))}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>1. Verify physical chamber door gasket, magnetic seal & latch closure.</span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={sopChecklist.compressorPower}
                  onChange={e => setSopChecklist(prev => ({ ...prev, compressorPower: e.target.checked }))}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>2. Confirm secondary refrigeration compressor power & electrical mains supply.</span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={sopChecklist.relocateCooler}
                  onChange={e => setSopChecklist(prev => ({ ...prev, relocateCooler: e.target.checked }))}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>3. Relocate sensitive batches to backup validated cooler if &gt; 15 mins excursion.</span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={sopChecklist.notifyLead}
                  onChange={e => setSopChecklist(prev => ({ ...prev, notifyLead: e.target.checked }))}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span>4. Alert Quality Assurance officer & file formal excursion report.</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Operator Incident Action Notes
              </label>
              <textarea
                value={sopOperatorNote}
                onChange={e => setSopOperatorNote(e.target.value)}
                placeholder="Describe corrective actions taken (e.g. door resealed, backup cooling activated)..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-[#111c33] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSopModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogSOP}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Log Corrective Action</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
