import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileText, Download } from 'lucide-react';

export default function Reports() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/shipments').then(res => setShipments(res.data)).catch(console.error);
  }, []);

  const generateReport = async () => {
    if (!selectedShipment) return;
    setLoading(true);
    try {
      const res = await api.get(`/analytics/shipment/${selectedShipment}/report`);
      setReport(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!report) return;
    const csvContent = `data:text/csv;charset=utf-8,`
      + `Field,Value\n`
      + `Shipment ID,${report.shipment_id}\n`
      + `Product,${report.product}\n`
      + `Source,${report.source}\n`
      + `Destination,${report.destination}\n`
      + `Min Temperature,${report.min_temperature}°C\n`
      + `Max Temperature,${report.max_temperature}°C\n`
      + `Avg Temperature,${report.avg_temperature}°C\n`
      + `Total Excursions,${report.total_excursions}\n`
      + `Door Events,${report.door_events}\n`
      + `Condition Score,${report.shipment_condition_score}/100\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${report.shipment_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Shipment Reports</h1>
        <p className="text-slate-500">Generate and export compliance reports.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-end gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Shipment</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedShipment || ''}
              onChange={(e) => setSelectedShipment(e.target.value)}
            >
              <option value="" disabled>Select a shipment...</option>
              {shipments.map(s => (
                <option key={s.id} value={s.id}>{s.shipment_id} - {s.product_name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={generateReport}
            disabled={!selectedShipment || loading}
            className="bg-primary hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {report && report.status !== 'no_data' && !report.error && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Report Summary: {report.shipment_id}</h3>
              <button onClick={downloadCsv} className="text-primary hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product</div>
                <div className="font-medium text-slate-800">{report.product}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Route</div>
                <div className="font-medium text-slate-800">{report.source} &rarr; {report.destination}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Condition Score</div>
                <div className={`text-2xl font-bold ${report.shipment_condition_score > 90 ? 'text-green-600' : report.shipment_condition_score > 70 ? 'text-amber-500' : 'text-red-600'}`}>
                  {report.shipment_condition_score}/100
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Temperature Range</div>
                <div className="font-medium text-slate-800">{report.min_temperature}°C to {report.max_temperature}°C</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Average Temp</div>
                <div className="font-medium text-slate-800">{report.avg_temperature}°C</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Anomalies</div>
                <div className="font-medium text-red-600">{report.total_excursions} Excursions, {report.door_events} Door Events</div>
              </div>
            </div>
          </div>
        )}
        
        {report?.status === 'no_data' && (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
            No telemetry data found for this shipment.
          </div>
        )}
      </div>
    </div>
  );
}
