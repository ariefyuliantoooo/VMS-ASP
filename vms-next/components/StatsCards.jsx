import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react'

export default function StatsCards({ stats }) {
  const cards = [
    { 
      title: 'Total Visitors', 
      value: stats?.totalToday || 0, 
      label: 'Today',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Checked In', 
      value: stats?.checkedIn || 0, 
      label: 'Active Now',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      trend: '+5%',
      trendUp: true
    },
    { 
      title: 'Checked Out', 
      value: stats?.checkedOut || 0, 
      label: 'Completed',
      icon: UserMinus,
      color: 'from-slate-600 to-gray-700',
      trend: '-2%',
      trendUp: false
    },
    { 
      title: 'Pending', 
      value: stats?.pending || 0, 
      label: 'Awaiting Approval',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      trend: 'New',
      trendUp: true
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {card.trend}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{card.title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
