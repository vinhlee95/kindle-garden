import { getHighlightById } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { HighlightDetailContent } from "./HighlightDetailContent";

export default async function HighlightDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const data = await getHighlightById(parseInt(id, 10));
  if (!data) notFound();
  return <HighlightDetailContent data={data} fromReview={from === "review"} />;
}
