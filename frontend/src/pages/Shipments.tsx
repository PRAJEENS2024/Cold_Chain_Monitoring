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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Shipments</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your cold-chain shipments globally.</p>
        </div>
        <button className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] font-semibold">
          <Plus className="w-5 h-5" /> New Shipment
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shipments..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading shipments...</div>
        ) : shipments.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Package className="w-10 h-10 text-slate-400" />
             </div>
             <p className="text-lg font-medium text-slate-700">No shipments found.</p>
             <p className="text-sm mt-1">Create a new shipment to start tracking.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-5">Shipment ID</th>
                <th className="p-5">Product Details</th>
                <th className="p-5">Status</th>
                <th className="p-5">Temp Range</th>
                <th className="p-5">Destination</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shipments.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 font-bold text-slate-800">{s.shipment_id}</td>
                  <td className="p-5">
                    <div className="font-semibold text-slate-800">{s.product_name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">{s.product_category}</div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${
                      s.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      s.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      s.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {s.status === 'IN_TRANSIT' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-slate-600">
                    <span className="text-blue-600">{s.temp_min}°C</span> <span className="text-slate-400 mx-1">to</span> <span className="text-red-500">{s.temp_max}°C</span>
                  </td>
                  <td className="p-5 font-medium text-slate-600">{s.destination}</td>
                  <td className="p-5 text-right">
                    <button className="text-primary hover:text-primaryHover font-semibold text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      View Details
                    </button>
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
