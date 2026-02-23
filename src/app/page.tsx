import { StatsCards } from "@/components/stats-cards";
import { RecentJobs } from "@/components/recent-jobs";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Dashboard</h2>
        <p className="text-slate-400 mt-1 text-sm">Overview of your job search</p>
      </div>
      <StatsCards />
      <div className="mt-6 sm:mt-8"><RecentJobs /></div>
    </div>
  );
}
