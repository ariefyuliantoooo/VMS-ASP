import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff, MailCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    company: '',
    phone: '',
    role: 'USER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inviteToken = queryParams.get('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ ...formData, inviteToken });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  if (success) {
      return (
         <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow text-center">
                <div className="text-green-500 mb-4 flex justify-center"><MailCheck className="h-16 w-16" /></div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h2>
                <p className="text-gray-600 mb-6">Akun Visitor Anda telah diaktifkan. Silakan periksa kotak masuk email Anda untuk mendapatkan <strong>Kata Sandi Acak</strong> dan silakan Login.</p>
                <Link to="/login" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg">Login Sekarang</Link>
            </div>
         </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="bg-green-600 p-3 rounded-full">
                <UserPlus className="h-8 w-8 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a Visitor account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
                    {error}
                </div>
            )}
            
            {inviteToken && (
                <div className="p-3 bg-blue-100 text-blue-800 border border-blue-200 rounded text-sm text-center font-medium">
                    Staff Invitation Token Detected. You will be registered as Staff.
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                <label className="block text-sm font-medium text-gray-700">Nama Visitor (Username) *</label>
                <input name="username" type="text" required value={formData.username} onChange={handleChange} className="input-field mt-1" placeholder="cth: john_doe" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input name="full_name" type="text" required value={formData.full_name} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address *</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="input-field mt-1" />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input name="company" type="text" value={formData.company} onChange={handleChange} className="input-field mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="input-field mt-1" />
                </div>
            </div>


            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
