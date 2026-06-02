import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Mail, Lock, ArrowRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '');

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-gray-100 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 space-y-8 transition-all">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 text-white">
            <Camera className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">Kỷ niệm của bạn</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Đăng nhập để xem nhật ký ảnh</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-5">
            <div className="relative group">
              <Mail className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                required
                className="pl-12 w-full px-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
                placeholder="Tên đăng nhập"
                value={username} onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute top-3.5 left-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                required
                className="pl-12 w-full px-4 py-3.5 bg-white/60 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-gray-700 font-medium placeholder:font-normal"
                placeholder="Mật khẩu"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold text-lg transition-all flex items-center justify-center gap-2 group">
            Đăng nhập <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        <div className="text-center mt-6 text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors ml-1">Đăng ký ngay</Link>
        </div>
        <div className="text-center pt-6 mt-6 border-t border-gray-100 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cần hỗ trợ?</span>
          <a href="mailto:g1165httt@memoriesstore.app" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            <Mail size={14} /> g1165httt@memoriesstore.app
          </a>
        </div>
      </div>
    </div>
  );
}