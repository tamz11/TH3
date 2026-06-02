import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, ImagePlus, Loader2, Calendar, Camera, Search, Bell, Home, FolderHeart, Settings, Mail, LayoutGrid, Image as ImageIcon, X, Download, Trash2, Send } from 'lucide-react';
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
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kỷ niệm này không?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/photos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(photos.filter(p => p.id !== id));
      if (selectedPhoto?.id === id) setSelectedPhoto(null);
    } catch (err) {
      alert('Không thể xóa ảnh.');
    }
  };

  const handleDownload = async (photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error);
      window.open(photo.imageUrl, '_blank');
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

  const menuItems = [
    { label: 'Tổng quan' },
    { label: 'Zoho Forms' },
    { label: 'Zoho CRM' },
    { label: 'Zoho Desk' },
    { label: 'Zoho SalesIQ' },
    { label: 'Zoho Mail' },
    { label: 'Zoho Campaigns' },
    { label: 'Zoho Analytics' },
    { label: 'Zoho Bookings' },
    { label: 'Zoho Projects' },
    { label: 'Zoho WorkDrive' },
  ];
  const [activeMenu, setActiveMenu] = useState('Tổng quan');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('loading');
    try {
      await axios.post(`${API_BASE_URL}/api/send-email`, {
        name: contactName,
        email: contactEmail,
        message: contactMessage
      });
      setContactStatus('success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      setContactStatus('error');
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-inter overflow-hidden text-gray-800">
      {/* SIDEBAR - Desktop */}
      <aside className="w-[280px] bg-[#F4F7FB] hidden lg:flex flex-col z-20">
        <div className="h-28 flex items-center px-8 shrink-0 pt-6">
          <div className="w-[50px] h-[50px] bg-[#89D1FF] text-xl font-bold text-slate-800 rounded-[1.25rem] flex items-center justify-center mr-4 shrink-0 shadow-sm">
            z
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-black text-gray-900 leading-tight">Unicare</span>
            <span className="text-[13px] text-gray-500 font-medium mt-0.5">Cổng Zoho</span>
          </div>
        </div>
        
        <div className="flex-1 py-4 px-5 space-y-1.5 overflow-y-auto w-full scrollbar-hide">
          {menuItems.map(item => (
            <button 
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              className={`w-full text-left px-5 py-3.5 rounded-[1rem] transition-all font-bold text-[15px] outline-none ${item.label === activeMenu ? 'bg-[#E5F3FF] text-gray-900' : 'text-slate-600 hover:bg-gray-200/50 hover:text-gray-900'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-5 w-full shrink-0">
          <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm outline-none">
            <LogOut size={20} strokeWidth={2.5} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        
        {/* HEADER */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sm:px-10 z-10 shrink-0 w-full">
          <div className="flex items-center lg:hidden gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-md">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          
          <div className="hidden md:flex items-center bg-gray-100/80 hover:bg-gray-100 px-5 py-2.5 rounded-full w-[400px] border border-transparent focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-300 transition-all ml-4">
            <Search size={18} className="text-gray-400 mr-3" />
            <input type="text" placeholder="Tìm kiếm kỷ niệm, địa điểm..." className="bg-transparent border-none outline-none w-full text-sm font-medium text-gray-700 placeholder:text-gray-400" />
          </div>
          
          <div className="flex items-center gap-5 ml-auto">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative hidden sm:block outline-none">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block group-hover:text-blue-600 transition-colors">
                <p className="text-sm font-bold leading-tight">{username}</p>
                <p className="text-xs font-medium opacity-80">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                {username ? username.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg lg:hidden transition-colors outline-none">
              <LogOut size={22} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 w-full">
          <div className="max-w-[1600px] mx-auto space-y-10">
            
            {/* STATS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0"><ImageIcon size={26} strokeWidth={2} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Tổng Số Ảnh</p>
                  <p className="text-3xl font-black text-gray-800">{photos.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0"><FolderHeart size={26} strokeWidth={2} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Album Đã Tạo</p>
                  <p className="text-3xl font-black text-gray-800">{Object.keys(groupedPhotos).length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0"><Calendar size={26} strokeWidth={2} /></div>
                <div>
                  <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mb-1">Lần Đổi Mới Nhất</p>
                  <p className="text-lg font-black text-gray-800">{photos.length > 0 ? format(parseISO(photos[0].date), 'dd/MM/yyyy') : 'Chưa có'}</p>
                </div>
              </div>
            </div>

            {/* CONTENT SPLIT: GALLERY vs UPLOAD vs CONTACT */}
            {activeMenu === 'Zoho Mail' ? (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Mail size={24} />
                  </div>
                  Liên hệ với chúng tôi
                </h2>
                
                {contactStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium">
                    Tin nhắn của bạn đã được gửi thành công!
                  </div>
                )}
                {contactStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
                    Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                    <input 
                      type="text" 
                      required 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
                      placeholder="Nhập email liên hệ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Lời nhắn</label>
                    <textarea 
                      required 
                      rows="5"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all resize-none"
                      placeholder="Bạn muốn nhắn nhủ điều gì..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={contactStatus === 'loading'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {contactStatus === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Gửi tin nhắn</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col-reverse xl:flex-row gap-10">
              
              {/* TIMELINE GALLERY */}
              <div className="flex-1 w-full relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">Thư viện Kỷ niệm</h2>
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold flex items-center gap-2 outline-none">
                       <LayoutGrid size={16} /> Lưới
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-50 text-gray-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors outline-none">
                       Danh sách
                    </button>
                  </div>
                </div>

                {Object.keys(groupedPhotos).length === 0 ? (
                  <div className="w-full h-80 bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <Camera size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có kỷ niệm nào</h3>
                    <p className="text-gray-500 max-w-sm">Tải lên những bức ảnh đầu tiên để tạo album cho riêng bạn ở cột bên cạnh.</p>
                  </div>
                ) : (
                  <div className="space-y-12 pb-10">
                    {Object.entries(groupedPhotos).map(([monthYear, monthPhotos]) => (
                      <div key={monthYear} className="relative">
                        <div className="flex items-center gap-4 mb-8 sticky top-0 z-10 py-2 bg-[#F8FAFC]/90 backdrop-blur-sm">
                          <h2 className="text-base font-black text-gray-800 uppercase tracking-wider bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 inline-flex items-center gap-2 shrink-0">
                            <Calendar size={18} className="text-blue-500" /> {monthYear}
                          </h2>
                          <div className="h-0.5 bg-gradient-to-r from-gray-200 to-transparent flex-1 rounded-full"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                          {monthPhotos.map(photo => (
                            <div 
                              key={photo.id} 
                              onClick={() => setSelectedPhoto(photo)}
                              className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col sm:hover:-translate-y-1.5 cursor-pointer focus-within:ring-4 focus-within:ring-blue-500/20"
                            >
                              <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-50">
                                <img 
                                  src={photo.imageUrl} 
                                  alt={photo.title} 
                                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              <div className="p-6 flex-1 flex flex-col bg-white z-10 relative">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                  <h4 className="text-lg font-black text-gray-900 leading-tight">{photo.title}</h4>
                                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full whitespace-nowrap border border-blue-100/50 shadow-sm shrink-0">
                                    {format(parseISO(photo.date), 'dd/MM')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">{photo.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPLOAD FORM - FIXED SIDEBAR ON XXL */}
              <div className="xl:w-[420px] shrink-0 w-full">
                <div className="bg-white p-7 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 xl:sticky xl:top-4">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner border border-blue-100">
                      <ImagePlus size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">Thêm ảnh mới</h3>
                  </div>
                  
                  <form onSubmit={handleUpload} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Tải ảnh lên</label>
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-[140px] border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all group overflow-hidden relative">
                        {file ? (
                          <div className="flex items-center justify-center w-full h-full bg-blue-50">
                             <div className="text-center p-4">
                               <ImageIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                               <p className="text-sm font-bold text-blue-700 line-clamp-1 truncate px-2 w-full">{file.name}</p>
                               <span className="text-xs text-blue-500 font-medium">Nhấn để đổi ảnh khác</span>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <p className="text-sm font-bold text-gray-600">Kéo thả hoặc nhấn vào đây</p>
                            <p className="text-xs text-gray-400 mt-1">Định dạng JPG, PNG, WEBP</p>
                          </div>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} required={!file} />
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Chủ đề album</label>
                      <input 
                        type="text" required placeholder="Ví dụ: Chuyến đi Đà Lạt..."
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm font-bold placeholder:font-medium placeholder:text-gray-400 text-gray-800"
                        value={title} onChange={e => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Ngày chụp</label>
                      <div className="relative">
                        <Calendar className="absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
                        <input 
                          type="date" required
                          className="pl-12 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-gray-800"
                          value={date} onChange={e => setDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Mô tả kỷ niệm</label>
                      <textarea 
                        rows="3" placeholder="Ghi lại cảm xúc của bạn..."
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium resize-none placeholder:text-gray-400 text-gray-800"
                        value={description} onChange={e => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 mt-8 disabled:opacity-70 disabled:hover:translate-y-0 text-base outline-none"
                    >
                      {loading ? <><Loader2 className="animate-spin" size={22}/> Đang tải lên...</> : 'Lưu Giữ Trên Đám Mây'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            )}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 bg-gray-900/40 hover:bg-gray-900/80 backdrop-blur-md text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            {/* Image Section */}
            <div className="md:w-2/3 lg:w-3/4 bg-black flex items-center justify-center relative overflow-hidden min-h-[40vh] md:min-h-[70vh] lg:min-h-[85vh]">
              <img 
                src={selectedPhoto.imageUrl} 
                alt={selectedPhoto.title} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
            
            {/* Details Section */}
            <div className="md:w-1/3 lg:w-1/4 flex flex-col h-full bg-white max-h-[50vh] md:max-h-[85vh]">
              <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold bg-blue-50 w-max px-3 py-1.5 rounded-full text-sm">
                  <Calendar size={16} />
                  {format(parseISO(selectedPhoto.date), 'dd/MM/yyyy')}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">{selectedPhoto.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedPhoto.description}</p>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/80 flex flex-col gap-3 shrink-0">
                <button 
                  onClick={() => handleDownload(selectedPhoto)}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex justify-center items-center gap-2 outline-none"
                >
                  <Download size={20} /> Tải ảnh về máy
                </button>
                <button 
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="w-full bg-white border border-red-200 text-red-600 font-bold py-3.5 rounded-xl hover:bg-red-50 transition-colors flex justify-center items-center gap-2 outline-none"
                >
                  <Trash2 size={20} /> Xóa kỷ niệm này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}