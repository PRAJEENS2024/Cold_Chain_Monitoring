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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Devices</h1>
          <p className="text-slate-500">Manage and track your IoT devices (ESP32, etc).</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Register Device
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
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
             <Cpu className="w-12 h-12 mb-4 text-slate-300" />
             <p>No devices found. Register one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">Device ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Firmware</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{d.device_id}</td>
                  <td className="p-4 text-slate-600">{d.name} <span className="text-xs text-slate-400 block">{d.esp32_identifier}</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${d.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{d.firmware_version}</td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:text-blue-700 font-medium text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Device Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Register New Device</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Device ID *</label>
                <input required name="device_id" value={formData.device_id} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. ESP-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Cold Chain Sensor Alpha" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ESP32 MAC / Identifier</label>
                <input name="esp32_identifier" value={formData.esp32_identifier} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="00:11:22:33:44:55" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ThingSpeak Channel ID</label>
                <input name="thingspeak_channel_id" value={formData.thingspeak_channel_id} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 1234567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ThingSpeak Read API Key</label>
                <input name="thingspeak_read_key" value={formData.thingspeak_read_key} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="16-character key" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Save Device</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
