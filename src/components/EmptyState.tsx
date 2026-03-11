import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-muted-foreground/40 mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
      <p className="text-muted-foreground mb-6">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
