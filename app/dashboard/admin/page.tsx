export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-purple-900 dark:text-purple-400 mb-2">
          Platform Administration
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Manage system users, global configurations, and platform-wide analytics.
        </p>
      </div>
      
      <div className="flex items-center justify-center p-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Coming Soon</h2>
          <p className="text-zinc-500">The intricate admin panel is currently under construction.</p>
        </div>
      </div>
    </div>
  );
}
