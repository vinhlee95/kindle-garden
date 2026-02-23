import { getReviewCards } from "@/lib/db/queries";
import { ReviewDeck } from "@/components/ReviewDeck";

export default async function HomePage() {
  const initialCards = await getReviewCards(3);
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Today's Garden</h1>
        <p className="mt-2 text-muted-foreground">
          Swipe through today&apos;s highlights.
        </p>
      </div>
      <ReviewDeck initialCards={initialCards} />
    </div>
  );
}
