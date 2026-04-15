import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const VisitForm = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        company: '',
        phone: '',
        visit_purpose: '',
        person_to_meet: '',
        visit_date: ''
    });
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingStaff, setFetchingStaff] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await api.get('/users/staff');
                setStaffList(res.data);
                
                // Set the default person_to_meet to the first staff member if available
                if (res.data && res.data.length > 0) {
                    setFormData(prev => ({ ...prev, person_to_meet: res.data[0].full_name }));
                }
            } catch (err) {
                console.error("Failed to fetch staff list", err);
                setError("Failed to load staff. Please try again later.");
            } finally {
                setFetchingStaff(false);
            }
        };
        fetchStaff();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/visit', formData);
            navigate(`/visit/${res.data.visit.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit visit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Register New Visit
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Please provide details about your upcoming visit.
                            </p>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="input-field mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company</label>
                                        <input type="text" name="company" required value={formData.company} onChange={handleChange} className="input-field mt-1" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="input-field mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Visit</label>
                                        <input type="date" name="visit_date" required value={formData.visit_date} onChange={handleChange} className="input-field mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Person to Meet</label>
                                    <select 
                                        name="person_to_meet" 
                                        required 
                                        value={formData.person_to_meet} 
                                        onChange={handleChange} 
                                        className="input-field mt-1"
                                        disabled={fetchingStaff}
                                    >
                                        <option value="" disabled>{fetchingStaff ? 'Loading staff...' : 'Select a person to meet...'}</option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.full_name}>{s.full_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Purpose of Visit</label>
                                    <textarea name="visit_purpose" rows={3} required value={formData.visit_purpose} onChange={handleChange} className="input-field mt-1" />
                                </div>

                                <div className="flex justify-end pt-5 border-t border-gray-200 gap-3">
                                    <button type="button" onClick={() => navigate('/')} className="btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="btn-primary flex justify-center items-center">
                                        {loading ? <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span> : null}
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VisitForm;
