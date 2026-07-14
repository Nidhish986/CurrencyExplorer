import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-paper/60 p-6 text-center dark:border-white/20 dark:bg-night/30">
      <Icon className="mx-auto mb-3 text-leaf dark:text-mint" size={32} aria-hidden="true" />
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm leading-6 text-ink/80 dark:text-paper/80">{message}</p>
    </div>
  );
}
