import React, { useEffect, useState } from 'react';
import api from '../api';
import { Cpu, Search, Plus, Wifi, Server, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const form = e.target as HTMLFormElement;
    const data = {
      device_id: (form.elements.namedItem('device_id') as HTMLInputElement).value,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      esp32_identifier: (form.elements.namedItem('esp32_identifier') as HTMLInputElement).value,
      firmware_version: (form.elements.namedItem('firmware_version') as HTMLInputElement).value,
      thingspeak_channel_id: (form.elements.namedItem('thingspeak_channel_id') as HTMLInputElement).value || null,
      thingspeak_read_key: (form.elements.namedItem('thingspeak_read_key') as HTMLInputElement).value || null,
    };
    try {
      await api.post('/devices/', data);
      setIsModalOpen(false);
      fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error registering device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices/');
      setDevices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-flat border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Devices</h1>
          <p className="text-slate-500 font-medium mt-1">Manage physical hardware and IoT sensors.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-sm flex items-center gap-2 transition-all shadow-sm font-semibold"
        >
          <Plus className="w-5 h-5" /> Register Device
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-flat overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search devices..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
        <div className="bg-white border-t border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Cpu className="w-10 h-10 text-slate-400" />
             </div>
             <p className="text-lg font-medium text-slate-700">No devices found.</p>
             <p className="text-sm mt-1">Register an ESP32 device to start monitoring.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-5">Device ID</th>
                <th className="p-5">Name</th>
                <th className="p-5">Hardware MAC</th>
                <th className="p-5">Firmware</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {devices.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 font-bold text-slate-800">{d.device_id}</td>
                  <td className="p-5 font-semibold text-slate-700">{d.name}</td>
                  <td className="p-5">
                    <code className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-mono">{d.esp32_identifier}</code>
                  </td>
                  <td className="p-5 font-medium text-slate-500">v{d.firmware_version}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${
                      d.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {d.status === 'ONLINE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {d.status === 'OFFLINE' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}
                      {d.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => setSelectedDevice(d)} className="text-primary hover:text-primaryHover font-semibold text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-sm transition-colors opacity-0 group-hover:opacity-100">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Register New Device</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Connect a physical ESP32 or simulated unit.</p>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 space-y-5">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm font-medium border border-red-200">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Device ID</label>
                  <input required name="device_id" type="text" placeholder="e.g. ESP-005" className="w-full px-4 py-2.5 rounded-sm border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Display Name</label>
                  <input required name="name" type="text" placeholder="e.g. Warehouse Temp Sensor 1" className="w-full px-4 py-2.5 rounded-sm border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">MAC Address / Identifier</label>
                  <input required name="esp32_identifier" type="text" placeholder="00:00:00:00:00:00" className="w-full px-4 py-2.5 rounded-sm border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-slate-50 focus:bg-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Firmware Version</label>
                  <input required name="firmware_version" type="text" defaultValue="1.0.0" className="w-full px-4 py-2.5 rounded-sm border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-primary" /> ThingSpeak Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Channel ID (Optional)</label>
                      <input name="thingspeak_channel_id" type="text" placeholder="e.g. 3483882" className="w-full px-4 py-2.5 rounded-sm border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Read API Key (Optional)</label>
                      <input name="thingspeak_read_key" type="password" placeholder="e.g. XXXX" className="w-full px-4 py-2.5 rounded-sm border border-slate-300 focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-sm font-semibold shadow-sm transition-all disabled:opacity-50">
                  {isSubmitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Configuration Modal */}
      <AnimatePresence>
        {selectedDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedDevice(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-sm shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Device Configuration</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">{selectedDevice.name}</p>
                </div>
                <button onClick={() => setSelectedDevice(null)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-sm border border-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-sm flex items-start gap-4">
                  <Activity className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Telemetry Ping Frequency</h3>
                    <p className="text-xs text-slate-600 mt-1 mb-3">Adjust how often this sensor pushes data to the backend.</p>
                    <select className="w-full p-2 border border-slate-300 rounded-sm text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                      <option>10 seconds (High Drain)</option>
                      <option>30 seconds (Standard)</option>
                      <option>1 minute (Battery Saver)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Hardware Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Device ID</span>
                      <span className="font-bold text-slate-800">{selectedDevice.device_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">MAC / Ident</span>
                      <span className="font-mono text-slate-800">{selectedDevice.esp32_identifier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Firmware</span>
                      <span className="font-bold text-slate-800">v{selectedDevice.firmware_version}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setSelectedDevice(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button onClick={() => { alert('Configuration saved (dummy)'); setSelectedDevice(null); }} className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-sm font-semibold shadow-sm transition-all">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
