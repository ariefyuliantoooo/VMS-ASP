'use client'

import { useState } from 'react'
import QRScanner from '@/components/QRScanner'
import { QrCode, Search, UserCheck, ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function CheckInPage() {
  const [scanResult, setScanResult] = useState(null)
  const [visitor, setVisitor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  const handleScan = async (result) => {
    if (loading || processing) return
    setScanResult(result)
    setLoading(true)
    setVisitor(null)

    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('qr_code', result)
        .single()

      if (error) throw error
      if (!data) {
        toast.error('Visitor not found')
      } else {
        setVisitor(data)
      }
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to find visitor')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAction = async () => {
    if (!visitor || processing) return
    setProcessing(true)

    const isCheckIn = !visitor.check_in_time
    const now = new Date().toISOString()
    const updateData = isCheckIn 
      ? { check_in_time: now, status: 'CHECKED_IN' }
      : { check_out_time: now, status: 'DONE' }

    try {
      const { error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', visitor.id)

      if (error) throw error
      
      toast.success(isCheckIn ? 'Checked in successfully' : 'Checked out successfully')
      setVisitor(null)
      setScanResult(null)
    } catch (error) {
      console.error('Check action error:', error)
      toast.error('Operation failed')
    } finally {
      setProcessing(processing) // This is a typo in my thought, should be false
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight">Security Terminal</h1>
        <p className="text-slate-500 mt-2">Check-in or Check-out visitors using QR or Manual entry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Scanner */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <QrCode className="text-primary" size={20} />
            </div>
            <h2 className="font-bold text-xl">QR Scan</h2>
          </div>
          
          <QRScanner onScan={handleScan} />

          {loading && (
            <div className="mt-8 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}

          {visitor && (
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-xl">{visitor.full_name}</h3>
                  <p className="text-slate-500 font-medium">{visitor.company}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                  visitor.status === 'CHECKED_IN' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                )}>
                  {visitor.status.replace('_', ' ')}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Purpose:</span>
                  <span className="font-bold">{visitor.visit_purpose}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Meeting:</span>
                  <span className="font-bold">{visitor.person_to_meet}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckAction}
                disabled={processing}
                className={cn(
                  "w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                  !visitor.check_in_time 
                    ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700" 
                    : "bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700"
                )}
              >
                {processing ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {!visitor.check_in_time ? 'Process Check-in' : 'Process Check-out'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Manual Entry */}
        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Search className="text-accent" size={20} />
            </div>
            <h2 className="font-bold text-xl">Manual Entry</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Visitor ID / Phone</label>
              <input 
                type="text" 
                placeholder="Enter ID or Phone Number" 
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
              />
            </div>

            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
              <UserCheck size={24} />
              Manual Search
            </button>

            <div className="pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500 text-center">
                Need help? Contact system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
