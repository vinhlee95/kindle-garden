import { cn } from "@/lib/utils";

interface CardDotsProps {
  total: number;
  current: number;
}

export function CardDots({ total, current }: CardDotsProps) {
  return (
    <div className="flex justify-center gap-1.5" role="tablist" aria-label="Card position">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          className={cn(
            "size-2 rounded-full transition-colors duration-200",
            i === current ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
