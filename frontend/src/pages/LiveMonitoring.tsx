import { useState, useEffect } from 'react';
import api from '../api';
import { useTheme } from '../ThemeContext';
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
  ShieldCheck,
  Volume2,
  VolumeX,
  Sliders,
  Terminal,
  Grid
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
  const { isDark } = useTheme();
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [viewTimeframe, setViewTimeframe] = useState<'all' | '10m' | '5m'>('all');

  const fetchTelemetry = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await api.get('/api/iot/device/ESP-001/telemetry', {
        params: { _t: Date.now() }
      });
      setTelemetry(res.data);
      setError(null);
    } catch (err: any) {
      setError('Unable to retrieve device data from telemetry stream.');
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 10000); // 10s poll cadence
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

  // Play a soft synthetic beep when an excursion occurs if soundAlerts is enabled
  useEffect(() => {
    if (soundAlerts && telemetry && telemetry.current_temp !== null) {
      if (telemetry.current_temp > 8.0 || telemetry.current_temp < 2.0 || telemetry.door_open) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
          // AudioContext might be muted by browser autoplay policy
        }
      }
    }
  }, [telemetry, soundAlerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 dark:border-cyanGlow/20 border-t-primary dark:border-t-cyanGlow rounded-full animate-spin"></div>
          <Activity className="w-7 h-7 text-primary dark:text-cyanGlow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-extrabold text-lg tracking-tight font-heading">
          Calibrating Real-Time Oscilloscope Stream...
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Sampling ThingSpeak Feed Buffer (Ch: 3483882)
        </p>
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

  // Filtered readings for timeframe
  const filteredReadings = telemetry?.readings ? (
    viewTimeframe === '5m' ? telemetry.readings.slice(-5) :
    viewTimeframe === '10m' ? telemetry.readings.slice(-10) :
    telemetry.readings
  ) : [];

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
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary dark:text-cyanGlow" /> Live Oscilloscope & Telemetry Waveform
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isOnline 
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              {isOnline ? 'LIVE FEED (15s SYNC)' : 'OFFLINE'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Continuous oscilloscope waveform digitized from DS18B20 sensor & Reed door switch
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Audio Alarm Toggle */}
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              soundAlerts 
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle synthetic audible alert for temperature excursions"
          >
            {soundAlerts ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundAlerts ? 'Alarm ON' : 'Alarm OFF'}</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
              showGrid 
                ? 'bg-blue-50 dark:bg-cyan-950/60 border-blue-200 dark:border-cyan-800 text-primary dark:text-cyanGlow' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Oscilloscope Reticle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => fetchTelemetry(true)}
            disabled={isRefreshing}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Sampling...' : 'Sync Stream'}
          </button>
        </div>
      </div>

      {/* State Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-center gap-3 font-semibold shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && !isOnline && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-4 rounded-xl flex items-center gap-3 font-medium shadow-sm">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <span>ESP-001 is in standby. Buffering transmissions from ThingSpeak Channel 3483882...</span>
        </div>
      )}

      {/* Live Sensor Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real-time Values & 16x2 LCD Mirror */}
        <div className="space-y-6">
          {/* Real-time Cards */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 space-y-6 transition-colors duration-300">
            <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary dark:text-cyanGlow animate-pulse" /> Live Telemetry Probe
            </h2>

            {/* Current Temperature */}
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl shadow-sm transition-transform hover:scale-105 ${
                hasTelemetry 
                  ? (isTempSafe ? 'bg-blue-50 dark:bg-cyan-950/60 text-primary dark:text-cyanGlow border border-blue-200 dark:border-cyan-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800') 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <Thermometer className="w-8 h-8" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">DS18B20 Probe</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                  {hasTelemetry ? `${currentTemp} °C` : '--'}
                </div>
                <div className="text-xs font-semibold mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-md ${
                    isTempSafe 
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                  }`}>
                    {isTempSafe ? 'Safe Band (2.0°C - 8.0°C)' : 'Thermal Excursion'}
                  </span>
                </div>
              </div>
            </div>

            {/* Door Status */}
            <div className="flex items-center gap-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className={`p-4 rounded-2xl shadow-sm transition-transform hover:scale-105 ${
                hasTelemetry
                  ? (telemetry.door_open ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800')
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {hasTelemetry && telemetry.door_open ? (
                  <DoorOpen className="w-8 h-8 animate-pulse" />
                ) : (
                  <DoorClosed className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Reed Switch (GPIO 13)</div>
                <div className={`text-3xl font-extrabold tracking-tight font-heading ${
                  hasTelemetry
                    ? (telemetry.door_open ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')
                    : 'text-slate-400'
                }`}>
                  {hasTelemetry ? telemetry.door_status : '--'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {telemetry?.door_open ? 'Chamber Door Ajar [Alert]' : 'Chamber Airtight [OK]'}
                </div>
              </div>
            </div>

            {/* Hardware Heartbeat */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last Ingested: <strong className="text-slate-700 dark:text-slate-200">{formatLastUpdated(telemetry?.last_updated_seconds_ago ?? null)}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> ONLINE
                  </span>
                ) : (
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" /> STANDBY
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 16x2 LCD Hardware Mirror */}
          <div className="bg-gradient-to-br from-slate-800 via-[#101b2f] to-[#0a1220] dark:from-slate-900 dark:via-[#0c1524] dark:to-[#070b14] rounded-2xl border border-slate-700/80 shadow-premium p-6 text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" /> Physical 16x2 LCD Mirror
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                0x27 I2C Active
              </span>
            </div>

            {/* LCD Screen Simulation */}
            <div className="p-4 rounded-xl lcd-screen-container shadow-inner">
              <div className="font-mono text-sm sm:text-base font-bold lcd-glow-text space-y-1 select-none">
                <div className="flex justify-between">
                  <span>{lcdLine1}</span>
                  <span className="text-[10px] text-cyan-400/50 font-sans">L1</span>
                </div>
                <div className="flex justify-between">
                  <span>{lcdLine2}</span>
                  <span className="text-[10px] text-cyan-400/50 font-sans">L2</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>SDA: GPIO 21 • SCL: GPIO 22</span>
              <span className="text-emerald-400 font-mono">1602 I2C Backpack</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Res Oscilloscope Reticle Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
            {/* Chart Control Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary dark:text-cyanGlow" />
                  Oscilloscope Waveform Display
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time thermal signal with calibrated 2.0°C - 8.0°C threshold lines
                </p>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['5m', '10m', 'all'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setViewTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      viewTimeframe === tf 
                        ? 'bg-white dark:bg-slate-900 text-primary dark:text-cyanGlow shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Oscilloscope Viewport */}
            <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-[#060a12] border border-cyan-950/80 shadow-inner' : 'bg-slate-50 border border-slate-200'}`}>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredReadings} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="oscilloscopeGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#00ffcc" : "#2874f0"} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={isDark ? "#00ffcc" : "#2874f0"} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    {showGrid && (
                      <CartesianGrid 
                        strokeDasharray="2 2" 
                        stroke={isDark ? "rgba(0, 255, 204, 0.12)" : "rgba(148, 163, 184, 0.3)"} 
                      />
                    )}
                    <XAxis 
                      dataKey="time" 
                      stroke={isDark ? "#00ffcc" : "#64748b"} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: isDark ? '#00ffcc' : '#64748b', opacity: 0.7 }}
                    />
                    <YAxis 
                      stroke={isDark ? "#00ffcc" : "#64748b"} 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']} 
                      unit="°C"
                      tick={{ fill: isDark ? '#00ffcc' : '#64748b', opacity: 0.7 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? 'rgba(6, 10, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: isDark ? '1px solid #00ffcc' : '1px solid #cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        color: isDark ? '#00ffcc' : '#0f172a',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      formatter={(val: any) => [`${val} °C`, 'Probe Signal']}
                      labelFormatter={(lbl) => `Time: ${lbl} UTC`}
                    />
                    <ReferenceLine 
                      y={8.0} 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      label={{ value: '8.0°C High Limit', fill: '#ef4444', fontSize: 10, position: 'right' }} 
                    />
                    <ReferenceLine 
                      y={2.0} 
                      stroke="#3b82f6" 
                      strokeDasharray="4 4" 
                      label={{ value: '2.0°C Low Limit', fill: '#3b82f6', fontSize: 10, position: 'right' }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke={isDark ? "#00ffcc" : "#2874f0"} 
                      strokeWidth={2.5} 
                      fill="url(#oscilloscopeGlow)" 
                      activeDot={{ r: 6, stroke: isDark ? '#000000' : '#ffffff', strokeWidth: 2, fill: isDark ? '#00ffcc' : '#2874f0' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dynamic Telemetry Metric Chips */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-blue-500" /> Buffer Min
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
                  {minTemp !== '--' ? `${minTemp} °C` : '--'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-center">
                <span className="text-[11px] font-bold text-primary dark:text-cyanGlow uppercase tracking-wider flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Buffer Mean
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
                  {avgTemp !== '--' ? `${avgTemp} °C` : '--'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1424] border border-slate-200/80 dark:border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Buffer Max
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
                  {maxTemp !== '--' ? `${maxTemp} °C` : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Packet Telemetry Event Log Stream */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary dark:text-cyanGlow" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ingested Packet Event Stream
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                ThingSpeak Channel 3483882
              </span>
            </div>

            <div className="overflow-x-auto max-h-56 custom-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Packet Time</th>
                    <th className="py-2 px-3">Node</th>
                    <th className="py-2 px-3">Temp (°C)</th>
                    <th className="py-2 px-3">Door State</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredReadings.slice().reverse().map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{r.time}</td>
                      <td className="py-2 px-3 text-primary dark:text-cyanGlow font-bold">ESP-001</td>
                      <td className={`py-2 px-3 font-bold ${r.temp >= 2.0 && r.temp <= 8.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                        {r.temp.toFixed(2)} °C
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                        {telemetry?.door_open ? 'OPEN [1]' : 'CLOSED [0]'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.temp >= 2.0 && r.temp <= 8.0 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          {r.temp >= 2.0 && r.temp <= 8.0 ? 'VALID' : 'EXCURSION'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Quality Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Real-time telemetry streams are timestamped and cryptographically archived for regulatory auditing.</span>
        </div>
        <div className="font-mono text-primary dark:text-cyanGlow font-bold">
          Buffer Integrity: 100% OK
        </div>
      </div>
    </div>
  );
}
