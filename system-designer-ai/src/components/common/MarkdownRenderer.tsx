import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Components;
}

function normalizeMarkdown(raw: string) {
  return raw.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

export function MarkdownRenderer({ content, className, components }: MarkdownRendererProps) {
  const normalizedContent = normalizeMarkdown(content);
  const baseComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-semibold text-slate-900 mb-3 mt-6 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-6 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-4 first:mt-0">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-sm leading-6 text-slate-700 mb-3 last:mb-0">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-sm text-slate-700 mb-3 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-sm text-slate-700 mb-3 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-sm text-slate-700">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-slate-200 pl-4 text-sm text-slate-600 italic my-3">
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children }) => {
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
            {children}
          </code>
        );
      }
      return (
        <code className={`text-xs text-slate-100 ${className || ''}`}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-slate-900 text-slate-100 rounded-md p-3 overflow-x-auto mb-3">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-left text-sm border border-slate-200">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-slate-200 px-3 py-2 text-slate-700">
        {children}
      </td>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 hover:text-blue-700 underline">
        {children}
      </a>
    ),
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ ...baseComponents, ...components }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
