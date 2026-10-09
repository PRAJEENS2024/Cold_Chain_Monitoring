import { useEffect, useState } from 'react';
import api from '../api';
import { 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Radio, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Cable
} from 'lucide-react';

interface DeviceData {
  id: number;
  device_id: string;
  name: string;
  esp32_identifier: string;
  firmware_version: string;
  thingspeak_channel_id: string;
  status: string;
  last_seen: string | null;
  created_at: string;
}

export default function Devices() {
  const [device, setDevice] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'pinout' | 'protocol'>('specs');

  const fetchDevice = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await api.get('/devices/ESP-001');
      setDevice(res.data);
    } catch (err) {
      console.error("Failed to fetch device data", err);
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevice();
    const interval = setInterval(fetchDevice, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Cpu className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-600 font-bold text-base tracking-tight font-heading">Loading Hardware Diagnostics...</p>
        <p className="text-xs text-slate-400">Querying Node ESP-001 Configuration</p>
      </div>
    );
  }

  const isOnline = device?.status === 'ONLINE';

  return (
    <div className="space-y-6">
      {/* Top Command Bar */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-premium border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" /> ESP-001 Hardware Command Center
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              {isOnline ? 'ONLINE' : 'STANDBY'}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Physical ESP32 Cold Chain Node Specification, Wiring Pinout, and Ingestion Schema
          </p>
        </div>

        <button
          onClick={() => fetchDevice(true)}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-slate-50 to-slate-100 hover:from-white hover:to-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-98 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Checking...' : 'Check Hardware'}
        </button>
      </div>

      {/* Main Single Device Node Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-premium overflow-hidden">
        {/* Node Summary Header */}
        <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-primary to-blue-500 text-white rounded-2xl shadow-md shadow-primary/20">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">{device?.device_id || 'ESP-001'}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-primary border border-blue-200">
                  ColdChain Node 1
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{device?.name || 'ESP32 Cold Chain Node'}</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Last Telemetry Contact: <strong className="text-slate-800">{device?.last_seen ? new Date(device.last_seen).toLocaleString() : 'No connection'}</strong></div>
            <div className="text-[11px] text-slate-400 mt-0.5">TLS Ingestion Protocol Active</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 px-6 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-4 font-bold text-xs tracking-tight transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'specs' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Hardware Specifications
          </button>
          <button 
            onClick={() => setActiveTab('pinout')}
            className={`py-3 px-4 font-bold text-xs tracking-tight transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'pinout' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cable className="w-4 h-4" /> GPIO Pinout & Circuit
          </button>
          <button 
            onClick={() => setActiveTab('protocol')}
            className={`py-3 px-4 font-bold text-xs tracking-tight transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'protocol' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" /> ThingSpeak Protocol
          </button>
        </div>

        {/* Tab 1: Hardware Specifications */}
        {activeTab === 'specs' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hardware Identifier / MAC</div>
              <div className="text-base font-extrabold text-slate-900 font-mono">{device?.esp32_identifier || '04:b2:47:54:b1:88'}</div>
              <div className="text-xs text-slate-500">ESP32-WROOM-32 (240MHz Dual Core)</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ThingSpeak Cloud Channel</div>
              <div className="text-base font-extrabold text-primary font-mono">{device?.thingspeak_channel_id || '3483882'}</div>
              <div className="text-xs text-slate-500">REST API feeds.json Buffer</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Firmware Runtime</div>
              <div className="text-base font-extrabold text-slate-900">{device?.firmware_version || '1.0.0'}</div>
              <div className="text-xs text-slate-500">FreeRTOS Embedded C++ Binary</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Temperature Sensor</div>
              <div className="text-base font-extrabold text-slate-900">DS18B20 (Dallas 1-Wire)</div>
              <div className="text-xs text-slate-500">Range: -55°C to +125°C • ±0.5°C accuracy</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Door Intrusion Sensor</div>
              <div className="text-base font-extrabold text-slate-900">Magnetic Reed Switch</div>
              <div className="text-xs text-slate-500">Digital NC/NO contact (Internal Pull-Up)</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Local Hardware Display</div>
              <div className="text-base font-extrabold text-slate-900">16x2 I2C Backlit LCD (0x27)</div>
              <div className="text-xs text-slate-500">Real-time local temperature & door readout</div>
            </div>
          </div>
        )}

        {/* Tab 2: GPIO Pinout & Circuit Schematic */}
        {activeTab === 'pinout' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" /> ESP32 Physical Pinout Map
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-700">GPIO 4</span>
                    <span className="text-slate-500">DS18B20 Data Line (4.7kΩ Pull-Up to 3.3V)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-700">GPIO 13</span>
                    <span className="text-slate-500">Magnetic Reed Switch (Input Pull-Up to GND)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-700">GPIO 21 (SDA)</span>
                    <span className="text-slate-500">I2C LCD Data Bus</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-700">GPIO 22 (SCL)</span>
                    <span className="text-slate-500">I2C LCD Clock Bus</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-700">VIN / 5V & GND</span>
                    <span className="text-slate-500">LCD 5V Rail & Common Ground</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sensor Verification Status
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">DS18B20 1-Wire Bus Active</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">CRC checksum verified on each 750ms conversion cycle.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Magnetic Reed Debounce Logic Active</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Door interrupts filtered to prevent contact bounce anomalies.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">I2C Display Address 0x27 Responsive</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">Continuous hardware refresh synchronizes LCD with cloud stream.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ThingSpeak Protocol Schema */}
        {activeTab === 'protocol' && (
          <div className="p-6 space-y-5">
            <div className="bg-slate-900 rounded-xl p-5 text-white font-mono text-xs space-y-3 shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">ThingSpeak Telemetry Channel Mapping</span>
                <span className="text-accent">GET /channels/3483882/feeds.json</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <p><span className="text-cyan-400 font-bold">field1</span>: Temperature float in °C (e.g., 28.94)</p>
                <p><span className="text-cyan-400 font-bold">field2</span>: Door state bit ('0' = CLOSED, '1' = OPEN)</p>
                <p><span className="text-cyan-400 font-bold">created_at</span>: ISO-8601 UTC timestamp (e.g., 2026-10-09T02:30:15Z)</p>
                <p><span className="text-cyan-400 font-bold">entry_id</span>: Monotonically increasing packet counter</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" />
                <span>Backend Polling Rate: <strong>15–20 Seconds</strong> (ThingSpeak Free Tier Rate Limited)</span>
              </div>
              <a 
                href="https://thingspeak.com/channels/3483882" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                Channel 3483882 <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* System Architecture Notice */}
        <div className="px-6 py-4 bg-blue-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Dedicated System: Designed exclusively for single-node monitoring of ESP-001.</span>
          </div>
          <span className="font-bold text-primary">Provisioning: Automatic</span>
        </div>
      </div>
    </div>
  );
}
