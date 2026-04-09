import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Trash2, Users, Clock3, LogIn, LogOut, Briefcase, AlertCircle, Phone, Calendar, Building2, User } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const fetchVisits = async () => {
        try {
            const res = await api.get('/visits');
            setVisits(res.data);
        } catch (err) {
            setError('Gagal mengambil data pengunjung.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user && user.role === 'ADMIN') {
           fetchVisits();
        }
    }, [user]);

    const handleDelete = async (id) => {
        if(window.confirm('Yakin ingin menghapus data pengunjung ini?')) {
            setDeletingId(id);
            try {
                await api.delete(`/visit/${id}`);
                setVisits(visits.filter(v => v.id !== id));
            } catch (err) {
                alert('Gagal menghapus data');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CHECKED_IN':
                return 'bg-green-100 text-green-800';
            case 'CHECKED_OUT':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock3 className="w-3 h-3 mr-1" />;
            case 'CHECKED_IN':
                return <LogIn className="w-3 h-3 mr-1" />;
            case 'CHECKED_OUT':
                return <LogOut className="w-3 h-3 mr-1" />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Terdaftar';
            case 'CHECKED_IN':
                return 'Check In';
            case 'CHECKED_OUT':
                return 'Check Out';
            default:
                return status;
        }
    };

    const counts = {
        total: visits.length,
        pending: visits.filter(v => v.status === 'PENDING').length,
        checkedIn: visits.filter(v => v.status === 'CHECKED_IN').length,
        checkedOut: visits.filter(v => v.status === 'CHECKED_OUT').length,
    };

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            
            <div className="px-4 py-4 pb-20">
                {/* Header */}
                <div className="mb-5">
                    <div className="flex items-center space-x-2 mb-1">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <p className="text-xs text-gray-500">Kelola data pengunjung</p>
                </div>
                
                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
                
                {/* Statistik */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{counts.total}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock3 className="h-4 w-4 text-yellow-600" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{counts.pending}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Terdaftar</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <LogIn className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{counts.checkedIn}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Check In</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <LogOut className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{counts.checkedOut}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Check Out</p>
                    </div>
                </div>
                
                {/* Daftar Pengunjung */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Daftar Pengunjung</h2>
                    
                    {loading ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-2">Memuat...</p>
                        </div>
                    ) : visits.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Belum ada data pengunjung</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {visits.map((visit) => (
                                <div key={visit.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Status Bar */}
                                    <div className={`px-3 py-2 ${getStatusBadge(visit.status)} flex items-center justify-between`}>
                                        <div className="flex items-center text-xs font-medium">
                                            {getStatusIcon(visit.status)}
                                            {getStatusText(visit.status)}
                                        </div>
                                        <span className="text-xs opacity-70">
                                            {new Date(visit.visit_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-3">
                                        {/* Nama */}
                                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                                            {visit.full_name}
                                        </h3>
                                        
                                        {/* Perusahaan */}
                                        <div className="flex items-center text-xs text-gray-500 mb-2">
                                            <Building2 className="w-3 h-3 mr-1" />
                                            {visit.company}
                                        </div>
                                        
                                        {/* Detail */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                                            <div className="flex items-center">
                                                <User className="w-3 h-3 mr-1 text-gray-400" />
                                                {visit.person_to_meet}
                                            </div>
                                            {visit.phone && (
                                                <div className="flex items-center">
                                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                    {visit.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                {visit.WorkPermit ? (
                                                    <>
                                                        <Briefcase className="w-3 h-3 mr-1 text-blue-500" />
                                                        <span className="text-blue-600">Work Permit Ada</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3 mr-1 text-red-400" />
                                                        <span className="text-red-500">Tidak Ada Work Permit</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Tombol Hapus */}
                                        <button
                                            onClick={() => handleDelete(visit.id)}
                                            disabled={deletingId === visit.id}
                                            className="w-full py-2 bg-red-50 rounded-lg text-red-600 text-sm font-medium active:bg-red-100 disabled:opacity-50 transition-colors"
                                        >
                                            {deletingId === visit.id ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent mr-2"></div>
                                                    Menghapus...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Hapus
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;