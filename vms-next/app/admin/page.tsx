'use client'

import React, { useState } from 'react'
import { ShieldAlert, Users, Copy, Check, Info } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('USERS')
  
  // Link Generation State
  const [copiedLink, setCopiedLink] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  
  const handleGenerateInvite = (role: 'staff' | 'security') => {
      // Dalam skenario Enterprise dengan Supabase:
      // Token ini idealnya dicetak di Edge Function (JWT Asimetris) dan divalidasi server.
      // Namun untuk demontrasi ini, kita mengirim URL dengan parameter khusus. 
      // (Pada Server Action, URL param ini harus diikat ke database undangan agar tidak disalahgunakan).
      
      const secureToken = btoa(`ROLE=${role}&EXPIRES=${Date.now() + 86400000}`) // Fake Base64 JWT
      const link = `${window.location.origin}/register?token=${secureToken}&type=${role}`
      setGeneratedLink(link)
      setCopiedLink('')
  }
  
  const handleCopy = () => {
      navigator.clipboard.writeText(generatedLink)
      setCopiedLink(generatedLink)
      setTimeout(() => setCopiedLink(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-20 px-4">
      <main className="max-w-4xl mx-auto w-full space-y-5">
        
        <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <ShieldAlert className="text-indigo-600 h-7 w-7" /> Admin Control
            </h1>
            <p className="text-gray-500 text-sm ml-9">Kelola Akses dan Undangan</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-sm font-semibold">
             <button onClick={() => setActiveTab('USERS')} className={`flex-1 flex justify-center items-center gap-2 p-3 transition-colors ${activeTab === 'USERS' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Users className="w-4 h-4" /> Manajemen Pengguna
             </button>
             <button onClick={() => setActiveTab('LOGS')} className={`flex-1 flex justify-center items-center gap-2 p-3 transition-colors ${activeTab !== 'USERS' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Info className="w-4 h-4" /> Log Sistem
             </button>
        </div>

        {activeTab === 'USERS' && (
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in space-y-6">
                <div>
                   <h2 className="text-lg font-bold text-gray-900 mb-1">Undang Staff Internal & Keamanan</h2>
                   <p className="text-xs text-gray-500 mb-4">Buat tautan aman (kedaluwarsa dalam 24 jam) yang dapat diklik oleh karyawan atau satpam untuk mendaftarkan akun rahasia mereka tanpa verifikasi manual.</p>
                   
                   <div className="flex gap-3">
                       <button onClick={() => handleGenerateInvite('staff')} className="bg-indigo-100 text-indigo-700 font-bold py-2.5 px-4 rounded-xl text-sm flex gap-2 items-center hover:bg-indigo-200 transition">
                           <Users className="w-4 h-4" /> Generate Link Staff
                       </button>
                       <button onClick={() => handleGenerateInvite('security')} className="bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-xl text-sm flex gap-2 items-center hover:bg-red-200 transition">
                           <ShieldAlert className="w-4 h-4" /> Generate Link Satpam
                       </button>
                   </div>
                </div>

                {generatedLink && (
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-4 animate-fade-in">
                        <input type="text" value={generatedLink} readOnly className="bg-transparent text-xs text-gray-600 flex-1 outline-none min-w-0 font-mono" />
                        <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-gray-700 transition">
                            {copiedLink ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </button>
                    </div>
                )}
                
                <div className="pt-6 border-t border-gray-100">
                    <p className="text-center text-gray-400 text-xs">(Ini adalah antarmuka demonstrasi untuk integrasi Admin Next.js)</p>
                </div>
             </div>
        )}

      </main>
    </div>
  )
}
