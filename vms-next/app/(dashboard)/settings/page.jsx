'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Building, Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '')
      setPhone(user.user_metadata?.phone || '')
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone: phone }
      })

      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile', desc: 'Personal information' },
    { id: 'organization', icon: Building, label: 'Organization', desc: 'Tenant details' },
    { id: 'security', icon: Shield, label: 'Security', desc: 'Password & access' },
  ]

  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-card border border-border text-slate-500 hover:border-primary/50 dark:hover:border-primary/30"
              )}
            >
              <tab.icon size={20} />
              <div className="min-w-0">
                <p className="font-bold text-sm leading-none">{tab.label}</p>
                {activeTab !== tab.id && <p className="text-[10px] opacity-70 mt-1 truncate">{tab.desc}</p>}
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card rounded-[2rem] border border-border p-8 md:p-12 shadow-sm">
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 border-none rounded-2xl outline-none cursor-not-allowed font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                    placeholder="+62 812..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Role</label>
                  <div className="px-5 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-bold capitalize">
                    {user?.app_metadata?.role || 'User'}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'organization' && (
            <div className="text-center py-12">
              <Building className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={64} />
              <h2 className="text-xl font-bold">Organization Settings</h2>
              <p className="text-slate-500 mt-2">Manage tenant details, logo, and branding. Only accessible to Admin/Superadmin.</p>
              <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border inline-block text-left">
                <p className="text-sm font-bold">Current Tenant:</p>
                <p className="text-lg text-primary font-black mt-1">{user?.app_metadata?.tenant_name || 'Personal'}</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold">Security Settings</h2>
              <div className="p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-700 dark:text-rose-400">
                <p className="font-bold">Change Password</p>
                <p className="text-sm mt-1">To change your password, please use the "Forgot Password" flow on the login page or check your email for a reset link.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
