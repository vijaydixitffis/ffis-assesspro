
import { DashboardNav } from '@/components/DashboardNav';

export default function AccessDeniedPage() {
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p>This page is currently under development. Please check back later.</p>
        </div>
      </main>
    </div>
  );
}
