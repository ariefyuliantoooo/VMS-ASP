import React from 'react';

const StatsCard = ({
  icon: Icon,
  value,
  label,
  colorClass = 'bg-indigo-50',
  iconColorClass = 'text-indigo-600',
  borderColor = 'border-indigo-100',
  sublabel,
}) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border ${borderColor} p-4
        flex items-center gap-3 shadow-sm
        hover:-translate-y-0.5 hover:shadow-md
        transition-all duration-200
      `}
    >
      {/* Icon box */}
      <div className={`w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColorClass}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-black text-gray-900 leading-none tracking-tight">
          {value}
        </p>
        <p className="text-[11px] text-gray-400 font-semibold mt-0.5 truncate uppercase tracking-wide">
          {label}
        </p>
        {sublabel && (
          <p className="text-[10px] text-gray-300 font-medium mt-0.5 truncate">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
