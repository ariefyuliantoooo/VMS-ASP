import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { FileText, Download, Briefcase } from 'lucide-react';

const PermitList = () => {
    const [permits, setPermits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermits = async () => {
            try {
                const res = await api.get('/permit');
                setPermits(res.data);
            } catch (err) {
                console.error("Failed to fetch permits", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPermits();
    }, []);

    const getDownloadUrl = (path) => {
        const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5006';
        return `${baseUrl}${path}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Work Permits</h1>
                        <Link to="/permit/new" className="btn-primary flex items-center">
                            <Briefcase className="w-5 h-5 mr-2" />
                            Apply for Permit
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : permits.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow rounded-lg text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No work permits found</h3>
                            <p className="mt-1 text-sm text-gray-500">Create a work permit for an upcoming visit.</p>
                            <div className="mt-6">
                                <Link to="/permit/new" className="btn-primary">
                                    Apply for Permit
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {permits.map((permit) => (
                                    <li key={permit.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <Briefcase className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <h4 className="text-lg font-bold text-gray-900">{permit.job_type}</h4>
                                                    <p className="text-sm font-medium text-blue-600">
                                                        {permit.worker_name} ({permit.company})
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {permit.start_date} to {permit.end_date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between border-t border-gray-100 pt-2 content-center items-center">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    Location: {permit.work_location}
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    Internal PIC: {permit.pic_company}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                {permit.permit_file ? (
                                                    <a href={getDownloadUrl(permit.permit_file)} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded">
                                                        <Download className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                        View Attached Document
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">No document attached</span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PermitList;
