import React, { useState, useEffect } from 'react';
import api from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, Square, Thermometer, DoorOpen, DoorClosed, Activity, AlertTriangle } from 'lucide-react';

export default function LiveMonitoring() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [simStatus, setSimStatus] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]); // For chart

  const fetchShipments = async () => {
    const res = await api.get('/shipments');
    setShipments(res.data);
    if (res.data.length > 0 && !selectedShipment) {
      setSelectedShipment(res.data[0]);
    }
  };

  const fetchSimStatus = async () => {
    try {
      const res = await api.get('/simulator/status');
      setSimStatus(res.data);
      // Append reading to chart if simulator is running for this shipment
      if (res.data.is_running && selectedShipment && res.data.active_shipment_id === selectedShipment.id) {
        setReadings(prev => {
          const newReadings = [...prev, { time: new Date().toLocaleTimeString(), temp: res.data.current_temp }];
          if (newReadings.length > 20) newReadings.shift(); // keep last 20
          return newReadings;
        });
      }
    } catch (e) {}
  };

  const fetchPrediction = async () => {
    if (!selectedShipment) return;
    try {
      const res = await api.get(`/analytics/shipment/${selectedShipment.id}/prediction`);
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
    const interval = setInterval(() => {
      fetchSimStatus();
      fetchPrediction();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedShipment]);

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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="text-primary w-5 h-5" /> Temperature History
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Max: {selectedShipment.temp_max}°C</div>
                  <div className="text-blue-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Min: {selectedShipment.temp_min}°C</div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[selectedShipment.temp_min - 5, selectedShipment.temp_max + 5]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <ReferenceLine y={selectedShipment.temp_max} stroke="#ef4444" strokeDasharray="4 4" />
                    <ReferenceLine y={selectedShipment.temp_min} stroke="#3b82f6" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={300} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                 <AlertTriangle className="text-amber-500 w-5 h-5" /> Predictive Analytics
               </h2>
               {prediction ? (
                 <div className="grid grid-cols-3 gap-4">
                   <div className="bg-slate-50 p-4 rounded-lg">
                     <div className="text-slate-500 text-sm mb-1">Predicted Temp (Next {prediction.prediction_horizon})</div>
                     <div className={`text-2xl font-bold ${prediction.risk === 'HIGH' ? 'text-red-600' : 'text-slate-800'}`}>
                       {prediction.predicted_temp}°C
                     </div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg">
                     <div className="text-slate-500 text-sm mb-1">Current Trend</div>
                     <div className="text-2xl font-bold text-slate-800">
                       {prediction.trend}
                     </div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg">
                     <div className="text-slate-500 text-sm mb-1">Risk Level</div>
                     <div className={`text-2xl font-bold ${prediction.risk === 'HIGH' ? 'text-red-600' : (prediction.risk === 'MEDIUM' ? 'text-amber-500' : 'text-green-600')}`}>
                       {prediction.risk}
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-slate-500 text-sm">Waiting for sufficient data to generate predictions...</div>
               )}
            </div>
          </div>

          {/* Right Sidebar - Status & Simulator */}
          <div className="space-y-6">
            
            {/* Current Status */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Current Readings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm">Temperature</div>
                    <div className="text-2xl font-bold text-slate-800">{simStatus?.current_temp || '--'}°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${simStatus?.door_open ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {simStatus?.door_open ? <DoorOpen className="w-6 h-6" /> : <DoorClosed className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-slate-500 text-sm">Door Status</div>
                    <div className="text-2xl font-bold text-slate-800">{simStatus?.door_open ? 'OPEN' : 'CLOSED'}</div>
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
