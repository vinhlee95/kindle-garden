import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: string;
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-white text-foreground border border-border"
            : "bg-emerald-50 text-emerald-900"
        )}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
              code: ({ children, className }) => {
                const isBlock = className?.startsWith("language-");
                return isBlock ? (
                  <code className="block bg-emerald-100 text-emerald-800 font-mono text-xs p-2 rounded my-1 overflow-x-auto whitespace-pre">
                    {children}
                  </code>
                ) : (
                  <code className="bg-emerald-100 text-emerald-800 font-mono text-xs px-1 rounded">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => <pre className="my-1">{children}</pre>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-emerald-300 pl-2 italic text-emerald-700 my-1">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
