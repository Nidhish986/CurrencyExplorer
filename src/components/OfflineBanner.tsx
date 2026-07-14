import { WifiOff } from "lucide-react";
import { useApp } from "../context/AppContext";

export function OfflineBanner() {
  const { isOnline } = useApp();
  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-50 bg-coral px-4 py-2 text-center text-sm font-extrabold text-ink" role="status">
      <span className="inline-flex items-center gap-2">
        <WifiOff size={17} aria-hidden="true" /> Offline mode: live exchange-rate actions are disabled until your connection returns.
      </span>
    </div>
  );
}
