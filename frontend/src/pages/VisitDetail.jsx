import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Download, ArrowLeft } from 'lucide-react';

const VisitDetail = () => {
    const { id } = useParams();
    const [visitData, setVisitData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVisit = async () => {
            try {
                const res = await api.get(`/visit/${id}`);
                setVisitData(res.data);
            } catch (err) {
                setError('Failed to fetch visit details');
            } finally {
                setLoading(false);
            }
        };
        fetchVisit();
    }, [id]);

    const handleDownloadLabel = () => {
         const link = document.createElement('a');
         link.href = visitData.qrCodeImage;
         link.download = `VMS-Pass-${id}.png`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!visitData) return null;

    const { visit, qrCodeImage } = visitData;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-bold text-gray-900">
                                Visitor Pass
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Present this QR code to security upon arrival.
                            </p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${visit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : visit.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {visit.status.replace('_', ' ')}
                        </span>
                    </div>
                    
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0 flex flex-col md:flex-row">
                        <div className="md:w-1/2 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
                            <img src={qrCodeImage} alt="Visitor QR Code" className="w-64 h-64 bg-white p-2 rounded-lg shadow-sm border border-gray-200" />
                            <button onClick={handleDownloadLabel} className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                                <Download className="w-4 h-4 mr-1" />
                                Download Pass
                            </button>
                        </div>
                        
                        <div className="md:w-1/2">
                            <dl className="sm:divide-y sm:divide-gray-200 h-full">
                                <div className="py-4 pl-6 pr-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Visitor Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 font-semibold">{visit.full_name}</dd>
                                </div>
                                <div className="py-4 pl-6 pr-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{visit.company}</dd>
                                </div>
                                <div className="py-4 pl-6 pr-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Meeting With</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{visit.person_to_meet}</dd>
                                </div>
                                <div className="py-4 pl-6 pr-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{new Date(visit.visit_date).toLocaleDateString()}</dd>
                                </div>
                                <div className="py-4 pl-6 pr-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{visit.visit_purpose}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VisitDetail;
