import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }) {
  // TODO: Fetch profile and tenant from server session
  const userRole = 'superadmin' // Mock

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={userRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
