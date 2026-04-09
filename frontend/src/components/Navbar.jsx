import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', roles: ['USER'] },
    { name: 'New Visit', path: '/visit/new', roles: ['USER'] },
    { name: 'Work Permits', path: '/permits', roles: ['USER'] },
    { name: 'Security Panel', path: '/security', roles: ['SECURITY', 'ADMIN'] },
    { name: 'Admin Dashboard', path: '/admin', roles: ['ADMIN'] },
  ];

  const filteredLinks = navLinks.filter(link => 
    user && link.roles.includes(user.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <img src={logo} alt="ASP Logo" className="h-9 w-auto object-contain" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-base font-black text-gray-900 tracking-tight">Visitor Management</span>
                <span className="text-[10px] font-bold text-green-600 tracking-wider uppercase">PT Asia Surya Persada</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive(link.path) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center ml-4 pl-4 border-l border-gray-100 space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900">{user.full_name}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900">Login</Link>
                <Link to="/register" className="btn-primary text-xs py-2">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`sm:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex-grow">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-black text-gray-900">Menu</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {user ? (
                <>
                  <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 mt-4">Navigasi</p>
                  {filteredLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        isActive(link.path) 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className={`h-4 w-4 ${isActive(link.path) ? 'text-blue-200' : 'text-gray-300'}`} />
                    </Link>
                  ))}
                </>
              ) : (
                <div className="space-y-3 pt-4">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-all">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Register Akun Baru</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Logout (Sticky at bottom) */}
          {user && (
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all active:scale-[0.98]"
              >
                <LogOut className="h-5 w-5" />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
