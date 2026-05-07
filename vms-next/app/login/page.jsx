'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: Login Form */}
      <div className="flex flex-col justify-center px-8 md:px-24 xl:px-48 bg-white dark:bg-slate-950">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
            <Building2 size={28} />
          </div>
          <span className="text-2xl font-black tracking-tight">VMS SaaS</span>
        </div>

        <div className="space-y-2 mb-10">
          <h1 className="text-4xl font-black tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Log in to manage your facility visitors.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm text-slate-500 font-medium">Remember me</span>
            </label>
            <a href="#" className="text-sm font-bold text-primary hover:underline">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Sign In
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-12 text-center text-slate-400 text-sm">
          Don't have an account? <Link href="/register" className="font-bold text-slate-900 hover:underline">Register your facility</Link>
        </p>
      </div>

      {/* Right: Visual Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        <div className="relative z-10 max-w-lg text-center px-12">
          <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            Production Ready SaaS
          </div>
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6">
            The Next Generation of <span className="text-accent">Visitor Management</span>
          </h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Secure, scalable, and beautifully designed for modern enterprises. Manage multiple locations with a single source of truth.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-8 text-white/90">
            <div>
              <p className="text-3xl font-black">99.9%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-black">256-bit</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Encryption</p>
            </div>
            <div>
              <p className="text-3xl font-black">ISO</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-1">Certified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
