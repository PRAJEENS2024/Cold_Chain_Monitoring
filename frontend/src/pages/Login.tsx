import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      login(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
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
            <h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Log in to manage your Cold Chain logistics</p>
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
                  placeholder="e.g. admin"
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
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end mt-1">
                <a href="#" className="text-xs font-semibold text-primary hover:text-primaryHover transition-colors">Forgot password?</a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 shadow-sm"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-slate-500">
            Don't have an account? <span onClick={() => navigate('/signup')} className="text-primary hover:text-primaryHover cursor-pointer font-bold transition-colors">Sign up</span>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs font-semibold text-slate-400">
          &copy; 2026 ColdChain Logistics Pvt Ltd.
        </div>
      </motion.div>
    </div>
  );
}
