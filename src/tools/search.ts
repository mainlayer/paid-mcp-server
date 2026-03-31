/**
 * tools/search.ts
 *
 * PAID TOOL: search_web
 * Price: $0.01 per call
 *
 * Search the web and return structured results with titles, URLs, and snippets.
 * Demo data is mocked — in production, integrate with a real search API like:
 *   - Brave Search API
 *   - Google Custom Search API
 *   - SerpAPI
 *   - Bing Search API
 *
 * Payment is verified upstream in index.ts via `withPayment`.
 */

import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';

export const searchToolSchema = {
  name: 'search_web',
  description:
    'Search the web and receive structured results with titles, URLs, and snippets. ' +
    'Requires Mainlayer payment ($0.01/call).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      query: {
        type: 'string',
        description: 'The search query. Example: "AI agents for automation"',
      },
      limit: {
        type: 'number',
        description: 'Number of results to return (1-10). Defaults to 5.',
        default: 5,
      },
    },
    required: ['payer_wallet', 'query'],
  },
};

export async function handleSearchTool(
  args: Record<string, unknown>,
  _entitlement: Entitlement
): Promise<CallToolResult> {
  const query = args.query as string;
  const limit = Math.min(Math.max(parseInt(String(args.limit ?? 5)), 1), 10);

  // DEMO: mocked search results based on query
  const results = getMockedSearchResults(query, limit);

  const resultsText = results
    .map(
      (r, i) =>
        `${i + 1}. ${r.title}\n   URL: ${r.url}\n   Snippet: ${r.snippet}`
    )
    .join('\n\n');

  return {
    content: [
      {
        type: 'text',
        text: [
          `[DEMO] Search results for "${query}":`,
          '',
          resultsText,
          '',
          '(This is demo data. Integrate with Brave Search, Google CSE, SerpAPI, or Bing Search API)',
        ].join('\n'),
      },
    ],
  };
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function getMockedSearchResults(query: string, limit: number): SearchResult[] {
  // Deterministic results based on query for reproducible demos
  const seed = query.length + query.charCodeAt(0);

  const domains = ['example.com', 'resource.io', 'guide.ai', 'tool.dev', 'learn.ai'];
  const titles = [
    `Best practices for ${query}`,
    `${query} explained for beginners`,
    `Advanced ${query} patterns`,
    `${query}: A comprehensive guide`,
    `Real-world ${query} examples`,
  ];
  const snippets = [
    `Learn how to implement ${query} effectively in your projects.`,
    `${query} is essential for modern development. Here's why...`,
    `Everything you need to know about ${query} in one place.`,
    `Expert tips and tricks for mastering ${query}.`,
    `${query} can improve your workflow by up to 300%.`,
  ];

  const results: SearchResult[] = [];
  for (let i = 0; i < limit; i++) {
    const idx = (seed + i) % Math.min(titles.length, domains.length, snippets.length);
    results.push({
      title: titles[idx],
      url: `https://${domains[idx]}/article-${i + 1}`,
      snippet: snippets[idx],
    });
  }

  return results;
}
