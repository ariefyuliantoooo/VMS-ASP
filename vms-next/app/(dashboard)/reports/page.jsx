'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Filter, Loader2, Calendar, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState({ total: 0, today: 0, weekly: 0 })
  const supabase = createClient()

  useEffect(() => {
    fetchQuickStats()
  }, [])

  async function fetchQuickStats() {
    try {
      setLoading(true)
      const { count: total } = await supabase.from('visits').select('*', { count: 'exact', head: true })
      
      const today = new Date().toISOString().split('T')[0]
      const { count: todayCount } = await supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', today)

      setStats({ total: total || 0, today: todayCount || 0, weekly: total || 0 }) // Simplified
    } catch (error) {
      console.error('Stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    setExporting(true)
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('full_name, company, phone, visit_purpose, person_to_meet, status, created_at, check_in_time, check_out_time')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        toast.error('No data to export')
        return
      }

      // Create CSV content
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(obj => 
        Object.values(obj).map(val => `"${val || ''}"`).join(',')
      ).join('\n')
      
      const csvContent = `${headers}\n${rows}`
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `vms_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Report exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Export data and analyze visitor trends.</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={exporting}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {exporting ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
          Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-8 rounded-3xl border border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Records</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black">{stats.total}</h3>
            <FileText className="text-primary/20" size={48} />
          </div>
        </div>
        <div className="bg-card p-8 rounded-3xl border border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Today's Visits</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black">{stats.today}</h3>
            <Calendar className="text-accent/20" size={48} />
          </div>
        </div>
        <div className="bg-card p-8 rounded-3xl border border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Ready for Export</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black">CSV</h3>
            <FileSpreadsheet className="text-emerald-500/20" size={48} />
          </div>
        </div>
      </div>

      <div className="bg-card p-12 rounded-[3rem] border border-border flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-border">
          <FileText className="text-slate-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold">Custom Report Filters</h2>
        <p className="text-slate-500 max-w-sm mt-2 font-medium">
          Advanced filtering by date range, purpose, and host coming in the next update. Use the quick export button for the full log.
        </p>
        <div className="mt-8 flex gap-3">
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider">
            PDF Support Pending
          </div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider">
            Excel Support Pending
          </div>
        </div>
      </div>
    </div>
  )
}
