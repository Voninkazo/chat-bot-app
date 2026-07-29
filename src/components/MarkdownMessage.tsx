import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface Props {
  content: string;
}

// Defined outside the component so they aren't recreated on every render.
const components: Components = {
  // Fenced code blocks (``` language ```) get syntax highlighting.
  // Inline code (single backtick) gets a subtle highlight style.
  code({ className, children }) {
    const language = /language-(\w+)/.exec(className || "")?.[1];
    const code = String(children).replace(/\n$/, "");

    if (language) {
      return (
        <SyntaxHighlighter
          language={language}
          style={oneLight}
          PreTag="div"
          customStyle={{ borderRadius: "0.5rem", fontSize: "0.8rem", margin: "0.5rem 0" }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }

    // Inline code
    return (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  },

  // Wrap fenced code blocks — the SyntaxHighlighter already renders its own
  // container, so we just pass through without adding an extra <pre>.
  pre({ children }) {
    return <>{children}</>;
  },

  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),

  h1: ({ children }) => (
    <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>
  ),

  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-3 my-2 text-gray-600 italic">
      {children}
    </blockquote>
  ),

  // Open links in a new tab safely
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),

  em: ({ children }) => <em className="italic">{children}</em>,

  hr: () => <hr className="my-3 border-gray-200" />,
};

// Renders markdown content from AI responses.
// Only used for assistant messages — user messages are plain text.
export const MarkdownMessage = ({ content }: Props) => {
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
};
