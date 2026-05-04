import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  FileText, Download, Briefcase, Plus, Calendar,
  Building2, MapPin, User, AlertCircle, ExternalLink,
} from 'lucide-react';

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-14 bg-gray-100" />
    <div className="px-5 py-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
    </div>
    <div className="px-5 pb-4">
      <div className="h-9 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

const PermitList = () => {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermits = async () => {
      try {
        const res = await api.get('/permit');
        setPermits(res.data);
      } catch (err) {
        console.error('Failed to fetch permits', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPermits();
  }, []);

  const getDownloadUrl = (path) => {
    const baseUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5006';
    return `${baseUrl}${path}`;
  };

  const formatDateRange = (start, end) => {
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    const s = new Date(start).toLocaleDateString('id-ID', opts);
    const e = new Date(end).toLocaleDateString('id-ID', opts);
    return `${s} — ${e}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Work Permits</h1>
            <p className="text-sm text-gray-400 mt-0.5">Dokumen izin kerja untuk kunjungan kontraktor & vendor</p>
          </div>
          <Link
            to="/permit/new"
            className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Apply Permit</span>
            <span className="sm:hidden">Baru</span>
          </Link>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : permits.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center animate-fade-in">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Belum ada Work Permit</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
              Buat work permit untuk melampirkan izin kerja pada kunjungan kontraktor atau vendor.
            </p>
            <Link
              to="/permit/new"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Apply Work Permit
            </Link>
          </div>
        ) : (
          /* Permit Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {permits.map((permit) => (
              <div
                key={permit.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Card header */}
                <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <p className="text-sm font-black text-gray-900 truncate">{permit.job_type}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-100">
                      <Calendar className="w-3 h-3" />
                      {formatDateRange(permit.start_date, permit.end_date)}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold truncate">{permit.worker_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{permit.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{permit.work_location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <AlertCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">PIC: <span className="font-semibold text-gray-700">{permit.pic_company}</span></span>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-5 pb-4">
                  {permit.permit_file ? (
                    <a
                      href={getDownloadUrl(permit.permit_file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 transition-all active:scale-[0.98]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Lihat Dokumen Terlampir
                    </a>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-400 text-xs font-semibold border border-gray-100">
                      <FileText className="w-3.5 h-3.5" />
                      Tidak ada dokumen
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PermitList;
