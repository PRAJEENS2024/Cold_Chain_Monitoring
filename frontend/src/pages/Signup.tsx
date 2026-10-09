import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../ThemeContext';
import { Lock, User, Mail, ArrowRight, Zap, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/signup', {
        username: username.trim(),
        email: email.trim(),
        password: password
      });
      navigate('/login');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Unable to reach the server. Please check your backend connection.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-primary/20 selection:text-primary transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 -right-32 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-cyan-400/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Theme Toggle in Corner */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun className="w-4 h-4 text-accent fill-accent" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 dark:from-blue-600 dark:to-cyan-400 shadow-lg shadow-primary/25 mb-3 text-white">
            <Zap className="w-8 h-8 text-accent fill-accent" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            ColdChain <span className="text-primary dark:text-cyanGlow">Pro</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Operator Account Registration</p>
        </div>

        <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md p-8 rounded-3xl shadow-premium dark:shadow-premium-dark border border-slate-200/90 dark:border-slate-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">Register Operator</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Create an authorized cold chain profile</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3.5 rounded-xl mb-5 text-xs font-bold shadow-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Operator Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#111c33] border border-slate-200/90 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white font-medium focus:bg-white dark:focus:bg-[#111c33] focus:outline-none focus:border-primary dark:focus:border-cyan-400 focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="e.g. operator_alex"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#111c33] border border-slate-200/90 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white font-medium focus:bg-white dark:focus:bg-[#111c33] focus:outline-none focus:border-primary dark:focus:border-cyan-400 focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="alex@coldchain.pharma"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#111c33] border border-slate-200/90 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-white font-medium focus:bg-white dark:focus:bg-[#111c33] focus:outline-none focus:border-primary dark:focus:border-cyan-400 focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-primary to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-90 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-primary/25 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-60"
            >
              <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Already have an operator account?{' '}
            <span 
              onClick={() => navigate('/login')} 
              className="text-primary dark:text-cyanGlow hover:underline cursor-pointer font-bold transition-colors"
            >
              Sign In
            </span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Role-Based Access Control • GDP Guidelines 2013/C 343/01</span>
        </div>
      </motion.div>
    </div>
  );
}
