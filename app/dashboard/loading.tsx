/** Skeleton placeholders while dashboard routes load server data. */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse px-4 py-8">
      <div className="h-8 w-48 rounded bg-white/10" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="mt-8 flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-64 min-w-[260px] flex-1 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
