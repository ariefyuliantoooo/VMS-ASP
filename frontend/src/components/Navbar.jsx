import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu, X, ChevronRight, LayoutDashboard, PlusCircle, FileText, Shield, Settings } from 'lucide-react';
import logo from '../assets/logo.png';
import ProfileCard from './ProfileCard';

const NAV_ICON = {
  '/':         LayoutDashboard,
  '/visit/new': PlusCircle,
  '/permits':  FileText,
  '/security': Shield,
  '/admin':    Settings,
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard',       path: '/',           roles: ['USER'] },
    { name: 'Kunjungan Baru',  path: '/visit/new',  roles: ['USER'] },
    { name: 'Work Permits',    path: '/permits',    roles: ['USER'] },
    { name: 'Security Panel',  path: '/security',   roles: ['SECURITY', 'ADMIN'] },
    { name: 'Admin Dashboard', path: '/admin',      roles: ['ADMIN'] },
  ];

  const links = navLinks.filter(l => user && l.roles.includes(user.role));
  const active = (p) => location.pathname === p;

  return (
    <>
      {/* ═══ Top Bar ═══ */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="ASP" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-black text-gray-900">Visitor Management</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">PT Asia Surya Persada</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  active(l.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {l.name}
              </Link>
            ))}
            {user && (
              <div className="ml-3 pl-3 border-l border-gray-100 flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-900 leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ═══ Mobile Overlay Drawer ═══ */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`sm:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-black text-gray-900">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Profile */}
          {user && <ProfileCard user={user} />}

          {/* Nav links */}
          {user ? (
            <div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.15em] mb-2 px-1">
                Navigasi
              </p>
              <div className="space-y-1">
                {links.map((l) => {
                  const Icon = NAV_ICON[l.path] || ChevronRight;
                  const isAct = active(l.path);
                  return (
                    <Link
                      key={l.path}
                      to={l.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isAct
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isAct ? 'text-blue-200' : 'text-gray-400'}`} />
                      <span className="flex-1">{l.name}</span>
                      <ChevronRight className={`h-3.5 w-3.5 ${isAct ? 'text-blue-300' : 'text-gray-300'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Sticky logout bottom */}
        {user && (
          <div className="px-4 pb-6 pt-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 border border-red-100 transition-all active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Keluar Aplikasi
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
