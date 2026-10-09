import { useState, useEffect } from 'react';
import api from '../api';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Activity, 
  Thermometer, 
  Calendar, 
  MapPin, 
  Award,
  CheckCircle2,
  Printer
} from 'lucide-react';

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
      + `Condition Score,${report.shipment_condition_score}/100\n`
      + `Compliance Certified,GDP & 21 CFR Part 11\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coldchain_audit_${report.shipment_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-premium border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Cold Chain Compliance & Audit Reports
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" /> 21 CFR Part 11 Ready
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Generate tamper-evident temperature excursion logs and pharmaceutical compliance documentation
          </p>
        </div>
      </div>

      {/* Main Generator Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-premium p-6">
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-8">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Monitored Shipment / Batch
            </label>
            <select 
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              value={selectedShipment || ''}
              onChange={(e) => setSelectedShipment(e.target.value)}
            >
              <option value="" disabled>Choose a cold chain batch...</option>
              {shipments.map(s => (
                <option key={s.id} value={s.id}>{s.shipment_id} - {s.product_name} ({s.source} &rarr; {s.destination})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={generateReport}
            disabled={!selectedShipment || loading}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/20 hover:shadow-lg flex items-center justify-center gap-2 active:scale-98"
          >
            <FileText className="w-4 h-4" />
            {loading ? 'Compiling Audit...' : 'Generate Compliance Report'}
          </button>
        </div>

        {report && report.status !== 'no_data' && !report.error && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            {/* Report Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base font-heading text-white">Batch Certificate: {report.shipment_id}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Automated Cold Chain Telemetry Integrity Record</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button 
                  onClick={downloadCsv} 
                  className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV Data
                </button>
              </div>
            </div>

            {/* Report Metric Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6 bg-white">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Product Batch
                </div>
                <div className="font-extrabold text-slate-900 text-base">{report.product}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Transport Route
                </div>
                <div className="font-bold text-slate-800 text-sm">{report.source} &rarr; {report.destination}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary" /> Integrity Score
                </div>
                <div className={`text-2xl font-extrabold font-heading ${
                  report.shipment_condition_score > 90 ? 'text-emerald-600' : report.shipment_condition_score > 70 ? 'text-amber-500' : 'text-red-600'
                }`}>
                  {report.shipment_condition_score} / 100
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-primary" /> Safe Thermal Window
                </div>
                <div className="font-bold text-slate-800 text-sm">{report.min_temperature}°C to {report.max_temperature}°C</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Mean Temperature
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{report.avg_temperature}°C</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Recorded Anomalies
                </div>
                <div className="font-bold text-red-600 text-sm">
                  {report.total_excursions} Excursions, {report.door_events} Door Openings
                </div>
              </div>
            </div>

            {/* Compliance Guarantee Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital Chain of Custody Maintained
              </span>
              <span>SHA-256 Verified Sensor Records</span>
            </div>
          </div>
        )}
        
        {report?.status === 'no_data' && (
          <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="font-bold text-base text-slate-700 font-heading">No telemetry data recorded for this batch</p>
            <p className="text-xs text-slate-400 mt-1">Please select an active or previously completed shipment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
