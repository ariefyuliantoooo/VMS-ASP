import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  User, Building2, Phone, Calendar, UserCheck,
  MessageSquare, ClipboardList, ArrowLeft, CheckCircle2, MapPin
} from 'lucide-react';

/* ── Shared field wrapper ── */
const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      {children}
    </div>
  </div>
);

const inputCls =
  'w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all shadow-sm hover:bg-gray-50/50 focus:hover:bg-white text-sm';

const VisitForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    phone: '',
    visit_purpose: '',
    person_to_meet: '',
    visit_date: '',
    location: '',
  });
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/users/staff');
        setStaffList(res.data);
        if (res.data?.length > 0) {
          setFormData(prev => ({ ...prev, person_to_meet: res.data[0].full_name }));
        }
      } catch (err) {
        console.error('Failed to fetch staff list', err);
        setError('Gagal memuat daftar staff. Silakan coba lagi.');
      } finally {
        setFetchingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/visit', formData);
      navigate(`/visit/${res.data.visit.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim permintaan kunjungan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      <Navbar />

      <main className="flex flex-col md:flex-row min-h-[calc(100vh-56px)]">
        {/* ── Left Panel (Desktop only) ── */}
        <div className="hidden md:flex md:w-5/12 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full -mr-36 -mt-36 opacity-50 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full -ml-36 -mb-36 opacity-30 blur-3xl pointer-events-none" />

          {/* Top */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="text-indigo-600 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight">
                VMS <span className="text-indigo-200">ASP</span>
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight mb-5">
              Registrasi<br />Kunjungan Baru
            </h1>
            <p className="text-indigo-100 text-base font-medium leading-relaxed max-w-xs">
              Lengkapi formulir dan dapatkan QR Pass kunjungan Anda secara instan.
            </p>
          </div>

          {/* Steps card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-3">Langkah Mudah</p>
            {[
              { step: '01', text: 'Isi formulir kunjungan' },
              { step: '02', text: 'Kirim & dapatkan QR Code' },
              { step: '03', text: 'Tunjukkan QR ke security saat tiba' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                  {step}
                </span>
                <span className="text-sm text-indigo-100 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div className="flex-1 flex items-start justify-center p-5 py-8 md:p-12 overflow-y-auto">
          <div className="max-w-xl w-full">
            {/* Mobile header */}
            <div className="md:hidden flex items-center gap-2 mb-8">
              <ClipboardList className="text-indigo-600 w-7 h-7" />
              <span className="text-xl font-black text-indigo-600">
                VMS <span className="text-indigo-400">ASP</span>
              </span>
            </div>

            {/* Back link */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Formulir Kunjungan</h2>
              <p className="text-gray-400 font-medium text-sm">Lengkapi semua data di bawah ini.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-fade-in">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{error}</p>
                </div>
              )}

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Nama Lengkap" icon={User}>
                  <input
                    type="text" name="full_name" required
                    value={formData.full_name} onChange={handleChange}
                    placeholder="John Doe"
                    className={inputCls}
                  />
                </Field>
                <Field label="Perusahaan" icon={Building2}>
                  <input
                    type="text" name="company" required
                    value={formData.company} onChange={handleChange}
                    placeholder="PT. Contoh Jaya"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="No. Telepon" icon={Phone}>
                  <input
                    type="text" name="phone" required
                    value={formData.phone} onChange={handleChange}
                    placeholder="0812345xxxxx"
                    className={inputCls}
                  />
                </Field>
                <Field label="Tanggal Kunjungan" icon={Calendar}>
                  <input
                    type="date" name="visit_date" required
                    value={formData.visit_date} onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Person to meet and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Bertemu Dengan" icon={UserCheck}>
                  <select
                    name="person_to_meet" required
                    value={formData.person_to_meet} onChange={handleChange}
                    disabled={fetchingStaff || staffList.length === 0}
                    className={`${inputCls} appearance-none disabled:bg-gray-100 disabled:text-gray-400`}
                  >
                    <option value="">
                      {fetchingStaff ? 'Memuat daftar staff...' : staffList.length === 0 ? 'Tidak ada staff tersedia' : 'Pilih staff yang ditemui...'}
                    </option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.full_name}>{s.full_name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Lokasi" icon={MapPin}>
                  <input
                    type="text" name="location"
                    value={formData.location} onChange={handleChange}
                    placeholder="Lobby, Ruang Meeting 1, dll"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Purpose */}
              <Field label="Keperluan Kunjungan" icon={MessageSquare}>
                <textarea
                  name="visit_purpose" rows={3} required
                  value={formData.visit_purpose} onChange={handleChange}
                  placeholder="Apa tujuan kunjungan Anda?"
                  className={`${inputCls} resize-none`}
                  style={{ paddingTop: '1rem' }}
                />
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200/60 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60 disabled:scale-100 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Kirim Permohonan Kunjungan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisitForm;
