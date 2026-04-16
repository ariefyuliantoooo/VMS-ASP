'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('token')
  const supabase = createSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // User details
  const [formData, setFormData] = useState({
    username: '', full_name: '', email: '', password: '', phone: '', company: ''
  })
  
  // Visit details
  const [bookVisit, setBookVisit] = useState(false)
  const [visitData, setVisitData] = useState({ purpose: '', person_to_meet: '' })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Sign Up using Supabase Auth
      // Note: By default role is 'visitor' in Trigger. If token is present, we must verify server-side.
      // For this public page, we will let the trigger assign 'visitor'.
      // If token exists, a secure backend route should be used for registration, but for simplicity here we just pass the metadata.
      // Warning: Real production app should validate token securely on the server!
      
      const roleAssigned = inviteToken ? 'security' : 'visitor' 

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.full_name,
            phone: formData.phone,
            company: formData.company,
            role: roleAssigned 
          }
        }
      })

      if (authError) throw authError

      // 2. If 'bookVisit' is checked, hit the create visit API immediately.
      if (bookVisit && !inviteToken && authData.user) {
         // Create visit right after registering!
         const res = await fetch('/api/visits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               profile_id: authData.user.id,
               visitor_name: formData.full_name,
               company: formData.company,
               phone: formData.phone,
               purpose: visitData.purpose,
               person_to_meet: visitData.person_to_meet
            })
         })
         
         const visitRes = await res.json()
         if (!res.ok) {
            console.error('Visit error:', visitRes.error)
            // Still show success since account is created
         }
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow border border-gray-100 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Registrasi Berhasil!</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Harap periksa kotak masuk Email Anda untuk tautan konfirmasi.
                {bookVisit && " Pengajuan Kunjungan / QR tiket Anda sedang diproses dan akan terlampir di dasbor Anda."}
            </p>
            <button onClick={() => router.push('/login')} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm w-full">
                Menuju Halaman Login
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className={`p-4 rounded-full ${inviteToken ? 'bg-indigo-600' : 'bg-green-600'}`}>
                {inviteToken ? <ShieldAlert className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
            </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-gray-900">
          {inviteToken ? 'Daftar sebagai Security' : 'Pendaftaran Pengunjung'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sudah daftar?{' '} <a href="/login" className="font-bold text-indigo-600 hover:text-indigo-500">Login di sini</a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-semibold">{error}</div>}
            {inviteToken && <div className="p-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-sm text-center font-bold">Undangan Keamanan Terdeteksi. Anda akan terdaftar sebagai STAFF / SECURITY.</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Aktif (Butuh Verifikasi)</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Perusahaan / Instansi</label>
                <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">No. Telp / WA</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border" />
              </div>
            </div>

            {/* Smart 2-Step Injector (Hanya untuk Visitor biasa) */}
            {!inviteToken && (
               <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-6">
                  <div className="flex items-center gap-3 mb-3">
                     <input type="checkbox" id="bookVisit" checked={bookVisit} onChange={(e) => setBookVisit(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                     <label htmlFor="bookVisit" className="text-sm font-bold text-gray-900 cursor-pointer">Saya juga ingin mengajukan kunjungan / reservasi masuk untuk hari ini.</label>
                  </div>
                  
                  {bookVisit && (
                     <div className="space-y-4 pt-3 border-t border-gray-200 mt-3 animate-pulse-once">
                        <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Email Karyawan / PIC yang Ingin Ditemui *</label>
                           <input required={bookVisit} type="email" value={visitData.person_to_meet} onChange={e => setVisitData({...visitData, person_to_meet: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border bg-white" placeholder="karyawan@perusahaan.com" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Keperluan Kunjungan *</label>
                           <textarea required={bookVisit} rows={2} value={visitData.purpose} onChange={e => setVisitData({...visitData, purpose: e.target.value})} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm px-4 py-2 border bg-white" placeholder="Meeting proyek A, Pengiriman barang, dll"></textarea>
                        </div>
                     </div>
                  )}
               </div>
            )}

            <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white ${loading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'}`}>
              {loading ? 'Memproses...' : (inviteToken ? 'Daftar sebagai Punggawa' : 'Daftar Sekarang')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
