import { CheckCircle2, ShieldCheck } from "lucide-react";

export type ReviewStatus = "source_listed" | "needs_review";

export interface SourceTrustItem {
  label: string;
  value: string;
}

interface SourceTrustProps {
  items: SourceTrustItem[];
  reviewStatus?: ReviewStatus;
  compact?: boolean;
  className?: string;
}

const REVIEW_LABELS: Record<ReviewStatus, string> = {
  source_listed: "Source listed",
  needs_review: "Needs scholarly review",
};

export function SourceTrust({
  items,
  reviewStatus = "source_listed",
  compact = false,
  className = "",
}: SourceTrustProps) {
  const visibleItems = items.filter((item) => item.value);
  if (visibleItems.length === 0 && !reviewStatus) return null;

  return (
    <div className={`flex min-w-0 max-w-full flex-wrap items-center gap-2 text-xs ${className}`}>
      {visibleItems.map((item) => (
        <span
          key={`${item.label}-${item.value}`}
          className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-muted-foreground"
        >
          <ShieldCheck className="h-3 w-3 shrink-0" />
          <span className="shrink-0 font-medium text-foreground/80">{item.label}:</span>
          <span className="min-w-0 truncate">{item.value}</span>
        </span>
      ))}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
          reviewStatus === "source_listed"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        }`}
        title={compact ? REVIEW_LABELS[reviewStatus] : undefined}
      >
        <CheckCircle2 className="h-3 w-3 shrink-0" />
        {REVIEW_LABELS[reviewStatus]}
      </span>
    </div>
  );
}
