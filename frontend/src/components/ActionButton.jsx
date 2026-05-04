import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';

/**
 * ActionButton — tombol CTA yang bisa jadi <Link> atau <button>
 * Props:
 *   - to: string (jika Link)
 *   - onClick: fn (jika button)
 *   - variant: 'primary' | 'danger' | 'secondary' | 'ghost' | 'success' | 'warning'
 *   - icon: LucideIcon component
 *   - iconRight: LucideIcon (override chevron kanan)
 *   - children: label text
 *   - fullWidth: boolean
 *   - loading: boolean — tampilkan spinner
 *   - size: 'sm' | 'md' | 'lg'
 *   - showChevron: boolean (default true untuk Link, false untuk button)
 *   - disabled: boolean
 *   - type: 'button' | 'submit'
 */
const ActionButton = ({
  to,
  onClick,
  variant = 'primary',
  icon: Icon,
  iconRight: IconRight,
  children,
  fullWidth = true,
  disabled = false,
  loading = false,
  size = 'md',
  showChevron,
  type = 'button',
}) => {
  const variantClass = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 active:bg-indigo-800',
    success:   'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200/50 active:bg-green-800',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200/50 active:bg-amber-700',
    danger:    'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:bg-red-200',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm active:bg-gray-100',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  }[variant] || 'bg-indigo-600 text-white hover:bg-indigo-700';

  const sizeClass = {
    sm: 'px-3 py-2 text-xs rounded-lg',
    md: 'px-4 py-3 text-sm rounded-xl',
    lg: 'px-5 py-4 text-base rounded-2xl',
  }[size] || 'px-4 py-3 text-sm rounded-xl';

  // Tampilkan chevron hanya jika `to` (Link) dan tidak di-override
  const displayChevron = showChevron !== undefined ? showChevron : !!to;

  const baseClass = `
    inline-flex items-center justify-between font-semibold
    transition-all active:scale-[0.98] 
    disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
    ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''}
  `.trim();

  const content = (
    <>
      <span className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          Icon && <Icon className="w-4 h-4 flex-shrink-0" />
        )}
        {children}
      </span>
      {displayChevron && (
        IconRight
          ? <IconRight className="w-4 h-4 opacity-50 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 opacity-40 flex-shrink-0" />
      )}
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
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClass}
    >
      {content}
    </button>
  );
};

export default ActionButton;
