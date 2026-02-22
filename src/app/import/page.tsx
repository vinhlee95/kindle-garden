import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/SyncButton";
import { getAllBooks, getHighlights } from "@/lib/db/queries";

export default function ImportPage() {
  const books = getAllBooks();
  const { total: highlightCount } = getHighlights(undefined, 1, 1);
  const hasData = highlightCount > 0;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Import Highlights</h1>
        <p className="mt-2 text-muted-foreground">
          Sync your Kindle highlights to start reviewing them.
        </p>
      </div>

      {hasData && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Current Library</CardTitle>
            <CardDescription>Last synced data from Kindle</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">{books.length}</p>
              <p className="text-sm text-muted-foreground">Books</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{highlightCount}</p>
              <p className="text-sm text-muted-foreground">Highlights</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Kindle Sync</CardTitle>
          <CardDescription>
            Pull your latest highlights from Amazon Kindle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <SyncButton />
        </CardContent>
      </Card>
    </div>
  );
}
