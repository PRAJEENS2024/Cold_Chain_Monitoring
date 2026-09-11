import React, { useEffect, useState } from 'react';
import api from '../api';
import { Cpu, Plus, Search, X } from 'lucide-react';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    esp32_identifier: '',
    firmware_version: '1.0.0',
    thingspeak_channel_id: '',
    thingspeak_read_key: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/devices/', formData);
      setShowModal(false);
      setFormData({ device_id: '', name: '', esp32_identifier: '', firmware_version: '1.0.0', thingspeak_channel_id: '', thingspeak_read_key: '' });
      fetchDevices();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error registering device');
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Devices</h1>
          <p className="text-slate-500 font-medium mt-1">Manage physical hardware and IoT sensors.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] font-semibold"
        >
          <Plus className="w-5 h-5" /> Register Device
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search devices..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
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
                    <button className="text-primary hover:text-primaryHover font-semibold text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Register New Device</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Connect a physical ESP32 or simulated unit.</p>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 space-y-5">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">{error}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Device ID</label>
                  <input required name="device_id" type="text" placeholder="e.g. ESP-005" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Display Name</label>
                  <input required name="name" type="text" placeholder="e.g. Warehouse Temp Sensor 1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">MAC Address / Identifier</label>
                  <input required name="esp32_identifier" type="text" placeholder="00:00:00:00:00:00" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Firmware Version</label>
                  <input required name="firmware_version" type="text" defaultValue="1.0.0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-primary" /> ThingSpeak Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Channel ID (Optional)</label>
                      <input name="thingspeak_channel_id" type="text" placeholder="e.g. 3483882" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Read API Key (Optional)</label>
                      <input name="thingspeak_read_key" type="password" placeholder="e.g. XXXX" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all disabled:opacity-50">
                  {isSubmitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
