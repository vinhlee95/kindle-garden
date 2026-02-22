import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/SyncButton";

export default function ImportPage() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Import Highlights</h1>
        <p className="mt-2 text-muted-foreground">
          Sync your Kindle highlights to start reviewing them.
        </p>
      </div>

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

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            To sync highlights, add your Amazon Kindle cookies to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              .env.local
            </code>
            :
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs">
{`KINDLE_COOKIE="your-cookie-string"
KINDLE_CSRF_TOKEN="your-csrf-token"`}
          </pre>
          <p className="mt-3">
            You can find these values in your browser&apos;s developer tools while
            logged in to read.amazon.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
