import React, { useState, useEffect } from 'react';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, Square, Thermometer, DoorOpen, DoorClosed, Activity, AlertTriangle } from 'lucide-react';

export default function LiveMonitoring() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [simStatus, setSimStatus] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]); // For chart

  const [telemetry, setTelemetry] = useState<any>(null); // For real DB state

  const fetchShipments = async () => {
    const res = await api.get('/shipments');
    setShipments(res.data);
    if (res.data.length > 0 && !selectedShipment) {
      setSelectedShipment(res.data[0]);
    }
  };

  const selectedShipmentRef = React.useRef(selectedShipment);
  useEffect(() => {
    selectedShipmentRef.current = selectedShipment;
  }, [selectedShipment]);

  const fetchTelemetry = async () => {
    const currentShipment = selectedShipmentRef.current;
    if (!currentShipment) return;
    try {
      const res = await api.get(`/api/iot/shipment/${currentShipment.id}/telemetry`);
      setTelemetry(res.data);
      if (res.data.readings) {
        setReadings(res.data.readings);
      }
    } catch (e) {}
  };

  const fetchSimStatus = async () => {
    try {
      const res = await api.get('/simulator/status');
      setSimStatus(res.data);
    } catch (e) {}
  };

  const fetchPrediction = async () => {
    const currentShipment = selectedShipmentRef.current;
    if (!currentShipment) return;
    try {
      const res = await api.get(`/analytics/shipment/${currentShipment.id}/prediction`);
      if (res.data.status === 'success') {
        setPrediction(res.data);
      } else {
        setPrediction(null);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    fetchSimStatus();
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchSimStatus();
      fetchTelemetry();
      fetchPrediction();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimAction = async (action: string, payload?: any) => {
    try {
      if (action === 'start') await api.post('/simulator/start');
      else if (action === 'stop') await api.post('/simulator/stop');
      else if (action === 'set_shipment') await api.post(`/simulator/set-shipment/${payload}`);
      else if (action === 'scenario') await api.post(`/simulator/scenario/${payload}`);
      fetchSimStatus();
    } catch (e) {
      console.error(e);
      alert("Error executing simulator command. Did you assign a device to the shipment?");
    }
  };

  const getSimColor = () => simStatus?.is_running ? 'bg-green-500' : 'bg-slate-300';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Monitoring</h1>
          <p className="text-slate-500">Real-time telemetry and predictive analytics</p>
        </div>
        <div>
          <select 
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-700 shadow-sm focus:outline-none focus:border-primary"
            value={selectedShipment?.id || ''}
            onChange={(e) => {
              const ship = shipments.find(s => s.id === parseInt(e.target.value));
              setSelectedShipment(ship);
              setReadings([]);
              if (ship) handleSimAction('set_shipment', ship.id);
            }}
          >
            <option value="" disabled>Select Shipment</option>
            {shipments.map(s => (
              <option key={s.id} value={s.id}>{s.shipment_id} - {s.product_name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedShipment ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          Please select a shipment to monitor.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="text-primary w-5 h-5" /> Temperature History
                </h2>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <div className="text-red-500 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> Max: {selectedShipment.temp_max}°C</div>
                  <div className="text-blue-500 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Min: {selectedShipment.temp_min}°C</div>
                </div>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readings}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[selectedShipment.temp_min - 5, selectedShipment.temp_max + 5]} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <ReferenceLine y={selectedShipment.temp_max} stroke="#ef4444" strokeDasharray="4 4" opacity={0.5} />
                    <ReferenceLine y={selectedShipment.temp_min} stroke="#3b82f6" strokeDasharray="4 4" opacity={0.5} />
                    <Area type="monotone" dataKey="temp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5', style: { filter: 'drop-shadow(0px 0px 5px rgba(79,70,229,0.8))' } }} animationDuration={500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-slate-900 rounded-2xl shadow-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                 <AlertTriangle className="text-amber-400 w-5 h-5" /> AI Predictive Analytics
               </h2>
               {prediction ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                   <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-xl border border-slate-700">
                     <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Predicted Temp (Next {prediction.prediction_horizon})</div>
                     <div className={`text-3xl font-extrabold tracking-tight ${prediction.risk === 'HIGH' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-white'}`}>
                       {prediction.predicted_temp}°C
                     </div>
                   </div>
                   <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-xl border border-slate-700">
                     <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Current Trend</div>
                     <div className="text-3xl font-extrabold tracking-tight text-white">
                       {prediction.trend}
                     </div>
                   </div>
                   <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-xl border border-slate-700">
                     <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-2">Risk Level</div>
                     <div className={`text-3xl font-extrabold tracking-tight ${prediction.risk === 'HIGH' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : (prediction.risk === 'MEDIUM' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]')}`}>
                       {prediction.risk}
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-slate-400 text-sm relative z-10 italic">Waiting for sufficient telemetry data to generate AI predictions...</div>
               )}
            </div>
          </div>

          {/* Right Sidebar - Status & Simulator */}
          <div className="space-y-6">
            
            {/* Current Status */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Current Readings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-50 text-primary rounded-xl relative">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <Thermometer className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Temperature</div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{telemetry?.current_temp ?? simStatus?.current_temp ?? '--'}°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-xl relative ${(telemetry?.door_open ?? simStatus?.door_open) ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${(telemetry?.door_open ?? simStatus?.door_open) ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${(telemetry?.door_open ?? simStatus?.door_open) ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    </span>
                    {(telemetry?.door_open ?? simStatus?.door_open) ? <DoorOpen className="w-7 h-7" /> : <DoorClosed className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Door Status</div>
                    <div className={`text-3xl font-extrabold tracking-tight ${(telemetry?.door_open ?? simStatus?.door_open) ? 'text-red-600' : 'text-emerald-600'}`}>{(telemetry?.door_open ?? simStatus?.door_open) ? 'OPEN' : 'SECURED'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulator Control */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 text-white p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 flex gap-2">
                <span className="flex h-3 w-3 relative">
                  {simStatus?.is_running && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${getSimColor()}`}></span>
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-2">IoT Simulator</h2>
              <p className="text-slate-400 text-sm mb-6">Control telemetry generation for demonstration.</p>

              <div className="flex gap-3 mb-6">
                {!simStatus?.is_running ? (
                  <button onClick={() => handleSimAction('start')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <Play className="w-4 h-4" /> Start
                  </button>
                ) : (
                  <button onClick={() => handleSimAction('stop')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <Square className="w-4 h-4" /> Stop
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Scenarios</div>
                <button onClick={() => handleSimAction('scenario', 'NORMAL')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${simStatus?.scenario === 'NORMAL' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Normal Operation</button>
                <button onClick={() => handleSimAction('scenario', 'HIGH_TEMP')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${simStatus?.scenario === 'HIGH_TEMP' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>High Temperature</button>
                <button onClick={() => handleSimAction('scenario', 'LOW_TEMP')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${simStatus?.scenario === 'LOW_TEMP' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Low Temperature</button>
                <button onClick={() => handleSimAction('scenario', 'RAPID_RISE')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${simStatus?.scenario === 'RAPID_RISE' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Rapid Temp Rise</button>
                <button onClick={() => handleSimAction('scenario', 'DOOR_OPEN')} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${simStatus?.scenario === 'DOOR_OPEN' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Door Left Open</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
