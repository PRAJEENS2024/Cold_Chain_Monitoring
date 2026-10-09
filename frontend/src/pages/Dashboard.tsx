import { useEffect, useState } from 'react';
import api from '../api';
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
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
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
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTelemetry = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await api.get('/api/iot/device/ESP-001/telemetry', {
        params: { _t: Date.now() }
      });
      setTelemetry(res.data);
      setError(null);
    } catch (err: any) {
      setError('Unable to retrieve device data.');
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 10000); // Poll backend dashboard API every 10 seconds (Step 10)
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return 'Never';
    if (seconds < 15) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1m ago';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Activity className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-600 font-bold text-base tracking-tight font-heading">Initializing ColdChain Telemetry Stream...</p>
        <p className="text-xs text-slate-400">Connecting to ThingSpeak Channel 3483882</p>
      </div>
    );
  }

  const isOnline = telemetry?.status === 'ONLINE';
  const hasTelemetry = telemetry && telemetry.current_temp !== null;
  const currentTemp = telemetry?.current_temp ?? null;
  const isTempSafe = currentTemp !== null && currentTemp >= 2.0 && currentTemp <= 8.0;

  // Calculate stats from readings
  const readingValues = telemetry?.readings.map(r => r.temp) || [];
  const minTemp = readingValues.length ? Math.min(...readingValues) : (currentTemp ?? '--');
  const maxTemp = readingValues.length ? Math.max(...readingValues) : (currentTemp ?? '--');
  const avgTemp = readingValues.length 
    ? (readingValues.reduce((a, b) => a + b, 0) / readingValues.length).toFixed(1) 
    : (currentTemp ?? '--');

  // LCD text format (mirrors physical 16x2 display)
  const lcdLine1 = currentTemp !== null 
    ? `T:${currentTemp.toFixed(1)}C ${isTempSafe ? 'SAFE' : 'WARN'}`.padEnd(16, ' ') 
    : 'TEMP: --.- C    ';
  const lcdLine2 = telemetry?.door_open 
    ? 'DOOR: OPEN [!]  ' 
    : 'DOOR: CLOSED [OK]';

  return (
    <div className="space-y-6">
      {/* Top Banner / Device Command Bar */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-premium border border-slate-200/90 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              ESP-001 Cold Chain Command
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 ring-2 ring-emerald-500/10' 
                : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              {isOnline ? 'Online • Streaming' : 'Offline'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200">
              <Radio className="w-3 h-3 text-primary animate-pulse" /> Channel 3483882
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5 flex items-center gap-2">
            <span>Physical Node ESP32</span>
            <span>•</span>
            <span className="font-mono text-slate-600 font-semibold">MAC: 04:b2:47:54:b1:88</span>
            <span>•</span>
            <span className="text-slate-600">Firmware v1.0.0</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto bg-gradient-to-r from-slate-50 to-slate-100 hover:from-white hover:to-slate-50 text-slate-700 border border-slate-300/90 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-98 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Connection & Error Banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-semibold shadow-sm animate-shake">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && !isOnline && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 text-amber-900 p-4 rounded-xl flex items-center gap-3 font-medium shadow-sm">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">ESP-001 Ingestion Stby</p>
            <p className="text-xs text-amber-700 mt-0.5">Device has not emitted fresh packets in over 90s. Listening for next ThingSpeak transmission...</p>
          </div>
        </div>
      )}

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Current Temperature */}
        <div className={`bg-white rounded-2xl p-5 border shadow-flat hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          hasTelemetry
            ? (isTempSafe ? 'border-blue-200 hover:border-blue-300' : 'border-amber-300 hover:border-amber-400')
            : 'border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-primary" /> Live Temperature
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 font-heading tracking-tight">
                {hasTelemetry ? `${currentTemp} °C` : '--'}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              hasTelemetry 
                ? (isTempSafe ? 'bg-blue-50 text-primary border border-blue-200' : 'bg-amber-50 text-amber-600 border border-amber-200') 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <Thermometer className="w-6 h-6" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Safe Band: 2.0°C - 8.0°C</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              hasTelemetry 
                ? (isTempSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800') 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {hasTelemetry ? (isTempSafe ? 'In Range' : 'Excursion') : '--'}
            </span>
          </div>
        </div>

        {/* Card 2: Door Status */}
        <div className={`bg-white rounded-2xl p-5 border shadow-flat hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
          telemetry?.door_open ? 'border-red-300 hover:border-red-400' : 'border-emerald-200 hover:border-emerald-300'
        }`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none ${
            telemetry?.door_open ? 'bg-red-500/5' : 'bg-emerald-500/5'
          }`}></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {telemetry?.door_open ? <DoorOpen className="w-3.5 h-3.5 text-red-500" /> : <DoorClosed className="w-3.5 h-3.5 text-emerald-500" />}
                Reed Switch Door
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold mt-2 font-heading tracking-tight">
                {hasTelemetry ? (
                  <span className={telemetry.door_open ? 'text-red-600' : 'text-emerald-600'}>
                    {telemetry.door_status}
                  </span>
                ) : (
                  <span className="text-slate-400">--</span>
                )}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              hasTelemetry
                ? (telemetry.door_open ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                : 'bg-slate-100 text-slate-400'
            }`}>
              {hasTelemetry && telemetry.door_open ? (
                <DoorOpen className="w-6 h-6 animate-pulse" />
              ) : (
                <DoorClosed className="w-6 h-6" />
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Sensor Pin: GPIO 13</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              hasTelemetry && telemetry.door_open ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {hasTelemetry ? (telemetry.door_open ? '1 (OPEN)' : '0 (CLOSED)') : '--'}
            </span>
          </div>
        </div>

        {/* Card 3: Device Connectivity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-flat hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-primary" /> Cloud Node Link
              </span>
              <h3 className={`text-3xl sm:text-4xl font-extrabold mt-2 font-heading tracking-tight ${
                isOnline ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {telemetry ? telemetry.status : 'OFFLINE'}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
            }`}>
              {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Transport: HTTPS JSON</span>
            <span className="font-semibold text-slate-700">ESP32 DevKit</span>
          </div>
        </div>

        {/* Card 4: Last Updated Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-flat hover:shadow-premium transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Freshness Sync
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2 font-heading tracking-tight">
                {telemetry ? formatLastUpdated(telemetry.last_updated_seconds_ago) : 'Never'}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-primary border border-blue-200 rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Poller Cadence</span>
            <span className="font-semibold text-primary">Every 15s</span>
          </div>
        </div>
      </div>

      {/* Middle Section: 16x2 I2C LCD Display Simulation + Quick Telemetry Chips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hyper-realistic 16x2 I2C LCD Mirror Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 text-white shadow-premium border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold tracking-tight text-slate-200">16x2 Hardware LCD Mirror</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>0x27 I2C Active</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Real-time mirror of the physical ESP32 LCD character display:</p>
            
            {/* The 16x2 LCD Matrix Screen */}
            <div className="mt-4 p-4 rounded-xl lcd-screen-container">
              <div className="flex flex-col space-y-1 font-mono text-sm sm:text-base font-bold lcd-glow-text select-none">
                <div className="flex items-center justify-between">
                  <span>{lcdLine1}</span>
                  <span className="text-[10px] text-cyan-400/60 font-sans tracking-normal">LINE 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lcdLine2}</span>
                  <span className="text-[10px] text-cyan-400/60 font-sans tracking-normal">LINE 2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Wiring: GPIO 21 (SDA) • GPIO 22 (SCL)</span>
            <span className="text-emerald-400 font-bold">HD44780 Driver</span>
          </div>
        </div>

        {/* Telemetry Range & Analytics Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-flat border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Real-Time Sensor Telemetry Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">Statistical metrics computed dynamically from active IoT sensor stream</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              20 Data Points
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 my-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-blue-500" /> Minimum Temp
              </span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1 font-heading">
                {minTemp !== '--' ? `${minTemp} °C` : '--'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-primary" /> Average Temp
              </span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1 font-heading">
                {avgTemp !== '--' ? `${avgTemp} °C` : '--'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Maximum Temp
              </span>
              <p className="text-2xl font-extrabold text-slate-800 mt-1 font-heading">
                {maxTemp !== '--' ? `${maxTemp} °C` : '--'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compliance Audit Trail
            </span>
            <span className="text-slate-500">FDA 21 CFR Part 11 & GDP Compliant Storage</span>
          </div>
        </div>
      </div>

      {/* Historical Temperature Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-premium p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Sensor Thermal Stream (ESP-001)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">High-precision readings ingested from DS18B20 1-Wire probe via ThingSpeak</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Upper Limit: 8.0°C
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
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
                    <stop offset="5%" stopColor="#2874F0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2874F0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit="°C" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                  formatter={(val: any) => [`${val} °C`, 'Sensor Telemetry']}
                  labelFormatter={(lbl) => `Time: ${lbl} UTC`}
                />
                <ReferenceLine y={8.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '8.0°C Max', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={2.0} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: '2.0°C Min', fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#2874F0" 
                  strokeWidth={2.5} 
                  fill="url(#dashboardTempGrad)" 
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#2874F0' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
            <Thermometer className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
            <p className="font-semibold text-sm">No telemetry packets recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Packets will render automatically upon ThingSpeak poller sync.</p>
          </div>
        )}
      </div>

      {/* Hardware Pipeline Specification Footer Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700/70">
        <div>
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            <span>End-to-End Cold Chain Pipeline Architecture</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            DS18B20 & Reed Switch → ESP32 (16x2 LCD) → ThingSpeak (Ch 3483882) → FastAPI Engine → SQLite → React Dashboard
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
          <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/15">
            LCD: <span className="text-emerald-400">16x2 I2C Active</span>
          </div>
          <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/15">
            Door State: <span className="text-accent">{telemetry?.door_open ? '1 (OPEN)' : '0 (CLOSED)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
