'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts'
import { createClient } from '@/lib/supabase-client'
import { cn, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: 'Total Visitors', value: '0', icon: Users, change: '0%', isUp: true, color: 'primary' },
    { label: 'Check-in Today', value: '0', icon: UserCheck, change: '0%', isUp: true, color: 'accent' },
    { label: 'Pending Visitors', value: '0', icon: UserPlus, change: '0%', isUp: false, color: 'warning' },
    { label: 'Active Tenants', value: '0', icon: Building2, change: '0%', isUp: true, color: 'slate' },
  ])
  const [recentVisitors, setRecentVisitors] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch Total Visitors
        const { count: totalVisitors } = await supabase.from('visits').select('*', { count: 'exact', head: true })
        
        // Fetch Today's Check-ins
        const today = new Date().toISOString().split('T')[0]
        const { count: todayCheckins } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('check_in_time', today)

        // Fetch Pending
        const { count: pendingCount } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING')

        // Fetch Tenants (if superadmin)
        const { count: tenantCount } = await supabase
          .from('tenants')
          .select('*', { count: 'exact', head: true })

        // Fetch Recent Visitors
        const { data: recent } = await supabase
          .from('visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats([
          { label: 'Total Visitors', value: totalVisitors?.toString() || '0', icon: Users, change: '+0%', isUp: true, color: 'primary' },
          { label: 'Check-in Today', value: todayCheckins?.toString() || '0', icon: UserCheck, change: '+0%', isUp: true, color: 'accent' },
          { label: 'Pending Visitors', value: pendingCount?.toString() || '0', icon: UserPlus, change: '0%', isUp: false, color: 'warning' },
          { label: 'Active Tenants', value: tenantCount?.toString() || '0', icon: Building2, change: '0%', isUp: true, color: 'slate' },
        ])
        setRecentVisitors(recent || [])
        
        // Mock chart data (usually derived from a complex query or separate table)
        setChartData([
          { name: 'Mon', count: 45 },
          { name: 'Tue', count: 52 },
          { name: 'Wed', count: 38 },
          { name: 'Thu', count: 65 },
          { name: 'Fri', count: 48 },
          { name: 'Sat', count: 24 },
          { name: 'Sun', count: 15 },
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, here's what's happening at your facility today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div className={cn(
                "p-3 rounded-xl bg-slate-50 dark:bg-slate-800 transition-colors group-hover:bg-primary/10",
              )}>
                <stat.icon className="text-primary" size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Visitor Analytics</h3>
              <p className="text-sm text-slate-500">Weekly traffic overview</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Visitors</h3>
          <div className="space-y-6">
            {recentVisitors.map((v) => (
              <div key={v.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600">
                  {v.full_name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{v.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{v.visit_purpose}</p>
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {v.created_at ? new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            ))}
            {recentVisitors.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-10">No recent visitors</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border border-border text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            View All Visitors
          </button>
        </div>
      </div>
    </div>
  )
}
