import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, ImagePlus, Loader2, Calendar, Camera } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '');

export default function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    } else {
      fetchPhotos();
    }
  }, [token]);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/photos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Vui lòng chọn ảnh!');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      await axios.post(`${API_BASE_URL}/api/photos`, {
        title,
        description,
        imageUrl: uploadRes.data.url,
        date: date
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFile(null);
      setTitle('');
      setDescription('');
      fetchPhotos();
    } catch (err) {
      alert('Tải ảnh thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    const monthYear = format(parseISO(photo.date), 'MMMM - yyyy', { locale: vi });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(photo);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-inter">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Camera size={24} className="text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hidden sm:block tracking-tight">
              Kỷ Niệm Đám Mây
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200/60 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-gray-700 font-semibold text-sm hidden sm:block tracking-wide">{username}</span>
            </div>
            <button onClick={logout} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full sm:rounded-xl transition-colors font-semibold">
              <LogOut size={18} strokeWidth={2.5} />
              <span className="hidden sm:block text-sm">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        {/* Upload Form */}
        <div className="md:w-[320px] lg:w-[380px] shrink-0">
          <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
                <ImagePlus size={22} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">Thêm kỷ niệm</h3>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Ảnh của bạn</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-400 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <ImagePlus className="w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <p className="text-xs text-gray-500 font-medium line-clamp-1">{file ? file.name : 'Nhấn để chọn ảnh'}</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} required={!file} />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Chủ đề</label>
                <input 
                  type="text" required placeholder="Ví dụ: Chuyến đi Đà Lạt..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium placeholder:font-normal text-gray-800"
                  value={title} onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Ngày kỷ niệm</label>
                <div className="relative">
                  <Calendar className="absolute top-3 left-4 h-5 w-5 text-gray-400" />
                  <input 
                    type="date" required
                    className="pl-12 w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-800"
                    value={date} onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Kể lại đôi chút</label>
                <textarea 
                  rows="3" placeholder="Hôm đó trời rất đẹp..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium resize-none placeholder:font-normal text-gray-800"
                  value={description} onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <><Loader2 className="animate-spin" size={20}/> Đang tải lên...</> : 'Lưu Giữ Kỷ Niệm'}
              </button>
            </form>
          </div>
        </div>

        {/* Timeline Gallery */}
        <div className="md:flex-1">
          {Object.keys(groupedPhotos).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm mt-8 md:mt-0">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <Camera size={36} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có kỷ niệm nào</h3>
              <p className="text-gray-500 max-w-sm text-sm">Hãy tạo album đầu tiên bằng cách tải lên những bức ảnh yêu thích của bạn nhé!</p>
            </div>
          ) : (
            <div className="space-y-12 pb-10">
              {Object.entries(groupedPhotos).map(([monthYear, monthPhotos]) => (
                <div key={monthYear} className="relative">
                  <div className="flex items-center gap-4 mb-6 sticky top-24 z-30 pt-4 pb-2 bg-[#F8FAFC]/90 backdrop-blur-sm">
                    <h2 className="text-lg font-black text-gray-800 capitalize bg-white px-5 py-2 rounded-full shadow-sm border border-gray-100/50 inline-block">
                      {monthYear}
                    </h2>
                    <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {monthPhotos.map(photo => (
                      <div key={photo.id} className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col hover:-translate-y-1">
                        <div className="aspect-[4/4] sm:aspect-[4/3] w-full relative overflow-hidden bg-gray-100">
                          <img 
                            src={photo.imageUrl} 
                            alt={photo.title} 
                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col bg-white z-10 relative">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <h4 className="text-base font-bold text-gray-900 leading-tight">{photo.title}</h4>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap border border-blue-100">
                              {format(parseISO(photo.date), 'dd/MM')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mt-1 font-medium">{photo.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}