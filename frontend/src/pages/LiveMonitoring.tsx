import { useState, useEffect } from 'react';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck
} from 'lucide-react';

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

export default function LiveMonitoring() {
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
    }, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return 'Never';
    if (seconds < 15) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Activity className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-600 font-bold text-base tracking-tight font-heading">Connecting to Real-Time Oscilloscope Stream...</p>
        <p className="text-xs text-slate-400">ThingSpeak Channel 3483882 Feed Buffer</p>
      </div>
    );
  }

  const isOnline = telemetry?.status === 'ONLINE';
  const hasTelemetry = telemetry && telemetry.current_temp !== null;
  const currentTemp = telemetry?.current_temp ?? null;
  const isTempSafe = currentTemp !== null && currentTemp >= 2.0 && currentTemp <= 8.0;

  // Compute live readings statistics
  const readingValues = telemetry?.readings.map(r => r.temp) || [];
  const minTemp = readingValues.length ? Math.min(...readingValues) : (currentTemp ?? '--');
  const maxTemp = readingValues.length ? Math.max(...readingValues) : (currentTemp ?? '--');
  const avgTemp = readingValues.length 
    ? (readingValues.reduce((a, b) => a + b, 0) / readingValues.length).toFixed(2) 
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
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-premium border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Live Oscilloscope & Hardware Stream
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              {isOnline ? 'LIVE FEED' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time feed from physical ESP32 node via ThingSpeak Channel 3483882
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto bg-gradient-to-r from-slate-50 to-slate-100 hover:from-white hover:to-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* State Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-semibold shadow-sm animate-shake">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && !isOnline && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 text-amber-900 p-4 rounded-xl flex items-center gap-3 font-medium shadow-sm">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <span>ESP-001 is offline. Listening for fresh transmissions from ThingSpeak Channel 3483882...</span>
        </div>
      )}

      {/* Live Sensor Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real-time Values & 16x2 LCD Mirror */}
        <div className="space-y-6">
          {/* Real-time Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-premium p-6 space-y-6">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary animate-pulse" /> Live Telemetry Probe
            </h2>

            {/* Current Temperature */}
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl shadow-sm transition-transform hover:scale-105 ${
                hasTelemetry 
                  ? (isTempSafe ? 'bg-blue-50 text-primary border border-blue-200' : 'bg-amber-50 text-amber-600 border border-amber-200') 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <Thermometer className="w-8 h-8" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">DS18B20 Reading</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                  {hasTelemetry ? `${currentTemp} °C` : '--'}
                </div>
                <div className="text-xs font-semibold mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-md ${
                    isTempSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isTempSafe ? 'Safe Band (2-8°C)' : 'Thermal Excursion'}
                  </span>
                </div>
              </div>
            </div>

            {/* Door Status */}
            <div className="flex items-center gap-5 pt-4 border-t border-slate-100">
              <div className={`p-4 rounded-2xl shadow-sm transition-transform hover:scale-105 ${
                hasTelemetry
                  ? (telemetry.door_open ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {hasTelemetry && telemetry.door_open ? (
                  <DoorOpen className="w-8 h-8 animate-pulse" />
                ) : (
                  <DoorClosed className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reed Switch (GPIO 13)</div>
                <div className={`text-3xl font-extrabold tracking-tight font-heading ${
                  hasTelemetry
                    ? (telemetry.door_open ? 'text-red-600' : 'text-emerald-600')
                    : 'text-slate-400'
                }`}>
                  {hasTelemetry ? telemetry.door_status : '--'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {telemetry?.door_open ? 'Door Open Alert Active' : 'Chamber Secured'}
                </div>
              </div>
            </div>

            {/* Hardware Heartbeat */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last Updated: <strong className="text-slate-700">{formatLastUpdated(telemetry?.last_updated_seconds_ago ?? null)}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> ONLINE
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" /> OFFLINE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 16x2 LCD Hardware Mirror */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl border border-slate-700/80 shadow-premium p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" /> Physical 16x2 LCD Mirror
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                0x27 I2C Active
              </span>
            </div>

            {/* LCD Screen Simulation */}
            <div className="p-4 rounded-xl lcd-screen-container">
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

            <div className="text-[11px] text-slate-400 mt-3 flex justify-between items-center">
              <span>HD44780 LCD Controller</span>
              <span className="text-emerald-400 font-semibold">Real-Time Sync</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Area Chart & Telemetry Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-premium p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Real-Time Oscilloscope Stream
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">DS18B20 readings from ThingSpeak Channel 3483882 (Field 1)</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Max: 8.0°C
                </span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Min: 2.0°C
                </span>
              </div>
            </div>

            {telemetry && telemetry.readings && telemetry.readings.length > 0 ? (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry.readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="liveTempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2874F0" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2874F0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} unit="°C" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(val: any) => [`${val} °C`, 'Temperature']}
                    />
                    <ReferenceLine y={8.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '8°C', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                    <ReferenceLine y={2.0} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: '2°C', fill: '#3b82f6', fontSize: 10, position: 'right' }} />
                    <Area type="monotone" dataKey="temp" stroke="#2874F0" strokeWidth={2.5} fill="url(#liveTempGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Thermometer className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-semibold text-sm">No telemetry received yet.</p>
                <p className="text-xs text-slate-400 mt-1">Live data will stream automatically when received.</p>
              </div>
            )}

            {/* Computed Stream Statistics */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingDown className="w-3 h-3 text-blue-500" /> Min Temp
                </span>
                <p className="text-lg font-bold text-slate-800 mt-0.5 font-heading">
                  {minTemp !== '--' ? `${minTemp} °C` : '--'}
                </p>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center justify-center gap-1">
                  <Activity className="w-3 h-3 text-primary" /> Mean Temp
                </span>
                <p className="text-lg font-bold text-slate-800 mt-0.5 font-heading">
                  {avgTemp !== '--' ? `${avgTemp} °C` : '--'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-500" /> Max Temp
                </span>
                <p className="text-lg font-bold text-slate-800 mt-0.5 font-heading">
                  {maxTemp !== '--' ? `${maxTemp} °C` : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Hardware Specs & Channel Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-premium p-6">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Cold Chain Node Architecture
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[11px]">Device Identifier</div>
                <div className="text-slate-800 font-extrabold mt-1 text-sm font-heading">ESP-001</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[11px]">ESP32 MAC</div>
                <div className="text-slate-800 font-bold mt-1 font-mono text-[11px]">04:b2:47:54:b1:88</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[11px]">ThingSpeak Channel</div>
                <div className="text-slate-800 font-bold mt-1 font-mono text-sm text-primary">3483882</div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[11px]">Firmware Build</div>
                <div className="text-slate-800 font-bold mt-1 text-sm">v1.0.0 Production</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
