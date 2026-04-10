import React from 'react';
import { Building2, User, Phone, Briefcase, AlertCircle, Clock3, LogIn, LogOut, Trash2 } from 'lucide-react';

const STATUS = {
  PENDING: {
    label: 'Terdaftar',
    dot: 'bg-yellow-400',
    bar: 'bg-yellow-50 border-yellow-100',
    text: 'text-yellow-700',
    Icon: Clock3,
  },
  CHECKED_IN: {
    label: 'Check In',
    dot: 'bg-green-400',
    bar: 'bg-green-50 border-green-100',
    text: 'text-green-700',
    Icon: LogIn,
  },
  CHECKED_OUT: {
    label: 'Check Out',
    dot: 'bg-gray-300',
    bar: 'bg-gray-50 border-gray-100',
    text: 'text-gray-500',
    Icon: LogOut,
  },
};

const VisitorCard = ({ visit, onDelete, deletingId }) => {
  const cfg = STATUS[visit.status] || STATUS.PENDING;
  const { Icon: StatusIcon } = cfg;
  const isDeleting = deletingId === visit.id;

  const dateStr = visit.visit_date
    ? new Date(visit.visit_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Status bar ── */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${cfg.bar}`}>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.text}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </div>
        <span className="text-[11px] text-gray-400">{dateStr}</span>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-3 pb-3">
        {/* Name */}
        <p className="text-[15px] font-bold text-gray-900 truncate leading-tight mb-1">
          {visit.full_name}
        </p>

        {/* Company */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2.5">
          <Building2 className="w-3 h-3 flex-shrink-0 text-gray-400" />
          <span className="truncate">{visit.company}</span>
        </div>

        {/* Details row */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3 h-3 flex-shrink-0 text-gray-400" />
            <span className="truncate">{visit.person_to_meet}</span>
          </div>
          {visit.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3 h-3 flex-shrink-0 text-gray-400" />
              <span>{visit.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs">
            {visit.WorkPermit ? (
              <>
                <Briefcase className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span className="text-blue-600 font-medium">Work Permit Ada</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-red-500 font-medium">Tidak Ada Work Permit</span>
              </>
            )}
          </div>
        </div>

        {/* ── Delete button ── */}
        <button
          onClick={() => onDelete(visit.id)}
          disabled={isDeleting}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] disabled:opacity-50 transition-all border border-red-100"
        >
          {isDeleting ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
              Menghapus...
            </>
          ) : (
            <>
              <Trash2 className="w-3 h-3" />
              Hapus Data
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VisitorCard;
