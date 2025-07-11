
import { DashboardNav } from '@/components/DashboardNav';

interface AccessDeniedViewProps {
  message?: string;
}

export default function AccessDeniedView({ message = "You need admin privileges to access this page." }: AccessDeniedViewProps) {
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-7xl p-6">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p>{message}</p>
        </div>
      </main>
    </div>
  );
}
