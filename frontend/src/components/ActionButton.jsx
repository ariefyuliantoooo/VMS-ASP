import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * ActionButton — tombol CTA yang bisa jadi <Link> atau <button>
 * Props:
 *   - to: string (jika Link)
 *   - onClick: fn (jika button)
 *   - variant: 'primary' | 'danger' | 'secondary'
 *   - icon: LucideIcon component
 *   - children: label text
 *   - fullWidth: boolean
 */
const ActionButton = ({
  to,
  onClick,
  variant = 'primary',
  icon: Icon,
  children,
  fullWidth = true,
  disabled = false,
}) => {
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    secondary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200',
  }[variant];

  const baseClass = `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 ${variantClass} ${fullWidth ? 'w-full' : ''}`;

  const content = (
    <>
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
      <ChevronRight className="w-4 h-4 opacity-50" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={baseClass}>
      {content}
    </button>
  );
};

export default ActionButton;
