import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-slate-800 tracking-tight">ColdChain</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-primary font-semibold transition-colors px-4 py-2">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="bg-primary hover:bg-primaryHover text-white px-5 py-2 rounded-sm font-bold shadow-sm transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Next-Gen IoT Platform
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tighter">
            End-to-End <br/>
            <span className="text-primary">Temperature</span> Security.
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto lg:mx-0">
            Ensure compliance, prevent excursions, and monitor your global fleet in real-time with our enterprise-grade Cold Chain logistics platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-primary hover:bg-primaryHover text-white px-8 py-3.5 rounded-sm font-bold shadow-elevated transition-all flex items-center justify-center gap-2 text-lg">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-sm font-bold shadow-flat transition-all text-lg">
              View Live Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 relative w-full max-w-lg lg:max-w-none"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl transform scale-110"></div>
          <div className="bg-white p-2 rounded-sm shadow-2xl border border-slate-200 relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-auto rounded border border-slate-100" />
            
            {/* Floating element */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -left-6 -bottom-6 bg-white p-4 rounded-sm shadow-elevated border border-slate-200 flex items-center gap-4"
            >
              <div className="bg-emerald-50 p-2 rounded-sm border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Shipment Status</div>
                <div className="text-emerald-600 font-extrabold text-lg">100% Secure</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-y border-slate-200 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Everything you need to secure your supply chain</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">ColdChain connects directly with your IoT hardware to provide real-time alerts, AI predictions, and compliance reports.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-blue-100 border border-primary text-primary flex items-center justify-center rounded-sm mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Live Telemetry</h3>
              <p className="text-slate-600">Connect ESP32 devices seamlessly. Monitor temperature and door states in real-time across your entire fleet.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-yellow-100 border border-accent text-yellow-600 flex items-center justify-center rounded-sm mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Automated Alerts</h3>
              <p className="text-slate-600">Set custom thresholds and receive instant notifications if a shipment experiences a temperature excursion.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-sm hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-emerald-100 border border-emerald-500 text-emerald-600 flex items-center justify-center rounded-sm mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI Predictions</h3>
              <p className="text-slate-600">Leverage predictive models to forecast future temperature trends before an excursion actually happens.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-white tracking-tight">ColdChain</span>
          </div>
          <p className="mb-6 font-medium">Enterprise logistics and temperature monitoring, rebuilt for the modern web.</p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} ColdChain Logistics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
