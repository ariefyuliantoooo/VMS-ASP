import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import {
  Download, ArrowLeft, User, Building2, Users,
  Calendar, MessageSquare, Clock3, LogIn, LogOut,
  CheckCircle, XCircle, QrCode, MapPin,
} from 'lucide-react';

const STATUS_CFG = {
  PENDING:     { label: 'Menunggu',    cls: 'bg-yellow-100 text-yellow-800 border-yellow-200', Icon: Clock3 },
  APPROVED:    { label: 'Disetujui',   cls: 'bg-blue-100 text-blue-800 border-blue-200',       Icon: CheckCircle },
  REJECTED:    { label: 'Ditolak',     cls: 'bg-red-100 text-red-800 border-red-200',           Icon: XCircle },
  CHECKED_IN:  { label: 'Checked In', cls: 'bg-green-100 text-green-800 border-green-200',     Icon: LogIn },
  CHECKED_OUT: { label: 'Selesai',     cls: 'bg-gray-100 text-gray-800 border-gray-200',        Icon: LogOut },
  DONE:        { label: 'Selesai',     cls: 'bg-gray-100 text-gray-800 border-gray-200',        Icon: LogOut },
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-words">{value || '—'}</p>
    </div>
  </div>
);

const VisitDetail = () => {
  const { id } = useParams();
  const [visitData, setVisitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const res = await api.get(`/visit/${id}`);
        setVisitData(res.data);
      } catch (err) {
        setError('Gagal memuat detail kunjungan.');
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [id]);

  const handleDownloadLabel = () => {
    const link = document.createElement('a');
    link.href = visitData.qrCodeImage;
    link.download = `VMS-Pass-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
          <div className="h-5 bg-gray-200 rounded-lg w-32 mb-6 animate-pulse" />
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-20 bg-gray-100" />
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 h-80 bg-gray-50" />
              <div className="md:w-1/2 p-6 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-base font-bold text-gray-700">{error}</p>
          <Link to="/" className="text-sm text-indigo-600 font-semibold hover:underline">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!visitData) return null;

  const { visit, qrCodeImage } = visitData;
  const statusCfg = STATUS_CFG[visit.status] || STATUS_CFG.PENDING;
  const { Icon: StatusIcon } = statusCfg;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          {/* Card Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Visitor Pass</p>
                <p className="text-lg font-black text-white leading-tight">{visit.full_name}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.cls}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusCfg.label}
            </span>
          </div>

          {/* Card Body */}
          <div className="flex flex-col md:flex-row">
            {/* ── QR Code Panel ── */}
            <div className="md:w-2/5 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center justify-center p-8 gap-5">
              <div className="relative group cursor-pointer" onClick={handleDownloadLabel}>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all duration-200 z-10 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                  <img
                    src={qrCodeImage}
                    alt="Visitor QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pass ID</p>
                <p className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  {visit.qr_code?.split('-')[0]?.toUpperCase() || id}
                </p>
              </div>

              <button
                onClick={handleDownloadLabel}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl border border-indigo-100"
              >
                <Download className="w-4 h-4" />
                Download Pass
              </button>
            </div>

            {/* ── Visit Details ── */}
            <div className="flex-1 px-6 py-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-2">Detail Kunjungan</p>
            <DetailRow icon={User}         label="Nama Pengunjung"  value={visit.full_name} />
            <DetailRow icon={Building2}    label="Perusahaan"       value={visit.company} />
            <DetailRow icon={Users}        label="Bertemu Dengan"   value={visit.person_to_meet} />
            <DetailRow icon={Calendar}     label="Tanggal Kunjungan" value={new Date(visit.visit_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            <DetailRow icon={MessageSquare} label="Keperluan"       value={visit.visit_purpose} />
            <DetailRow icon={Clock3}       label="Check-in Time"   value={visit.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'} />
            <DetailRow icon={Clock3}       label="Check-out Time"  value={visit.check_out_time ? new Date(visit.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'} />
            <DetailRow icon={MapPin}       label="Location"       value={visit.location || '—'} />
            <DetailRow icon={QrCode}       label="Visitor ID"     value={visit.id ? String(visit.id).slice(0, 8).toUpperCase() : id} />
            </div>
          </div>

          {/* Instruction Banner */}
          <div className="mx-4 mb-4 px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-600 font-medium">
              Tunjukkan QR Code ini kepada petugas security saat Anda tiba di lokasi.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisitDetail;
