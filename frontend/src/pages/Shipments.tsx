import React, { useEffect, useState } from 'react';
import api from '../api';
import { Package, Search, Plus, X, MapPin, Truck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

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
      <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-flat border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Shipments</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your cold-chain shipments globally.</p>
        </div>
        <button onClick={() => alert("New Shipment Wizard opening...")} className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-sm flex items-center gap-2 transition-all shadow-sm font-semibold">
          <Plus className="w-5 h-5" /> New Shipment
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-flat overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shipments..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium transition-all bg-slate-50 focus:bg-white"
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
                    <button onClick={() => setSelectedShipment(s)} className="text-primary hover:text-primaryHover font-semibold text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-sm transition-colors opacity-0 group-hover:opacity-100">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tracking Details Modal */}
      <AnimatePresence>
        {selectedShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60" onClick={() => setSelectedShipment(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-sm shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Shipment Details</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">ID: {selectedShipment.shipment_id}</p>
                </div>
                <button onClick={() => setSelectedShipment(null)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-sm border border-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Product</div>
                    <div className="font-semibold text-slate-800">{selectedShipment.product_name}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Status</div>
                    <div className="font-semibold text-primary">{selectedShipment.status}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-sm p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Tracking History</h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                    <div className="relative flex items-center gap-4">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center relative z-10 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-sm">Dispatched from Facility</div>
                        <div className="text-xs text-slate-500">Oct 12, 08:30 AM</div>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-primary flex items-center justify-center relative z-10 shrink-0">
                        <Truck className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-sm">In Transit - Last Ping: Miami Hub</div>
                        <div className="text-xs text-slate-500">Oct 13, 02:15 PM</div>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center relative z-10 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex-1 opacity-50">
                        <div className="font-semibold text-slate-800 text-sm">Expected Arrival: {selectedShipment.destination}</div>
                        <div className="text-xs text-slate-500">Oct 15, Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
