import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';

const SuperadminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', domain: '' });

    useEffect(() => {
        if (user?.role === 'SUPERADMIN') {
            fetchTenants();
        }
    }, [user]);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tenants');
            setTenants(res.data);
        } catch (err) {
            setError('Gagal memuat daftar tenant.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenants', formData);
            setShowModal(false);
            setFormData({ name: '', domain: '' });
            fetchTenants();
        } catch (err) {
            alert('Gagal membuat tenant baru');
        }
    };

    if (user?.role !== 'SUPERADMIN') return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-24 space-y-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                        <h1 className="text-xl font-black text-gray-900">Superadmin Control Panel</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-8">Kelola Tenant dan Perusahaan</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-gray-900">Daftar Tenant</h2>
                        <button 
                            onClick={() => setShowModal(true)} 
                            className="text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Tambah Tenant
                        </button>
                    </div>

                    {showModal && (
                        <div className="mb-6 p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 animate-fade-in">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Nama Tenant" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <input type="text" placeholder="Domain (Opsional)" value={formData.domain} onChange={e=>setFormData({...formData, domain: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-500 font-bold">Batal</button>
                                    <button type="submit" className="bg-indigo-600 text-white font-bold rounded-xl px-6 py-2 hover:bg-indigo-700 transition-all">Simpan</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-10"><div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Nama Tenant</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tenants.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold text-gray-800">#{t.id}</td>
                                            <td className="px-4 py-3 font-semibold text-indigo-600">{t.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {t.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SuperadminDashboard;
