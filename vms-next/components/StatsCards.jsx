export default function StatsCards({ stats }) {
  const cards = [
    { title: 'Total Visitors Today', value: stats?.totalToday || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Checked In', value: stats?.checkedIn || 0, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Checked Out', value: stats?.checkedOut || 0, color: 'text-gray-600', bg: 'bg-gray-50' },
    { title: 'Pending Approval', value: stats?.pending || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className={`p-4 rounded-full ${card.bg}`}>
            <span className={`text-xl font-black ${card.color}`}>{card.value}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
