import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, User, Mail, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#f1f3f6] via-white to-blue-50/40 flex flex-col justify-center items-center p-4 selection:bg-primary/20 selection:text-primary">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 shadow-lg shadow-primary/30 mb-3 text-white">
            <Zap className="w-8 h-8 text-accent fill-accent" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            ColdChain <span className="text-primary">Pro</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Operator Account Registration</p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-premium border border-slate-200/90">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">Create Account</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Register new Cold Chain logistics supervisor</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl mb-5 text-xs font-bold shadow-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Choose username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="operator@coldchain.local"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={4}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-primary/25 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 text-sm active:scale-98 disabled:opacity-60"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs font-medium text-slate-500">
            Already registered?{' '}
            <span 
              onClick={() => navigate('/login')} 
              className="text-primary hover:text-blue-700 cursor-pointer font-bold transition-colors"
            >
              Log in
            </span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>ColdChain Monitoring Platform • 21 CFR Part 11</span>
        </div>
      </motion.div>
    </div>
  );
}
