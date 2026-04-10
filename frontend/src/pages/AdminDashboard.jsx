import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import VisitorCard from '../components/VisitorCard';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Users, Clock3, LogIn, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [visits, setVisits]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const fetchVisits = async () => {
        try {
            const res = await api.get('/visits');
            setVisits(res.data);
        } catch {
            setError('Gagal mengambil data pengunjung.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') fetchVisits();
    }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus data ini?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/visit/${id}`);
            setVisits(prev => prev.filter(v => v.id !== id));
        } catch {
            alert('Gagal menghapus data');
        } finally {
            setDeletingId(null);
        }
    };

    if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

    const counts = {
        total:     visits.length,
        pending:   visits.filter(v => v.status === 'PENDING').length,
        checkedIn: visits.filter(v => v.status === 'CHECKED_IN').length,
        checkedOut:visits.filter(v => v.status === 'CHECKED_OUT').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Page content ── max 480px centered, 16px padding */}
            <main className="max-w-[480px] mx-auto px-4 pt-5 pb-24 space-y-5">

                {/* ── Page Header ── */}
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        <h1 className="text-lg font-black text-gray-900">Admin Panel</h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-7">Kelola data pengunjung</p>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* ── Stats (2-col grid) ── */}
                <div className="grid grid-cols-2 gap-3">
                    <StatsCard icon={Users}  value={counts.total}     label="Total"      colorClass="bg-indigo-50" iconColorClass="text-indigo-600" borderColor="border-indigo-100" />
                    <StatsCard icon={Clock3} value={counts.pending}   label="Terdaftar"  colorClass="bg-yellow-50" iconColorClass="text-yellow-600" borderColor="border-yellow-100" />
                    <StatsCard icon={LogIn}  value={counts.checkedIn} label="Check In"   colorClass="bg-green-50"  iconColorClass="text-green-600"  borderColor="border-green-100" />
                    <StatsCard icon={LogOut} value={counts.checkedOut}label="Check Out"  colorClass="bg-gray-50"   iconColorClass="text-gray-500"   borderColor="border-gray-200" />
                </div>

                {/* ── Section header ── */}
                <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        Daftar Pengunjung
                    </p>
                </div>

                {/* ── Visitor list ── */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">Memuat data...</p>
                    </div>
                ) : visits.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm border border-gray-100">
                        <Users className="h-10 w-10 text-gray-200" />
                        <p className="text-sm text-gray-400 font-medium">Belum ada data pengunjung</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visits.map(visit => (
                            <VisitorCard
                                key={visit.id}
                                visit={visit}
                                onDelete={handleDelete}
                                deletingId={deletingId}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;