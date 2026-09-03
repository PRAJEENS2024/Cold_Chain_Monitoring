import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, Plus, Search } from 'lucide-react';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      const res = await api.get('/shipments');
      setShipments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shipments</h1>
          <p className="text-slate-500">Manage and track your cold-chain shipments.</p>
        </div>
        <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> New Shipment
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shipments..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
             <Package className="w-12 h-12 mb-4 text-slate-300" />
             <p>No shipments found. Create one to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                <th className="p-4">ID</th>
                <th className="p-4">Product</th>
                <th className="p-4">Status</th>
                <th className="p-4">Temp Range</th>
                <th className="p-4">Destination</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{s.shipment_id}</td>
                  <td className="p-4 text-slate-600">{s.product_name} <span className="text-xs text-slate-400 block">{s.product_category}</span></td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{s.temp_min}°C - {s.temp_max}°C</td>
                  <td className="p-4 text-slate-600">{s.destination}</td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:text-blue-700 font-medium text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
