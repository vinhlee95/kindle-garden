import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-4 h-64 w-full max-w-lg rounded-lg" />
    </div>
  );
}
