import React from 'react';
import {
  Building2, User, Phone, Briefcase, AlertCircle,
  Clock3, LogIn, LogOut, Trash2, Calendar, MapPin,
} from 'lucide-react';

const STATUS = {
  PENDING: {
    label: 'Terdaftar',
    bar: 'bg-yellow-50 border-b border-yellow-100',
    text: 'text-yellow-700',
    icon: 'text-yellow-500',
    dot: 'bg-yellow-400',
    Icon: Clock3,
  },
  CHECKED_IN: {
    label: 'Checked In',
    bar: 'bg-green-50 border-b border-green-100',
    text: 'text-green-700',
    icon: 'text-green-500',
    dot: 'bg-green-400',
    Icon: LogIn,
  },
  CHECKED_OUT: {
    label: 'Checked Out',
    bar: 'bg-gray-50 border-b border-gray-100',
    text: 'text-gray-500',
    icon: 'text-gray-400',
    dot: 'bg-gray-300',
    Icon: LogOut,
  },
  DONE: {
    label: 'Selesai',
    bar: 'bg-gray-50 border-b border-gray-100',
    text: 'text-gray-500',
    icon: 'text-gray-400',
    dot: 'bg-gray-300',
    Icon: LogOut,
  },
  REJECTED: {
    label: 'Ditolak',
    bar: 'bg-red-50 border-b border-red-100',
    text: 'text-red-600',
    icon: 'text-red-400',
    dot: 'bg-red-400',
    Icon: AlertCircle,
  },
};

const VisitorCard = ({ visit, onDelete, deletingId }) => {
  const cfg = STATUS[visit.status] || STATUS.PENDING;
  const { Icon: StatusIcon } = cfg;
  const isDeleting = deletingId === visit.id;

  const dateStr = visit.visit_date
    ? new Date(visit.visit_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* ── Status bar ── */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${cfg.bar}`}>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${cfg.text}`}>
          {/* Dot indicator */}
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
          <StatusIcon className={`w-3.5 h-3.5 ${cfg.icon}`} />
          {cfg.label}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar className="w-3 h-3" />
          {dateStr}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-3.5 pb-4">
        {/* Name and ID */}
        <div className="flex justify-between items-start mb-0.5">
          <p className="text-base font-bold text-gray-900 truncate leading-tight">
            {visit.full_name}
          </p>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100 flex-shrink-0">
            ID: {visit.qr_code ? visit.qr_code.split('-')[0].toUpperCase() : visit.id}
          </span>
        </div>

        {/* Company */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <Building2 className="w-3 h-3 flex-shrink-0 text-gray-400" />
          <span className="truncate font-medium">{visit.company}</span>
        </div>

        {/* Details grid */}
        <div className="space-y-1.5 mb-3.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3 h-3 flex-shrink-0 text-gray-400" />
            <span className="truncate">Bertemu: <span className="font-semibold text-gray-700">{visit.person_to_meet}</span></span>
          </div>
          {visit.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3 h-3 flex-shrink-0 text-gray-400" />
              <span>{visit.phone}</span>
            </div>
          )}
          {visit.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
              <span>{visit.location}</span>
            </div>
          )}
          {visit.check_in_time && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock3 className="w-3 h-3 flex-shrink-0 text-gray-400" />
              <span>Check-in: {new Date(visit.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {visit.check_out_time && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock3 className="w-3 h-3 flex-shrink-0 text-gray-400" />
              <span>Check-out: {new Date(visit.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {/* Work Permit badge */}
          <div className="pt-0.5">
            {visit.WorkPermit ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Briefcase className="w-3 h-3" />
                Work Permit Terlampir
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                <AlertCircle className="w-3 h-3" />
                Belum Ada Work Permit
              </span>
            )}
          </div>
        </div>

        {/* ── Delete button ── */}
        {onDelete && (
          <button
            onClick={() => onDelete(visit.id)}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] disabled:opacity-50 transition-all border border-red-100"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Kunjungan
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VisitorCard;
