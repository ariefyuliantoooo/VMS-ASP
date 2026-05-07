'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Search, MoreHorizontal, Eye, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'

export default function VisitorsTable() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchVisits()
  }, [])

  async function fetchVisits() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVisits(data || [])
    } catch (error) {
      console.error('Error fetching visits:', error)
      toast.error('Failed to fetch visitor data.')
    } finally {
      setLoading(false)
    }
  }

  const filteredVisits = visits.filter(v => 
    v.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    v.company?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CHECKED_IN': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'DONE': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Table Header / Actions */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchVisits} className="p-2.5 bg-white dark:bg-slate-800 border border-border rounded-xl hover:bg-slate-50 transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
            + New Visit
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-medium">Loading visitors...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <p className="font-bold text-slate-600">No visitor records found</p>
            <p className="text-sm">Start by creating a new visit request.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Visitor</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        {v.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{v.full_name}</p>
                        <p className="text-xs text-slate-500">{v.company || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{v.visit_purpose || '-'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium">
                      {v.check_in_time ? new Date(v.check_in_time).toLocaleString() : 'Not checked in'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold border",
                      getStatusColor(v.status)
                    )}>
                      {v.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
