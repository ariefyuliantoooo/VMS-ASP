import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Building2, Phone, Calendar, UserCheck, MessageSquare, CheckCircle2, Download, QrCode, MapPin } from 'lucide-react';

const GuestVisit = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        company: '',
        phone: '',
        visit_purpose: '',
        person_to_meet: '',
        visit_date: new Date().toISOString().split('T')[0],
        location: ''
    });
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingStaff, setFetchingStaff] = useState(true);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null); // { visit, qrCodeImage }
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await api.get('/users/staff');
                setStaffList(res.data);
            } catch (err) {
                console.error("Failed to fetch staff list", err);
                setError("Gagal memuat daftar staff. Silakan coba lagi nanti.");
            } finally {
                setFetchingStaff(false);
            }
        };
        fetchStaff();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/visit/public', formData);
            setSuccessData(res.data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim permintaan kunjungan');
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 py-12">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-200/50 p-8 text-center animate-fade-in border border-blue-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
                    <p className="text-gray-500 text-sm mb-8">Silakan simpan QR Code di bawah ini untuk Check-In saat tiba di lokasi.</p>

                    <div className="bg-blue-50 rounded-[2rem] p-6 mb-8 border border-blue-100/50 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <Download className="w-8 h-8 text-blue-600 animate-bounce" />
                        </div>
                        <img 
                            src={successData.qrCodeImage} 
                            alt="Visit QR Code" 
                            className="w-48 h-48 mx-auto mix-blend-multiply relative z-10"
                        />
                    </div>

                    <div className="text-left space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Nama Tamu</span>
                            <span className="font-bold text-gray-700">{successData.visit.full_name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Bertemu Dengan</span>
                            <span className="font-bold text-gray-700">{successData.visit.person_to_meet}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">ID Kunjungan</span>
                            <span className="font-mono text-blue-600 font-bold uppercase">{successData.visit.qr_code.split('-')[0]}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex flex-col md:flex-row">
            {/* Left Side: Illustration/Text */}
            <div className="hidden md:flex md:w-5/12 bg-blue-600 p-12 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full -ml-32 -mb-32 opacity-30 blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <QrCode className="text-blue-600 w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">VMS <span className="text-blue-200">ASP</span></span>
                    </div>
                    
                    <h1 className="text-5xl font-black leading-tight mb-6">
                        Selamat Datang <br /> di Sistem Kunjungan.
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md font-medium leading-relaxed">
                        Daftarkan kunjungan Anda dalam hitungan detik. Cepat, aman, dan tanpa perlu membuat akun.
                    </p>
                </div>

                <div className="relative z-10 bg-blue-700/50 backdrop-blur-md p-6 rounded-[2rem] border border-blue-400/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Langkah Mudah</p>
                            <p className="text-xs text-blue-200">Isi form &rarr; Dapatkan QR &rarr; Check-In</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-6 py-12 md:p-12 overflow-y-auto">
                <div className="max-w-xl w-full">
                    <div className="md:hidden flex items-center gap-2 mb-8">
                        <QrCode className="text-blue-600 w-8 h-8" />
                        <span className="text-xl font-black text-blue-600">VMS <span className="text-blue-400">ASP</span></span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Registrasi Pengunjung</h2>
                        <p className="text-gray-500 font-medium">Lengkapi detail kunjungan Anda untuk mendapatkan QR Code.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <p className="text-sm text-red-600 font-bold">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="text" name="full_name" required 
                                        value={formData.full_name} onChange={handleChange} 
                                        placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Perusahaan</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="text" name="company" required 
                                        value={formData.company} onChange={handleChange} 
                                        placeholder="PT. Maju Mundur"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">No. Telepon</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="text" name="phone" required 
                                        value={formData.phone} onChange={handleChange} 
                                        placeholder="0812345xxxxx"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tanggal Kunjungan</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="date" name="visit_date" required 
                                        value={formData.visit_date} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bertemu Dengan</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                    <select 
                                        name="person_to_meet" required 
                                        value={formData.person_to_meet} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50 appearance-none disabled:bg-gray-100"
                                        disabled={fetchingStaff || staffList.length === 0}
                                    >
                                        <option value="">
                                            {fetchingStaff ? 'Memuat daftar staff...' : staffList.length === 0 ? 'Tidak ada staff tersedia' : 'Pilih staff yang ditemui...'}
                                        </option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.full_name}>{s.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Lokasi</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="text" name="location" 
                                        value={formData.location} onChange={handleChange} 
                                        placeholder="Lobby, Ruang Meeting 1, dll"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Keperluan Kunjungan</label>
                            <div className="relative group">
                                <div className="absolute top-4 left-4 flex items-start pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <textarea 
                                    name="visit_purpose" rows={3} required 
                                    value={formData.visit_purpose} onChange={handleChange} 
                                    placeholder="Apa tujuan kunjungan Anda?"
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all shadow-sm group-hover:bg-gray-50"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" disabled={loading} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-blue-300"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><span>Daftar Sekarang</span> <CheckCircle2 className="w-6 h-6" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-12 text-sm text-gray-400 font-medium">
                        Sudah punya akun? <a href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GuestVisit;
