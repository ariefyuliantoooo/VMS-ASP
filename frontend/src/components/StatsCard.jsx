import React from 'react';

const StatsCard = ({
  icon: Icon,
  value,
  label,
  colorClass = 'bg-indigo-50',
  iconColorClass = 'text-indigo-600',
  borderColor = 'border-indigo-100',
}) => {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} p-3 flex items-center gap-3 shadow-sm`}>
      {/* Icon box */}
      <div className={`w-9 h-9 ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-[18px] h-[18px] ${iconColorClass}`} />
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
