'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Lock, Loader2, ArrowRight, User, Phone, Briefcase, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { toast, Toaster } from 'react-hot-toast'

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Personal, 2: Company/Tenant
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState([])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    companyName: '',
    role: 'STAFF',
    tenantId: '',
    isNewTenant: false,
    newTenantName: ''
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants')
      const data = await res.json()
      if (Array.isArray(data)) {
        setTenants(data)
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          }
        }
      })

      if (authError) throw authError

      // 2. Handle Tenant Assignment (Simulated for now, would typically be a backend call)
      // In a real app, you'd call an API to create the profile and link to tenant
      const registrationPayload = {
        userId: authData.user.id,
        ...formData
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to complete registration')
      }

      toast.success('Registration successful! Please check your email.')
      setTimeout(() => router.push('/login'), 2000)
    } catch (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <Toaster position="top-right" />
      
      {/* Left: Registration Form */}
      <div className="flex flex-col justify-center px-8 md:px-24 xl:px-48 bg-white dark:bg-slate-950 py-12">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Building2 size={24} />
            </div>
            <span className="text-xl font-black tracking-tight">VMS SaaS</span>
          </Link>
        </div>

        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium text-sm">Join the next generation of visitor management.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe" 
                      required
                      className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@company.com" 
                      required
                      className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+62..." 
                      className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••" 
                      required
                      className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-lg"
              >
                Next Step
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      type="checkbox" 
                      id="isNewTenant" 
                      name="isNewTenant"
                      checked={formData.isNewTenant}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                    />
                    <label htmlFor="isNewTenant" className="text-sm font-bold text-slate-700">Register a new company</label>
                  </div>
                  <p className="text-xs text-slate-500 pl-7">Check this if you want to create a new workspace for your facility.</p>
                </div>

                {formData.isNewTenant ? (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        name="newTenantName"
                        value={formData.newTenantName}
                        onChange={handleInputChange}
                        placeholder="Acme Corp" 
                        required={formData.isNewTenant}
                        className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Select Facility/Tenant</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select 
                        name="tenantId"
                        value={formData.tenantId}
                        onChange={handleInputChange}
                        required={!formData.isNewTenant}
                        className="w-full pl-11 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium appearance-none"
                      >
                        <option value="">Select a tenant...</option>
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block pl-1">Your Title / Role</label>
                  <input 
                    type="text" 
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Operations Manager" 
                    className="w-full px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Complete Setup'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Already have an account? <Link href="/login" className="font-bold text-slate-900 hover:underline">Sign in</Link>
        </p>
      </div>

      {/* Right: Visual Section */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        <div className="relative z-10 max-w-lg text-center px-12">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest">
            Step {step} of 2
          </div>
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6">
            Everything you need to <span className="text-accent">Scale Securely</span>
          </h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Register your facility today and get access to the most advanced visitor management tools in the market.
          </p>
          
          <div className="mt-12 space-y-6 text-left max-w-sm mx-auto">
            {[
              "Instant QR Code Issuance",
              "Real-time Dashboard & Analytics",
              "Multi-Location Management",
              "Secure Data Encryption"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 font-bold">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-primary">
                  <ArrowRight size={12} strokeWidth={4} />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
