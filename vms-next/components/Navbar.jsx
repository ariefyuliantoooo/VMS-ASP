'use client'

import { Search, Bell, Building } from 'lucide-react'
import { useAuth } from './providers/auth-provider'

export default function Navbar() {
  const { user } = useAuth()
  
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const role = user?.app_metadata?.role || 'User'
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

  return (
    <header className="h-20 glass sticky top-0 z-10 border-b border-border flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="relative hidden md:block w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search visitors, records..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Tenant Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border">
          <Building size={16} className="text-primary" />
          <span className="text-xs font-semibold">
            {user?.app_metadata?.tenant_name || 'Personal Account'}
          </span>
        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{fullName}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-md">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
