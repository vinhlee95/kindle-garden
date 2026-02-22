export interface KindleHighlight {
  text: string;
  location: string | null;
  date: string | null;
}

export interface KindleBook {
  title: string;
  author: string;
  highlights: KindleHighlight[];
}

export interface KindleData {
  books: KindleBook[];
}

const KINDLE_HIGHLIGHTS_URL = "https://read.amazon.com/notebook";

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function extractAsins(html: string): string[] {
  const asinRegex =
    /<div\s+id="([A-Z0-9]{10})"\s+class="[^"]*kp-notebook-library-each-book/g;
  return [...html.matchAll(asinRegex)].map((m) => m[1]);
}

function parseBookPage(html: string): KindleBook | null {
  // Title is in an h3 with kp-notebook-metadata class
  const titleMatch = html.match(
    /<h3[^>]*class="[^"]*kp-notebook-metadata[^"]*"[^>]*>([\s\S]*?)<\/h3>/
  );
  if (!titleMatch) return null;
  const title = decodeHtmlEntities(stripTags(titleMatch[1])).trim();

  // Author is in a p with both a-color-secondary and kp-notebook-metadata
  const authorMatch = html.match(
    /<p[^>]*class="[^"]*a-color-secondary[^"]*kp-notebook-metadata[^"]*"[^>]*>([\s\S]*?)<\/p>/
  );
  const author = authorMatch
    ? decodeHtmlEntities(stripTags(authorMatch[1])).trim()
    : "Unknown Author";

  // Locations come from hidden inputs: <input id="kp-annotation-location" value="287">
  const locationTags = [
    ...html.matchAll(/<input[^>]*id="kp-annotation-location"[^>]*>/g),
  ];
  const locations = locationTags.map(
    (m) => m[0].match(/value="([^"]*)"/)?.[1] ?? null
  );

  // Highlight texts: div.kp-notebook-highlight > span#highlight
  const highlightRegex =
    /<div[^>]*class="[^"]*kp-notebook-highlight[^"]*"[^>]*>[\s\S]*?<span[^>]*id="highlight"[^>]*>([\s\S]*?)<\/span>/g;
  const highlightMatches = [...html.matchAll(highlightRegex)];

  const highlights: KindleHighlight[] = highlightMatches
    .map((m, i) => ({
      text: decodeHtmlEntities(stripTags(m[1])).trim(),
      location: locations[i] ? `Location ${locations[i]}` : null,
      date: null,
    }))
    .filter((h) => h.text.length > 0);

  return { title, author, highlights };
}

export async function fetchKindleHighlights(): Promise<KindleData> {
  const cookieString = process.env.KINDLE_COOKIES;
  if (!cookieString) {
    throw new Error("KINDLE_COOKIES environment variable is not set");
  }

  const headers: Record<string, string> = {
    Cookie: cookieString.trim(),
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  // Step 1: fetch the main notebook page to collect all ASINs
  const mainRes = await fetch(KINDLE_HIGHLIGHTS_URL, {
    redirect: "manual",
    headers,
  });

  if (mainRes.status === 301 || mainRes.status === 302 || mainRes.status === 303) {
    const location = mainRes.headers.get("location") ?? "";
    if (location.includes("signin") || location.includes("ap/signin")) {
      throw new Error(
        "Authentication failed: KINDLE_COOKIES are expired or invalid. Please refresh your cookies from read.amazon.com."
      );
    }
    throw new Error(`Unexpected redirect to: ${location}`);
  }

  if (!mainRes.ok) {
    throw new Error(
      `Failed to fetch Kindle highlights: ${mainRes.status} ${mainRes.statusText}`
    );
  }

  const mainHtml = await mainRes.text();
  const asins = extractAsins(mainHtml);

  // Step 2: fetch per-ASIN page for each book to get the actual highlights
  const books: KindleBook[] = [];
  for (const asin of asins) {
    const bookRes = await fetch(
      `${KINDLE_HIGHLIGHTS_URL}?asin=${asin}&contentLimitState=&`,
      { redirect: "manual", headers }
    );

    if (!bookRes.ok) continue;

    const bookHtml = await bookRes.text();
    const book = parseBookPage(bookHtml);
    if (book && book.highlights.length > 0) {
      books.push(book);
    }
  }

  return { books };
}
