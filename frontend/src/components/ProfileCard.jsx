import React from 'react';

const ProfileCard = ({ user }) => {
  if (!user) return null;
  const initials = user.full_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 rounded-2xl">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-900 leading-tight truncate">
          {user.full_name}
        </p>
        <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
          {user.role}
        </span>
      </div>
    </div>
  );
};

export default ProfileCard;
