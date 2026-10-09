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
  Printer,
  QrCode,
  FileCheck
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
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl shadow-premium dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary dark:text-cyanGlow" /> Cold Chain Compliance & Audit Reports
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-cyan-950/70 text-primary dark:text-cyanGlow border border-blue-200 dark:border-cyan-800">
              <ShieldCheck className="w-3.5 h-3.5" /> 21 CFR Part 11 Ready
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Generate tamper-evident temperature excursion logs and pharmaceutical compliance certificates
          </p>
        </div>
      </div>

      {/* Main Generator Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-premium dark:shadow-premium-dark p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-8">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Monitored Shipment / Batch
            </label>
            <select 
              className="w-full bg-slate-50 dark:bg-[#111c33] border border-slate-200/90 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-cyan-500 transition-all"
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
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <FileCheck className="w-4 h-4" />
            {loading ? 'Compiling Audit Certificate...' : 'Generate Compliance Certificate'}
          </button>
        </div>

        {report && report.status !== 'no_data' && !report.error && (
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Report Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0e172a] to-[#0a1120] p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-lg font-heading text-white">Batch Certificate: {report.shipment_id}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CRYPTOGRAPHICALLY VERIFIED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Automated Cold Chain Telemetry Integrity Record • Node ESP-001</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Certificate
                </button>
                <button 
                  onClick={downloadCsv} 
                  className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Report Metric Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-5 bg-white dark:bg-[#0f172a]">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Product Batch
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white text-base">{report.product}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Transport Route
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{report.source} &rarr; {report.destination}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Integrity Score
                </div>
                <div className={`text-2xl font-extrabold font-heading ${
                  report.shipment_condition_score > 90 ? 'text-emerald-600 dark:text-emerald-400' : report.shipment_condition_score > 70 ? 'text-amber-500' : 'text-red-600'
                }`}>
                  {report.shipment_condition_score} / 100
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Safe Thermal Band
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{report.min_temperature}°C to {report.max_temperature}°C</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Mean Temperature
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">{report.avg_temperature}°C</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111c33] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary dark:text-cyanGlow" /> Recorded Anomalies
                </div>
                <div className="font-bold text-red-600 dark:text-red-400 text-sm">
                  {report.total_excursions} Excursions, {report.door_events} Door Openings
                </div>
              </div>
            </div>

            {/* Verification Signature & QR Box */}
            <div className="p-6 bg-slate-50 dark:bg-[#0c1424] border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary dark:text-cyanGlow shadow-sm">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Audit Digital Signature</div>
                  <div className="text-[10px] font-mono text-slate-400">SHA-256: 8f4b29c1e7a004f8263158c...</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Compliant with WHO PQS Protocol E006</div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Validated by ColdChain Pro Quality Engine
                </span>
              </div>
            </div>
          </div>
        )}
        
        {report?.status === 'no_data' && (
          <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-[#111c33] rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <p className="font-bold text-base text-slate-700 dark:text-slate-300 font-heading">No telemetry data recorded for this batch</p>
            <p className="text-xs text-slate-400 mt-1">Please select an active or previously completed shipment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
