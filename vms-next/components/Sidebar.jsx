'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  BarChart3, 
  Settings, 
  Building2, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from './providers/auth-provider'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Visitors', href: '/visitors' },
  { icon: QrCode, label: 'Check In/Out', href: '/checkin' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Building2, label: 'Tenants', href: '/tenants', superOnly: true },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, signOut } = useAuth()
  
  const role = user?.app_metadata?.role || 'security'

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className={cn(
      "h-screen bg-sidebar text-white transition-all duration-300 flex flex-col sticky top-0",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">VMS SaaS</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {menuItems.map((item) => {
          if (item.superOnly && role !== 'superadmin') return null
          
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/30" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-400 hover:bg-danger/10 hover:text-danger transition-all duration-200"
        >
          <LogOut size={22} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}
