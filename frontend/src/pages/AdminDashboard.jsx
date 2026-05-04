import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import VisitorCard from '../components/VisitorCard';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Users, Clock3, LogIn, LogOut, Copy, Check, Link as LinkIcon, Database, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    
    // Tab State
    const [activeTab, setActiveTab] = useState('VISITS'); // VISITS, USERS, LOGS
    
    // Data States
    const [visits, setVisits]   = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [logs, setLogs] = useState([]);
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'STAFF',
        phone: '',
        company: 'VMS Official'
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resVisits, resUsers, resLogs] = await Promise.all([
                api.get('/visits'),
                api.get('/users'),
                api.get('/auth/logs')
            ]);
            setVisits(resVisits.data);
            setUsersList(resUsers.data);
            setLogs(resLogs.data);
        } catch {
            setError('Gagal mengambil data dari server.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVisit = async (id) => {
        if (!window.confirm('Yakin ingin menghapus kunjungan ini?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/visit/${id}`);
            setVisits(prev => prev.filter(v => v.id !== id));
        } catch {
            alert('Gagal menghapus kunjungan');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Yakin ingin menghapus Visitor ini secara permanen?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsersList(prev => prev.filter(u => u.id !== id));
        } catch {
            alert('Gagal menghapus user');
        }
    };

    const handleGenerateInvite = async () => {
        try {
            const res = await api.post('/invite-staff');
            const url = `${window.location.origin}/register?token=${res.data.inviteToken}`;
            setInviteLink(url);
            setCopied(false);
        } catch {
            alert('Gagal generate invite link');
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            await api.post('/users/create', newUserForm);
            setUsersList(prev => [newUserForm, ...prev]);
            setShowCreateModal(false);
            setNewUserForm({
                username: '',
                email: '',
                password: '',
                full_name: '',
                role: 'STAFF',
                phone: '',
                company: 'VMS Official'
            });
            fetchAllData(); // Refresh to get the real ID and details
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Gagal membuat Visitor');
        } finally {
            setCreateLoading(false);
        }
    };

    if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

    const counts = {
        total:     visits.length,
        pending:   visits.filter(v => v.status === 'PENDING').length,
        checkedIn: visits.filter(v => v.status === 'CHECKED_IN').length,
        checkedOut:visits.filter(v => v.status === 'CHECKED_OUT' || v.status === 'DONE').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5 pb-24 space-y-5">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-indigo-600" />
                        <h1 className="text-xl font-black text-gray-900">Admin Control Panel</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-8">Atur Kunjungan, Akun Pengguna, dan Aktivitas Keamanan</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-sm font-semibold">
                    {[ 
                        { k: 'VISITS', l: 'Manage Visits', i: ShieldAlert }, 
                        { k: 'USERS', l: 'Manage Visitors', i: Users }, 
                        { k: 'LOGS', l: 'System Logs', i: Database } 
                    ].map(t => (
                        <button 
                            key={t.k} 
                            onClick={() => setActiveTab(t.k)}
                            className={`flex-1 flex justify-center items-center gap-2 p-3 transition-colors ${activeTab === t.k ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <t.i className="w-4 h-4" /> {t.l}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">Memuat data sistem...</p>
                    </div>
                ) : (
                    <>
                        {/* TAB: VISITS */}
                        {activeTab === 'VISITS' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <StatsCard icon={Users}  value={counts.total}     label="Total"      colorClass="bg-indigo-50" iconColorClass="text-indigo-600" borderColor="border-indigo-100" />
                                    <StatsCard icon={Clock3} value={counts.pending}   label="Terdaftar"  colorClass="bg-yellow-50" iconColorClass="text-yellow-600" borderColor="border-yellow-100" />
                                    <StatsCard icon={LogIn}  value={counts.checkedIn} label="Check In"   colorClass="bg-green-50"  iconColorClass="text-green-600"  borderColor="border-green-100" />
                                    <StatsCard icon={LogOut} value={counts.checkedOut}label="Selesai"  colorClass="bg-gray-50"   iconColorClass="text-gray-500"   borderColor="border-gray-200" />
                                </div>
                                <div className="space-y-3">
                                    {visits.length === 0 ? (
                                         <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-100">Tidak ada kunjungan tercatat.</div>
                                    ) : visits.map(visit => (
                                        <VisitorCard key={visit.id} visit={visit} onDelete={handleDeleteVisit} deletingId={deletingId} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: USERS */}
                        {activeTab === 'USERS' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-indigo-500" />
                                            <h2 className="text-sm font-bold text-gray-900">Manajemen Visitor</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowCreateModal(true)} 
                                                className="text-xs font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-black transition"
                                            >
                                                Tambah Visitor Manual
                                            </button>
                                            <button onClick={handleGenerateInvite} className="text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
                                                Generate Invite Link
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {showCreateModal && (
                                        <div className="mb-6 p-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 animate-fade-in">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-bold text-gray-800">Buat Akun Baru</h3>
                                                <button onClick={() => setShowCreateModal(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">Batal</button>
                                            </div>
                                            
                                            <form onSubmit={handleCreateUser} className="space-y-4">
                                                {createError && <p className="text-xs text-red-500 px-3 py-2 bg-red-50 rounded-lg">{createError}</p>}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input type="text" placeholder="Nama Visitor (Username)" required value={newUserForm.username} onChange={e=>setNewUserForm({...newUserForm, username: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                                    <input type="email" placeholder="Email" required value={newUserForm.email} onChange={e=>setNewUserForm({...newUserForm, email: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input type="password" placeholder="Password" required value={newUserForm.password} onChange={e=>setNewUserForm({...newUserForm, password: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                                    <input type="text" placeholder="Nama Lengkap" required value={newUserForm.full_name} onChange={e=>setNewUserForm({...newUserForm, full_name: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <select value={newUserForm.role} onChange={e=>setNewUserForm({...newUserForm, role: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                                        <option value="STAFF">STAFF</option>
                                                        <option value="SECURITY">SECURITY</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="USER">VISITOR</option>
                                                    </select>
                                                    <button type="submit" disabled={createLoading} className="bg-indigo-600 text-white font-bold rounded-xl py-3 hover:bg-indigo-700 transition-all disabled:bg-indigo-300">
                                                        {createLoading ? 'Memproses...' : 'Simpan User'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {inviteLink && (
                                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 mb-4">
                                            <input type="text" value={inviteLink} readOnly className="bg-transparent text-xs text-gray-600 flex-1 outline-none min-w-0" />
                                            <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-gray-700 transition">
                                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                     <div className="overflow-x-auto">
                                         <table className="w-full text-left text-sm whitespace-nowrap">
                                             <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                                 <tr>
                                                     <th className="px-4 py-3">Nama</th>
                                                     <th className="px-4 py-3">Email</th>
                                                     <th className="px-4 py-3">Role</th>
                                                     <th className="px-4 py-3 text-right">Aksi</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                {usersList.map(u => (
                                                    <tr key={u.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-semibold text-gray-800">{u.full_name}</td>
                                                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${u.role==='ADMIN'?'bg-red-100 text-red-700':u.role==='SECURITY'?'bg-blue-100 text-blue-700':u.role==='STAFF'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>
                                                                {u.role === 'USER' ? 'VISITOR' : u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {u.role !== 'ADMIN' && (
                                                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                             </tbody>
                                         </table>
                                     </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: LOGS */}
                        {activeTab === 'LOGS' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left text-sm whitespace-nowrap">
                                         <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                             <tr>
                                                 <th className="px-4 py-3">Time</th>
                                                 <th className="px-4 py-3">Action</th>
                                                 <th className="px-4 py-3">Email</th>
                                                 <th className="px-4 py-3">IP</th>
                                                 <th className="px-4 py-3">Status</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-gray-100">
                                            {logs.length === 0 ? <tr><td colSpan="5" className="text-center p-4 text-gray-400">Belum ada log terekam</td></tr> : logs.map(l => (
                                                <tr key={l.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                                                    <td className="px-4 py-3 font-semibold text-gray-800">{l.action}</td>
                                                    <td className="px-4 py-3 text-gray-500">{l.email}</td>
                                                    <td className="px-4 py-3 text-gray-500">{l.ip_address}</td>
                                                    <td className="px-4 py-3">
                                                       <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${l.status==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{l.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                         </tbody>
                                     </table>
                                 </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;