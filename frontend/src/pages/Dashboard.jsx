import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import { AuthContext } from '../context/AuthContext';
import {
  Calendar, User as UserIcon, CheckCircle, Clock3,
  LogIn, LogOut, Plus, Building2, MessageSquare, Users, MapPin
} from 'lucide-react';

const getStatusCfg = (status) => ({
  PENDING:     { label: 'Terdaftar',   bar: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400', Icon: Clock3 },
  APPROVED:    { label: 'Disetujui',   bar: 'bg-blue-50 border-blue-100',     text: 'text-blue-700',   dot: 'bg-blue-400',   Icon: CheckCircle },
  CHECKED_IN:  { label: 'Checked In',  bar: 'bg-green-50 border-green-100',   text: 'text-green-700',  dot: 'bg-green-400',  Icon: LogIn },
  CHECKED_OUT: { label: 'Checked Out', bar: 'bg-gray-50 border-gray-200',     text: 'text-gray-500',   dot: 'bg-gray-300',   Icon: LogOut },
  DONE:        { label: 'Selesai',     bar: 'bg-gray-50 border-gray-200',     text: 'text-gray-500',   dot: 'bg-gray-300',   Icon: LogOut },
  REJECTED:    { label: 'Ditolak',     bar: 'bg-red-50 border-red-100',       text: 'text-red-600',    dot: 'bg-red-400',    Icon: Clock3 },
}[status] || { label: status, bar: 'bg-gray-50 border-gray-100', text: 'text-gray-500', dot: 'bg-gray-300', Icon: Clock3 });

/* ── Skeleton Card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-9 bg-gray-100 w-full" />
    <div className="px-4 pt-3 pb-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
    </div>
  </div>
);

const Dashboard = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await api.get('/visits/me');
        setVisits(res.data);
      } catch (err) {
        console.error('Failed to fetch visits', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  const isStaff = user?.role === 'STAFF';

  const counts = {
    total:     visits.length,
    pending:   visits.filter(v => v.status === 'PENDING').length,
    checkedIn: visits.filter(v => v.status === 'CHECKED_IN').length,
    done:      visits.filter(v => v.status === 'DONE' || v.status === 'CHECKED_OUT').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {isStaff ? 'Tamu Saya' : 'Kunjungan Saya'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {isStaff
                ? 'Daftar tamu yang menjadwalkan pertemuan dengan Anda'
                : 'Riwayat dan status kunjungan Anda'}
            </p>
          </div>
          {!isStaff && (
            <Link
              to="/visit/new"
              className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Buat Kunjungan</span>
              <span className="sm:hidden">Baru</span>
            </Link>
          )}
        </div>

        {/* ── Stats Cards ── */}
        {!loading && visits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
            <StatsCard icon={Users}    value={counts.total}     label="Total"       colorClass="bg-indigo-50"  iconColorClass="text-indigo-600" borderColor="border-indigo-100" />
            <StatsCard icon={Clock3}   value={counts.pending}   label="Terdaftar"   colorClass="bg-yellow-50"  iconColorClass="text-yellow-600" borderColor="border-yellow-100" />
            <StatsCard icon={LogIn}    value={counts.checkedIn} label="Checked In"  colorClass="bg-green-50"   iconColorClass="text-green-600"  borderColor="border-green-100" />
            <StatsCard icon={LogOut}   value={counts.done}      label="Selesai"     colorClass="bg-gray-100"   iconColorClass="text-gray-500"   borderColor="border-gray-200" />
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-3 animate-fade-in">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : visits.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {isStaff ? 'Belum ada tamu' : 'Belum ada kunjungan'}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
              {isStaff
                ? 'Belum ada tamu yang menjadwalkan pertemuan dengan Anda.'
                : 'Mulai dengan membuat reservasi kunjungan baru.'}
            </p>
            {!isStaff && (
              <Link
                to="/visit/new"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Buat Kunjungan Baru
              </Link>
            )}
          </div>
        ) : (
          /* Visit List */
          <div className="space-y-3 animate-fade-in">
            {visits.map((visit) => {
              const cfg = getStatusCfg(visit.status);
              const { Icon: StatusIcon } = cfg;
              return (
                <Link key={visit.id} to={`/visit/${visit.id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    {/* Status bar */}
                    <div className={`flex items-center justify-between px-4 py-2.5 border-b ${cfg.bar}`}>
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(visit.visit_date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-3.5">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {isStaff ? visit.full_name : `Bertemu: ${visit.person_to_meet}`}
                        </p>
                        <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100 flex-shrink-0 ml-2">
                          ID: {visit.qr_code ? visit.qr_code.split('-')[0].toUpperCase() : visit.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {isStaff ? (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {visit.company}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <UserIcon className="w-3 h-3 text-gray-400" />
                            {visit.full_name} · {visit.company}
                          </span>
                        )}
                        {visit.visit_purpose && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MessageSquare className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{visit.visit_purpose}</span>
                          </span>
                        )}
                        {visit.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{visit.location}</span>
                          </span>
                        )}
                        {visit.check_in_time && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock3 className="w-3 h-3" />
                            <span className="truncate">In: {new Date(visit.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        )}
                        {visit.check_out_time && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock3 className="w-3 h-3" />
                            <span className="truncate">Out: {new Date(visit.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
