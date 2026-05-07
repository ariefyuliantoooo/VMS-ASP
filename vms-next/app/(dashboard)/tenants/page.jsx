'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, MoreVertical, Shield, ExternalLink, Activity, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import AddTenantModal from '@/components/AddTenantModal'
import { toast } from 'react-hot-toast'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTenants()
  }, [])

  async function fetchTenants() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTenants(data || [])
    } catch (error) {
      console.error('Error fetching tenants:', error)
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (newTenant) => {
    setTenants([newTenant, ...tenants])
    toast.success('Tenant created successfully')
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Shield className="text-primary" size={32} />
            Tenant Management
          </h1>
          <p className="text-slate-500 mt-1">Superadmin console for managing platform tenants.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Create New Tenant
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-[2rem] border-2 border-dashed border-border">
          <Building2 className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-slate-600">No tenants found</h3>
          <p className="text-slate-400">Start by creating your first tenant organization.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Building2 size={32} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                    tenant.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {tenant.is_active ? 'active' : 'inactive'}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{tenant.name}</h3>
                  <p className="text-sm text-slate-400 font-mono">{tenant.domain || 'no-domain'}</p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Created At</p>
                    <p className="font-bold mt-1 text-slate-700 dark:text-slate-300">{new Date(tenant.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Status</p>
                    <p className="font-bold mt-1 text-slate-700 dark:text-slate-300">{tenant.is_active ? 'Live' : 'Off'}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Activity size={14} className="text-emerald-500" />
                  Management Active
                </div>
                <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTenantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
      />
    </div>
  )
}
