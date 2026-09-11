import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, User, Mail, ArrowRight, Activity } from 'lucide-react';
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
        username,
        email,
        password,
        role: 'operator'
      });
      // Direct them to login after successful signup
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 rounded-sm shadow-elevated border border-slate-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <div className="bg-primary/10 p-3 rounded-full">
                 <Activity className="w-8 h-8 text-primary" />
               </div>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium">Join Cold Chain to manage your fleets.</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-sm mb-6 text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-sm py-3 pl-10 pr-4 text-slate-800 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-sm py-3 pl-10 pr-4 text-slate-800 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-sm py-3 pl-10 pr-4 text-slate-800 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-slate-500">
            Already have an account? <span onClick={() => navigate('/login')} className="text-primary hover:text-primaryHover cursor-pointer font-bold transition-colors">Log in</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
