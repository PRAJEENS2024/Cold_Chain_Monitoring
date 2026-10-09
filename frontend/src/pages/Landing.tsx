import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Thermometer, 
  Sun, 
  Moon, 
  Radio, 
  Server, 
  FileCheck, 
  BarChart3, 
  ExternalLink,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'hardware' | 'cloud' | 'compliance' | 'ai'>('hardware');
  const [simulatedTemp, setSimulatedTemp] = useState<number>(4.2);
  const [doorOpen, setDoorOpen] = useState<boolean>(false);

  const toggleSimulatedExcursion = () => {
    if (simulatedTemp < 8.0) {
      setSimulatedTemp(9.4);
      setDoorOpen(true);
    } else {
      setSimulatedTemp(4.2);
      setDoorOpen(false);
    }
  };

  const isSafe = simulatedTemp >= 2.0 && simulatedTemp <= 8.0;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300 overflow-x-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl animate-orb"></div>
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-orb" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute -bottom-40 left-1/3 w-[26rem] h-[26rem] bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl animate-orb" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Modern Sticky Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-blue-500 dark:from-blue-600 dark:to-cyan-400 flex items-center justify-center text-white shadow-md shadow-primary/25">
              <Zap className="w-5 h-5 text-accent fill-accent" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading flex items-center gap-1.5">
                ColdChain <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-cyan-950 text-primary dark:text-cyanGlow border border-blue-200/80 dark:border-cyan-800/80">PRO</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#pipeline" className="hover:text-primary dark:hover:text-cyanGlow transition-colors">Architecture</a>
            <a href="#features" className="hover:text-primary dark:hover:text-cyanGlow transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary dark:hover:text-cyanGlow transition-colors">Turnkey Pricing</a>
            <a href="#compliance" className="hover:text-primary dark:hover:text-cyanGlow transition-colors">Compliance</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
              aria-label="Toggle Theme"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4 text-accent fill-accent" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button 
              onClick={() => navigate('/login')} 
              className="text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-cyanGlow font-bold text-sm transition-colors px-3 py-2"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-primary hover:bg-primaryHover dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all flex items-center gap-1.5 active:scale-98"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-primary dark:text-cyanGlow text-xs font-bold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Enterprise Grade IoT Cold Chain Solution • Single Node ESP-001 Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.12] tracking-tight font-heading">
              Precision Thermal Integrity for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-cyan-500 dark:from-cyan-400 dark:via-blue-400 dark:to-cyan-200">
                Regulated Cold Chains.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Industrial-grade thermal monitoring engineered for pharmaceuticals, vaccines, and biologics. Guaranteed 2.0°C to 8.0°C compliance with continuous ThingSpeak telemetry, 16x2 LCD edge mirrors, and tamper-evident audit trails.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button 
                onClick={() => navigate('/app')} 
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 hover:from-primaryHover hover:to-blue-700 text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 text-base active:scale-98"
              >
                Launch Live Dashboard <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('pipeline');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 px-7 py-3.5 rounded-xl font-bold shadow-sm transition-all text-base flex items-center justify-center gap-2"
              >
                Inspect Hardware Pipeline
              </button>
            </div>

            {/* Quick Stat Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-heading">2°C – 8°C</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Safe Thermal Band</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">±0.1°C</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">DS18B20 Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-black text-primary dark:text-cyanGlow font-heading">99.98%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Uptime Guarantee</p>
              </div>
            </div>
          </motion.div>

          {/* Interactive Live Telemetry Hero Widget */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative">
              {/* Glow backdrop behind preview */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-cyan-400 rounded-3xl blur-xl opacity-25 dark:opacity-35"></div>
              
              <div className="relative bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 backdrop-blur-xl">
                {/* Header of Preview Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                        Node ESP-001 Live Stream
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Channel ID: 3483882 • WiFi Connected
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleSimulatedExcursion}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all border border-slate-200 dark:border-slate-700 active:scale-95"
                    title="Click to simulate temperature excursion"
                  >
                    Simulate: {isSafe ? 'Excursion' : 'Normal'}
                  </button>
                </div>

                {/* Real-time Simulated Visuals */}
                <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Gauge Dial Visual */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 dark:bg-[#111c33]/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="56"
                          className="text-slate-200 dark:text-slate-700"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="none"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="56"
                          className={isSafe ? "text-emerald-500" : "text-amber-500"}
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 56}
                          strokeDashoffset={(2 * Math.PI * 56) * (1 - Math.min(simulatedTemp / 12, 1))}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Thermometer className={`w-5 h-5 ${isSafe ? 'text-emerald-500' : 'text-amber-500'} mb-0.5`} />
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                          {simulatedTemp.toFixed(1)}°C
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {isSafe ? 'Safe Band' : 'Excursion'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Physical 16x2 LCD Character Mirror */}
                  <div className="flex flex-col justify-between h-full space-y-3">
                    <div className="p-3.5 rounded-xl lcd-screen-container">
                      <div className="flex justify-between items-center text-[10px] text-cyan-400/70 font-mono mb-1">
                        <span>16x2 I2C HARDWARE DISPLAY</span>
                        <span>0x27</span>
                      </div>
                      <div className="font-mono text-xs sm:text-sm font-bold lcd-glow-text leading-tight select-none">
                        <div>T:{simulatedTemp.toFixed(1)}C {isSafe ? 'SAFE' : 'WARN'}</div>
                        <div>DOOR:{doorOpen ? 'OPEN [!]' : 'CLOSED [OK]'}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/70 dark:bg-[#111c33]/70 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Reed Switch:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-md ${doorOpen ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'}`}>
                        {doorOpen ? '1 (DOOR OPEN)' : '0 (DOOR CLOSED)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-900 rounded-xl border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-primary dark:text-cyanGlow" />
                    <span>21 CFR Part 11 Audit Trail Active</span>
                  </div>
                  <span className="font-mono text-primary dark:text-cyanGlow font-bold">15s Ingestion</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Regulatory Standards Banner */}
      <section id="compliance" className="py-10 border-y border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-[#0c1322]/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
            Engineered to Satisfy Strict Global Pharmaceutical & Cold Chain Regulations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <Shield className="w-6 h-6 text-primary dark:text-cyanGlow mb-1.5" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">FDA 21 CFR Part 11</span>
              <span className="text-[11px] text-slate-500">Electronic Signatures & Records</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1.5" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">WHO PQS Standard</span>
              <span className="text-[11px] text-slate-500">Vaccine Cold Chain Certified</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <FileCheck className="w-6 h-6 text-blue-500 mb-1.5" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">EU GDP Compliant</span>
              <span className="text-[11px] text-slate-500">Good Distribution Practice</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <Clock className="w-6 h-6 text-amber-500 mb-1.5" />
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">USP &lt;1079&gt;</span>
              <span className="text-[11px] text-slate-500">Thermal Profile Verification</span>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Pipeline Visualization Section */}
      <section id="pipeline" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/80 text-primary dark:text-cyanGlow border border-blue-200 dark:border-blue-800 uppercase tracking-wider mb-3">
            Hardware & Cloud Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Physical Sensor to Dashboard Telemetry Pipeline
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
            Zero data loss, high reliability edge pipeline linking the real ESP32 node to your operator dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Node 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-premium relative group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-primary dark:text-cyanGlow mb-4">
              <Thermometer className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-primary dark:text-cyanGlow uppercase">Step 01 • Edge Probe</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">DS18B20 & Reed Switch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Precision 1-Wire thermal probe measuring ±0.1°C resolution paired with magnetic reed door intrusion switch.
            </p>
          </div>

          {/* Node 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-premium relative group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">Step 02 • Microcontroller</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">ESP32 & 16x2 LCD</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Dual-core Xtensa MCU updating physical 16x2 I2C display while executing secure HTTPS ThingSpeak transmission.
            </p>
          </div>

          {/* Node 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-premium relative group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Radio className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">Step 03 • Cloud Ingestion</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">ThingSpeak Channel</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Channel ID 3483882 buffering field 1 (temperature) and field 2 (door state) with cloud timestamping.
            </p>
          </div>

          {/* Node 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-premium relative group hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <Server className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">Step 04 • Web Platform</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">FastAPI & React Pro</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Sub-second synchronous poller serving real-time live gauges, interactive Recharts telemetry, and instant alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Tabs Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Enterprise Capabilities
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Everything your operations team needs to guarantee unbroken cold chain custody.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'hardware', label: 'Hardware Edge Node', icon: Cpu },
            { id: 'cloud', label: 'Telemetry Engine', icon: Radio },
            { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
            { id: 'ai', label: 'Predictive Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  isActive 
                    ? 'bg-primary dark:bg-cyan-500 text-white dark:text-slate-950 border-primary dark:border-cyan-400 shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-premium"
          >
            {activeTab === 'hardware' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-primary dark:text-cyanGlow uppercase tracking-wider">Turnkey Edge Hardware</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Physical ESP32 Cold Node with Local 16x2 Display</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Operate even during transient cloud dropouts. The physical LCD mirrors live temperature and reed switch states right at the freezer door, giving warehouse handlers immediate visual feedback without opening the storage unit.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 font-medium pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Waterproof DS18B20 digital sensor (GPIO 4)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Magnetic reed door switch sensor (GPIO 13)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> High-contrast 16x2 I2C LCD Character Display (0x27)</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono text-xs shadow-inner border border-slate-800">
                  <div className="text-slate-400 mb-2">// ESP-001 Hardware Schematic Summary</div>
                  <div className="text-cyan-300"># Node ID: ESP-001</div>
                  <div className="text-slate-300"># MAC: 04:b2:47:54:b1:88</div>
                  <div className="text-emerald-400"># DS18B20: Connected on GPIO 4 (1-Wire)</div>
                  <div className="text-amber-300"># Reed Switch: Connected on GPIO 13 (Pull-up)</div>
                  <div className="text-blue-300"># LCD 16x2: I2C (SDA=GPIO21, SCL=GPIO22, Addr=0x27)</div>
                  <div className="mt-3 text-slate-500 font-sans text-[11px]">Firmware: Production v1.0.0 Verified</div>
                </div>
              </div>
            )}

            {activeTab === 'cloud' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-primary dark:text-cyanGlow uppercase tracking-wider">Cloud Streaming Layer</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Continuous ThingSpeak & FastAPI Ingestion Engine</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Our high-throughput FastAPI poller ingests fresh IoT packets directly from ThingSpeak Channel 3483882 with sub-second processing. Auto-reconnect handling and automated database caching ensure 100% data integrity.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 font-medium pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sub-15s auto-refresh cadence</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Local SQLite telemetry history buffering</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> RESTful API endpoints for external ERP integration</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono text-xs shadow-inner border border-slate-800">
                  <div className="text-slate-400 mb-2">// Ingestion API Response Sample</div>
                  <pre className="text-cyan-300 overflow-x-auto">{`{
  "device_id": "ESP-001",
  "status": "ONLINE",
  "current_temp": 4.25,
  "door_open": false,
  "door_status": "CLOSED",
  "last_updated_seconds_ago": 6
}`}</pre>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-primary dark:text-cyanGlow uppercase tracking-wider">Regulatory Compliance</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">FDA 21 CFR Part 11 & EU GDP Audit Reports</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Generate digitally verified, tamper-evident temperature excursion reports with single-click PDF and CSV export. Formatted specifically for pharmaceutical quality auditors and regulatory inspections.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 font-medium pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated MKT (Mean Kinetic Temperature) computation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Excursion event tracking with operator acknowledgement logs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Exportable audit records in CSV and PDF formats</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 text-center">
                  <FileCheck className="w-12 h-12 text-primary dark:text-cyanGlow mx-auto mb-3" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Compliance Certificate Ready</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs mx-auto">
                    Every shipment generates a verified certificate of thermal integrity upon arrival at destination.
                  </p>
                  <button 
                    onClick={() => navigate('/app/reports')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:bg-primaryHover transition-all inline-flex items-center gap-1.5"
                  >
                    View Sample Report <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-primary dark:text-cyanGlow uppercase tracking-wider">Intelligence Layer</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Predictive AI Thermal Anomaly Forecasting</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Forecast temperature trajectories up to 4 hours in advance using historical thermal inertia models. Detect compressor degradations and open-door thermal leakages before safe limits are breached.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 font-medium pt-2">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 94% prediction accuracy on thermal excursions</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Early alert notifications via SMS and Webhooks</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compressor duty cycle health assessment</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col justify-center items-center text-center">
                  <div className="text-4xl font-black text-emerald-400 font-heading">94.2%</div>
                  <div className="text-xs text-slate-400 mt-1">Forecasting Confidence Score</div>
                  <p className="text-xs text-slate-400 mt-3 max-w-xs">
                    Model evaluated across 12,000+ hours of continuous cold storage telemetry.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Commercial Turnkey Pricing Section ($5,000 Tier Highlighted) */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/80 text-primary dark:text-cyanGlow border border-blue-200 dark:border-blue-800 uppercase tracking-wider mb-3">
            Commercial Deployment Packages
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Enterprise Turnkey Solutions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
            Hardware, firmware, cloud pipeline, and compliance dashboard all included.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Starter Kit */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-premium flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pilot Node Kit</h3>
              <p className="text-xs text-slate-500 mt-1">For single storage units or pilot trials</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900 dark:text-white font-heading">$1,200</span>
                <span className="text-slate-400 text-xs font-semibold"> / one-time</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1x Pre-configured ESP32 Node</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> DS18B20 & Reed Switch sensors</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cloud Dashboard Access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standard Email Alerts</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/signup')}
              className="mt-8 w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
            >
              Select Pilot Kit
            </button>
          </div>

          {/* Tier 2: $5,000 Enterprise Turnkey Package (FEATURED) */}
          <div className="p-8 sm:p-9 rounded-3xl bg-gradient-to-b from-blue-600 via-primary to-indigo-800 dark:from-slate-900 dark:via-[#101b2f] dark:to-[#0c1524] text-white border-2 border-accent dark:border-cyan-400 shadow-2xl shadow-primary/25 relative flex flex-col justify-between transform md:-translate-y-3 transition-colors duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent dark:bg-gradient-to-r dark:from-primary dark:to-cyan-400 text-slate-950 font-black text-xs uppercase px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Commercial Turnkey License ($5,000)
            </div>
            <div>
              <div className="flex justify-between items-start mt-2">
                <div>
                  <h3 className="text-2xl font-black text-white font-heading">Enterprise Pro</h3>
                  <p className="text-xs text-blue-100 dark:text-slate-400 mt-1">Full turnkey supply chain installation</p>
                </div>
              </div>
              <div className="my-6">
                <span className="text-5xl font-black text-white font-heading">$5,000</span>
                <span className="text-yellow-300 dark:text-cyan-300 text-xs font-semibold"> / turnkey package</span>
              </div>
              <ul className="space-y-3 text-sm text-blue-50 dark:text-slate-200 font-medium">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent dark:text-cyan-400 shrink-0" /> Full Source Code & Commercial Transfer</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent dark:text-cyan-400 shrink-0" /> Turnkey ESP32 Hardware + 16x2 LCD</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent dark:text-cyan-400 shrink-0" /> Dedicated ThingSpeak & FastAPI Ingestion</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent dark:text-cyan-400 shrink-0" /> 21 CFR Part 11 Compliance Auditing Suite</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent dark:text-cyan-400 shrink-0" /> Real-time Oscilloscope Telemetry & Alerts</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-accent dark:text-cyan-400 shrink-0" /> 1-Year Priority Hardware & Cloud SLA</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/signup')}
              className="mt-8 w-full py-3.5 rounded-xl bg-accent hover:bg-yellow-400 dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-500 dark:hover:from-cyan-300 dark:hover:to-blue-400 text-slate-950 font-black shadow-lg shadow-accent/25 transition-all text-sm active:scale-98"
            >
              Acquire Turnkey Platform
            </button>
          </div>

          {/* Tier 3: Fleet Network */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-premium flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Warehouse</h3>
              <p className="text-xs text-slate-500 mt-1">Multi-site enterprise deployment</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900 dark:text-white font-heading">Custom</span>
                <span className="text-slate-400 text-xs font-semibold"> / enterprise SLA</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited ESP32 Edge Nodes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-tenant organization roles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> On-premise air-gapped Docker deployment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Dedicated Support Engineering</li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/signup')}
              className="mt-8 w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
            >
              Contact Solutions Team
            </button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-white dark:bg-[#060a12] border-t border-slate-200/80 dark:border-slate-800 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Zap className="w-4 h-4 text-accent fill-accent" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight font-heading">
                ColdChain Pro
              </span>
              <p className="text-xs text-slate-400">Autonomous Thermal Custody Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>All Ingestion Systems Operational (Ch: 3483882)</span>
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} ColdChain Logistics, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
