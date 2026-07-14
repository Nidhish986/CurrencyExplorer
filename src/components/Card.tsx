import type { ReactNode } from "react";
import { classNames } from "../utils/common";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={classNames("animate-card card-hover rounded-lg border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-leaf", className)}>{children}</section>;
}

export function SectionHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.14em] text-leaf/75 dark:text-mint/80">{eyebrow}</p> : null}
        <h2 className="text-xl font-black tracking-normal text-ink dark:text-paper">{title}</h2>
      </div>
      {action}
    </div>
  );
}
