import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle, Copy, LogIn } from 'lucide-react';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(response.data.message);
      setStep(4); // Go to success step
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim password baru. Pastikan email benar.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <div className="w-full max-w-md animate-fade-in relative z-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-2xl mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <img src={logo} alt="ASP Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {step === 4 ? "Cek Email Anda" : "Reset Password"}
          </h2>
          <p className="mt-2 text-blue-100 text-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {step === 1 && "Masukkan email untuk menerima password baru Anda"}
            {step === 4 && "Password baru telah dikirim ke alamat email Anda"}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-3xl animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
          
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {step === 1 && <Mail className="h-24 w-24 text-gray-900" />}
            {step === 4 && <CheckCircle className="h-24 w-24 text-gray-900" />}
          </div>

          <div className="space-y-5 relative z-10">
            
            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 text-red-700 border border-red-200/50 rounded-xl text-sm font-medium animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 text-green-700 border border-green-200/50 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle className="h-5 w-5" />
                {success}
              </div>
            )}

            {/* STEP 1: EMAIL INPUT */}
            {step === 1 && (
              <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="appearance-none block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <div className="flex items-center gap-2">
                        Kirim Password Baru
                        <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: SHOW SUCCESS MESSAGE */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center py-2">
                   <div className="flex justify-center mb-4">
                       <div className="bg-green-100 p-3 rounded-full">
                           <CheckCircle className="h-10 w-10 text-green-600" />
                       </div>
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Password Terkirim!</h3>
                   <p className="text-gray-600 text-sm mb-4">
                     Kami telah membuatkan password acak baru dan mengirimkannya ke email <strong>{email}</strong>.
                   </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-blue-800 text-sm leading-relaxed text-center font-medium">
                    Silakan cek kotak masuk atau folder spam Anda. Gunakan password tersebut untuk login.
                  </p>
                </div>

                <Link 
                  to="/login"
                  className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                  <LogIn className="h-5 w-5 mr-2" /> Ke Halaman Login
                </Link>
              </div>
            )}
          </div>

          {step === 1 && (
            <div className="mt-8 text-center pt-6 border-t border-gray-100">
              <Link to="/login" className="text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

