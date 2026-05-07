import VisitorsTable from '@/components/VisitorsTable'

export const metadata = {
  title: 'Visitors | VMS SaaS',
  description: 'Manage visitors for your facility',
}

export default function VisitorsPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Visitors</h1>
          <p className="text-slate-500 mt-1">Real-time log of all visitors in your facility.</p>
        </div>
      </div>

      <VisitorsTable />
    </div>
  )
}
