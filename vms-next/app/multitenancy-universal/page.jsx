'use client';
import { useState, useEffect } from 'react';
import TenantSwitcher from '@/components/TenantSwitcher';
import StatsCards from '@/components/StatsCards';
import VisitorsTable from '@/components/VisitorsTable';
import ChartVisitors from '@/components/ChartVisitors';
import AddTenantModal from '@/components/AddTenantModal';
import { Home, Users, BarChart2, Settings, Smartphone, Building, UserCheck } from 'lucide-react';

export default function UniversalDashboard() {
  // State untuk mengontrol "Mock Login" agar Anda bisa mengetes Multi-Tenant
  const [user, setUser] = useState({
    name: 'Super Admin',
    role: 'superadmin',
    tenant_id: 1
  });

  const [activeTenant, setActiveTenant] = useState('ALL');
  const [dashboardData, setDashboardData] = useState({ stats: null, visitors: [], tenants: [] });
  const [loading, setLoading] = useState(true);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);

  // Jika user berubah, reset activeTenant ke default-nya
  useEffect(() => {
    setActiveTenant(user.role === 'superadmin' ? 'ALL' : user.tenant_id);
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTenant, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Kirim role dan tenant_id user ke API untuk mensimulasikan login
      const res = await fetch(`/api/dashboard?tenantId=${activeTenant}&role=${user.role}&userTenantId=${user.tenant_id}`);
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tight">VMS<span className="text-gray-900">.Next</span></h1>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Main Menu</p>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold">
            <Home size={18} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition">
            <Users size={18} /> Visitors
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition">
            <BarChart2 size={18} /> Reports
          </a>

          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Management</p>
          {user.role === 'superadmin' && (
            <a href="/tenants" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition">
              <Building size={18} /> Manage Tenant
            </a>
          )}
          <a href="/visitors" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition">
            <UserCheck size={18} /> Manage Visitor
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition">
            <Smartphone size={18} /> Devices
          </a>
          
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Preferences</p>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition">
            <Settings size={18} /> Settings
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* NAVBAR */}
        <header className="bg-white border-b border-gray-200 p-4 px-8 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <TenantSwitcher 
              role={user.role} 
              tenants={dashboardData.tenants} 
              activeTenant={activeTenant} 
              onSwitch={setActiveTenant} 
            />
            {/* PANEL SIMULASI LOGIN (UNTUK TESTING) */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase ml-2">Test As:</span>
              <button 
                onClick={() => setUser({ name: 'Super Admin', role: 'superadmin', tenant_id: 1 })}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition ${user.role === 'superadmin' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Superadmin
              </button>
              <button 
                onClick={() => setUser({ name: 'Admin Utama', role: 'admin', tenant_id: 1 })}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition ${user.role === 'admin' && user.tenant_id === 1 ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Admin (Tenant 1)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {user.role === 'superadmin' && (
              <button 
                onClick={() => setIsTenantModalOpen(true)}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition"
              >
                + Add Tenant
              </button>
            )}
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition">
              + New Visitor
            </button>
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Welcome back, {user.name} 👋</h2>
              <p className="text-gray-500 mt-1">Here is what's happening today across your facilities.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-indigo-500 font-bold animate-pulse">Loading SaaS Dashboard...</div>
          ) : (
            <>
              <StatsCards stats={dashboardData.stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <ChartVisitors visitors={dashboardData.visitors} />
                </div>
                <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-black text-xl mb-2">Quick Scanner</h3>
                    <p className="text-indigo-200 text-sm mb-6">Scan visitor QR codes securely and instantly update their status.</p>
                    <button className="bg-white text-indigo-600 w-full py-3 rounded-lg font-bold shadow hover:bg-gray-50 transition">
                      Open Scanner Camera
                    </button>
                  </div>
                  {/* Decorative background shape */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
                </div>
              </div>

              <VisitorsTable visitors={dashboardData.visitors} />
            </>
          )}
        </div>
      </main>

      {/* MODALS */}
      <AddTenantModal 
        isOpen={isTenantModalOpen} 
        onClose={() => setIsTenantModalOpen(false)} 
        onSuccess={(newTenant) => {
          // Refresh data after adding a new tenant
          fetchDashboardData();
          // Switch to the newly created tenant
          setActiveTenant(newTenant.id);
        }}
      />
    </div>
  );
}
