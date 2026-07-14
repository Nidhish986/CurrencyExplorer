export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-leaf" aria-hidden="true">
      <div className="skeleton h-5 w-32 rounded" />
      <div className="mt-5 space-y-3">
        <div className="skeleton h-11 rounded-lg" />
        <div className="skeleton h-11 rounded-lg" />
        <div className="skeleton h-11 rounded-lg" />
      </div>
    </div>
  );
}
