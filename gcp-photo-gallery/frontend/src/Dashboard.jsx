import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, ImagePlus, Loader2, Calendar, Camera } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

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
      const res = await axios.get('http://localhost:3001/api/photos', {
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
      
      const uploadRes = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      await axios.post('http://localhost:3001/api/photos', {
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

  // Group photos by month and year
  const groupedPhotos = photos.reduce((acc, photo) => {
    const monthYear = format(parseISO(photo.date), 'MMMM - yyyy', { locale: vi });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(photo);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Kỷ Niệm Đám Mây
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">👋 {username}</span>
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        {/* Upload Form */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ImagePlus size={20} className="text-blue-500" /> Thêm kỷ niệm mới
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh của bạn</label>
                <input 
                  type="file" accept="image/*" required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={e => setFile(e.target.files[0])}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                <input 
                  type="text" required placeholder="Chuyến đi Đà Lạt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={title} onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kỷ niệm</label>
                <div className="relative">
                  <Calendar className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="date" required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={date} onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kể lại đôi chút</label>
                <textarea 
                  rows="3" placeholder="Hôm đó trời rất đẹp..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={description} onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition flex justify-center items-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={20}/> Đang tải lên...</> : 'Lưu giữ Kỷ Niệm'}
              </button>
            </form>
          </div>
        </div>

        {/* Timeline Gallery */}
        <div className="md:w-2/3">
          {Object.keys(groupedPhotos).length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Camera size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Chưa có kỷ niệm nào.</p>
              <p className="text-sm">Hãy tải lên bức ảnh đầu tiên của bạn!</p>
            </div>
          ) : (
            Object.entries(groupedPhotos).map(([monthYear, monthPhotos]) => (
              <div key={monthYear} className="mb-10">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2 capitalize">
                  {monthYear}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {monthPhotos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                      <div className="aspect-[4/3] w-full relative">
                        <img src={photo.imageUrl} alt={photo.title} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{photo.title}</h4>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {format(parseISO(photo.date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{photo.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}