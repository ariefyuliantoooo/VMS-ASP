'use client';

export default function TenantSwitcher({ role, tenants, activeTenant, onSwitch }) {
  if (role !== 'superadmin') return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-500">View as:</span>
      <select 
        value={activeTenant} 
        onChange={(e) => onSwitch(e.target.value)}
        className="bg-white border border-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm outline-none font-medium text-gray-700"
      >
        <option value="ALL">🏢 All Tenants</option>
        {tenants?.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
