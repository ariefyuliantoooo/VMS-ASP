import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User as UserIcon, CheckCircle, Clock3 } from 'lucide-react';

const Dashboard = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const res = await api.get('/visits/me');
                setVisits(res.data);
            } catch (err) {
                console.error("Failed to fetch visits", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVisits();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock3 className="w-3 h-3 mr-1"/> Pending</span>;
            case 'CHECKED_IN':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Checked In</span>;
            case 'CHECKED_OUT':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Checked Out</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {user?.role === 'STAFF' ? 'Visitors Meeting Me' : 'My Visits'}
                        </h1>
                        {user?.role !== 'STAFF' && (
                            <Link to="/visit/new" className="btn-primary">
                                Register New Visit
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                    ) : visits.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow rounded-lg text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No visits</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {user?.role === 'STAFF' 
                                    ? 'No visitors have scheduled a meeting with you yet.' 
                                    : 'Get started by creating a new visit request.'}
                            </p>
                            {user?.role !== 'STAFF' && (
                                <div className="mt-6">
                                    <Link to="/visit/new" className="btn-primary">
                                        Register New Visit
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {visits.map((visit) => (
                                    <li key={visit.id}>
                                        <Link to={`/visit/${visit.id}`} className="block hover:bg-gray-50">
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-blue-600 truncate">
                                                        Meeting with {visit.person_to_meet}
                                                    </p>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        {getStatusBadge(visit.status)}
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex flex-col gap-1">
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                            {visit.full_name} ({visit.company})
                                                        </p>
                                                        <p className="flex items-center text-sm text-gray-500">
                                                           Purpose: {visit.visit_purpose}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        <p>
                                                            {new Date(visit.visit_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
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

export default Dashboard;
