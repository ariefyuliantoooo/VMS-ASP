import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  User, Building2, Briefcase, MapPin, Calendar,
  Users, FileText, Upload, ArrowLeft, CheckCircle2,
  ClipboardList, Link as LinkIcon,
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

const PermitForm = () => {
  const [visits, setVisits] = useState([]);
  const [formData, setFormData] = useState({
    visitor_id: '',
    worker_name: '',
    company: '',
    job_type: '',
    work_location: '',
    start_date: '',
    end_date: '',
    pic_company: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await api.get('/visits/me');
        setVisits(res.data);
      } catch (err) {
        console.error('Failed to fetch visits for permit dropdown', err);
      }
    };
    fetchVisits();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const d = new FormData();
    Object.keys(formData).forEach(key => d.append(key, formData[key]));
    if (file) d.append('permit_file', file);

    try {
      await api.post('/permit', d, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/permits');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim work permit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      <Navbar />

      <main className="flex flex-col md:flex-row min-h-[calc(100vh-56px)]">
        {/* ── Left Panel (Desktop) ── */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-700 to-blue-700 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500 rounded-full -mr-36 -mt-36 opacity-40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full -ml-36 -mb-36 opacity-30 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="text-indigo-600 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight">
                Work Permit <span className="text-indigo-200">VMS</span>
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight mb-5">
              Apply for<br />Work Permit
            </h1>
            <p className="text-indigo-100 text-base font-medium leading-relaxed max-w-xs">
              Kontraktor dan vendor wajib melampirkan izin kerja sebelum memasuki area operasional.
            </p>
          </div>

          {/* Info card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-3">Informasi Penting</p>
            {[
              'Permit harus dikaitkan dengan visit request aktif',
              'Lampirkan dokumen PDF/gambar jika tersedia',
              'Permit ditinjau oleh tim keamanan internal',
            ].map((txt, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-indigo-100 font-medium leading-snug">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div className="flex-1 flex items-start justify-center p-5 py-8 md:p-12 overflow-y-auto">
          <div className="max-w-xl w-full">
            {/* Mobile header */}
            <div className="md:hidden flex items-center gap-2 mb-8">
              <Briefcase className="text-indigo-600 w-7 h-7" />
              <span className="text-xl font-black text-indigo-600">
                Work Permit <span className="text-indigo-400">VMS</span>
              </span>
            </div>

            {/* Back link */}
            <button
              onClick={() => navigate('/permits')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Work Permits
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Formulir Work Permit</h2>
              <p className="text-gray-400 font-medium text-sm">
                Kontraktor & vendor wajib menautkan permit ke visit request yang aktif.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-fade-in">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 font-semibold">{error}</p>
                </div>
              )}

              {/* Link to Visit */}
              <Field label="Tautkan ke Visit Request" icon={LinkIcon}>
                <select
                  name="visitor_id" required
                  value={formData.visitor_id} onChange={handleChange}
                  className={`${inputCls} appearance-none`}
                >
                  <option value="" disabled>Pilih visit yang terkait...</option>
                  {visits.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.full_name} → {v.person_to_meet} ({new Date(v.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Row: Worker + Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Nama Pekerja" icon={User}>
                  <input
                    type="text" name="worker_name" required
                    value={formData.worker_name} onChange={handleChange}
                    placeholder="Nama teknisi / pekerja"
                    className={inputCls}
                  />
                </Field>
                <Field label="Perusahaan Kontraktor" icon={Building2}>
                  <input
                    type="text" name="company" required
                    value={formData.company} onChange={handleChange}
                    placeholder="PT. Kontraktor Jaya"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row: Job type + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Jenis Pekerjaan" icon={Briefcase}>
                  <input
                    type="text" name="job_type" required
                    value={formData.job_type} onChange={handleChange}
                    placeholder="Electrical, Network, dll."
                    className={inputCls}
                  />
                </Field>
                <Field label="Lokasi Kerja" icon={MapPin}>
                  <input
                    type="text" name="work_location" required
                    value={formData.work_location} onChange={handleChange}
                    placeholder="Gedung A, Lantai 3"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row: Start + End date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Tanggal Mulai" icon={Calendar}>
                  <input
                    type="date" name="start_date" required
                    value={formData.start_date} onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
                <Field label="Tanggal Selesai" icon={Calendar}>
                  <input
                    type="date" name="end_date" required
                    value={formData.end_date} onChange={handleChange}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row: PIC + Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="PIC Internal (Sponsor)" icon={Users}>
                  <input
                    type="text" name="pic_company" required
                    value={formData.pic_company} onChange={handleChange}
                    placeholder="Nama PIC perusahaan"
                    className={inputCls}
                  />
                </Field>

                {/* File upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block">
                    Lampiran Dokumen
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-[58px] bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        {file ? file.name : 'PDF / Gambar (opsional)'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

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
                    <ClipboardList className="w-5 h-5" />
                    Kirim Work Permit
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

export default PermitForm;
