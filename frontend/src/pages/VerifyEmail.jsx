import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MailCheck, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Sedang memverifikasi email Anda...');
    const location = useLocation();

    useEffect(() => {
        const verifyToken = async () => {
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Token verifikasi tidak ditemukan di URL.');
                return;
            }

            try {
                const res = await api.get(`/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Email berhasil diverifikasi! Anda sekarang dapat login.');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Token verifikasi tidak valid atau sudah kadaluarsa.');
            }
        };

        verifyToken();
    }, [location.search]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 flex flex-col items-center text-center">
                    
                    {status === 'loading' && (
                        <>
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Memverifikasi</h2>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <MailCheck className="h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="h-16 w-16 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Verifikasi</h2>
                        </>
                    )}

                    <p className="text-gray-600 mb-6">{message}</p>

                    {status !== 'loading' && (
                        <Link 
                            to="/login"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Kembali ke Halaman Login
                        </Link>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
