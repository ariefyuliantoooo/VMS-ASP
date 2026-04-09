import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const PermitForm = () => {
    const [visits, setVisits] = useState([]);
    const [formData, setFormData] = useState({
        visitor_id: '',
        worker_name: '',
        company: '',
        job_type: '',
        work_location: '',
        start_date: '',
        end_date: '',
        pic_company: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch visits to populate select dropdown
    useEffect(() => {
         const fetchVisits = async () => {
            try {
                const res = await api.get('/visits/me');
                setVisits(res.data);
            } catch (err) {
                console.error("Failed to fetch visits for permit dropdown", err);
            }
        };
        fetchVisits();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const d = new FormData();
        Object.keys(formData).forEach(key => {
            d.append(key, formData[key]);
        });
        if (file) {
            d.append('permit_file', file);
        }

        try {
            await api.post('/permit', d, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/permits');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit work permit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Apply for Work Permit
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Contractors and vendors must link a permit to an existing visit request.
                        </p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link to Visit Request *</label>
                                <select 
                                    name="visitor_id" 
                                    required 
                                    value={formData.visitor_id} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 hover:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="" disabled>Select a visit...</option>
                                    {visits.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.full_name} - {v.person_to_meet} ({new Date(v.visit_date).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Worker Name *</label>
                                    <input type="text" name="worker_name" required value={formData.worker_name} onChange={handleChange} className="input-field mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contractor Company *</label>
                                    <input type="text" name="company" required value={formData.company} onChange={handleChange} className="input-field mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Job Type (e.g., Electrical, Network) *</label>
                                    <input type="text" name="job_type" required value={formData.job_type} onChange={handleChange} className="input-field mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Work Location Internal *</label>
                                    <input type="text" name="work_location" required value={formData.work_location} onChange={handleChange} className="input-field mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                                    <input type="date" name="start_date" required value={formData.start_date} onChange={handleChange} className="input-field mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date *</label>
                                    <input type="date" name="end_date" required value={formData.end_date} onChange={handleChange} className="input-field mt-1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">PIC Company (Internal Sponsor) *</label>
                                    <input type="text" name="pic_company" required value={formData.pic_company} onChange={handleChange} className="input-field mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Attach Document (PDF, Image)</label>
                                    <input type="file" onChange={handleFileChange} className="mt-1 block w-full outline-none py-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-5 border-t border-gray-200 mt-6 space-x-3">
                                <button type="button" onClick={() => navigate('/permits')} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? 'Submitting...' : 'Submit Permit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PermitForm;
