/**
 * tools/summarize_url.ts
 *
 * PAID TOOL: summarize_url
 * Price: $0.03 per call
 *
 * Fetch and summarize content from a web URL.
 * Returns a structured summary with key points, metadata, and readability score.
 * Demo uses mocked URL fetching — in production, integrate with:
 *   - Claude API
 *   - OpenAI GPT-4
 *   - Cheerio + your summarization service
 *   - Browser automation (Puppeteer, Playwright)
 *
 * Payment is verified upstream in index.ts via `withPayment`.
 */

import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';

export const urlSummaryToolSchema = {
  name: 'summarize_url',
  description:
    'Fetch and summarize content from a web URL. Returns key points, metadata, and a readability score. ' +
    'Requires Mainlayer payment ($0.03/call).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      url: {
        type: 'string',
        description: 'The URL to summarize. Must start with http:// or https://',
      },
      length: {
        type: 'string',
        description: 'Summary length: "brief" (1-2 sentences), "medium" (3-5 sentences), "detailed" (full outline)',
        default: 'medium',
      },
      include_metadata: {
        type: 'boolean',
        description: 'Include metadata (title, author, publish date) in response. Defaults to true.',
        default: true,
      },
    },
    required: ['payer_wallet', 'url'],
  },
};

export async function handleUrlSummaryTool(
  args: Record<string, unknown>,
  _entitlement: Entitlement
): Promise<CallToolResult> {
  const url = args.url as string;
  const length = (args.length as string | undefined) ?? 'medium';
  const includeMetadata = args.include_metadata !== false;

  // Validate URL
  if (!isValidUrl(url)) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: Invalid URL. Must start with http:// or https://`,
        },
      ],
    };
  }

  // DEMO: mocked URL summary
  const summary = getMockedUrlSummary(url, length, includeMetadata);

  const metadataSection = includeMetadata
    ? [
        '',
        '=== METADATA ===',
        `Title: ${summary.metadata.title}`,
        `Author: ${summary.metadata.author}`,
        `Published: ${summary.metadata.publishDate}`,
        `Word Count: ${summary.metadata.wordCount}`,
        `Readability: ${summary.metadata.readabilityScore}/100`,
      ].join('\n')
    : '';

  return {
    content: [
      {
        type: 'text',
        text: [
          `[DEMO] URL Summary`,
          `URL: ${url}`,
          '',
          '=== SUMMARY ===',
          summary.summary,
          metadataSection,
          '',
          '(This is demo content. Integrate with Claude API, Cheerio + LLM, or browser automation)',
        ].join('\n'),
      },
    ],
  };
}

interface UrlMetadata {
  title: string;
  author: string;
  publishDate: string;
  wordCount: number;
  readabilityScore: number;
}

interface UrlSummaryResult {
  summary: string;
  metadata: UrlMetadata;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getMockedUrlSummary(url: string, length: string, includeMetadata: boolean): UrlSummaryResult {
  // Extract domain from URL for demo purposes
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace('www.', '');

  // Generate deterministic summary based on URL
  const seed = url.length + url.charCodeAt(0);

  const summaries: Record<string, string> = {
    brief: `This article from ${domain} discusses important topics. Key takeaway: The content provides valuable insights for readers interested in this subject.`,
    medium: `This comprehensive article from ${domain} covers multiple perspectives on a relevant topic. The piece outlines key trends, provides expert analysis, and offers actionable recommendations. Readers will find practical insights and data-driven conclusions that support informed decision-making.`,
    detailed: `This in-depth publication from ${domain} provides a thorough examination of the subject. The content is organized into several key sections:\n\n1. Introduction & Context - Sets up the problem and why it matters\n2. Current State & Trends - Analyzes recent developments and patterns\n3. Expert Perspectives - Incorporates viewpoints from industry leaders\n4. Data & Evidence - Supports claims with research and statistics\n5. Practical Applications - Offers actionable takeaways and recommendations\n6. Conclusion & Future Outlook - Summarizes key points and emerging opportunities`,
  };

  const summary = summaries[length] || summaries.medium;

  // Generate metadata
  const metadata: UrlMetadata = {
    title: `Article from ${domain}`,
    author: seed % 3 === 0 ? 'Staff Writer' : seed % 3 === 1 ? 'Contributing Editor' : 'Unknown',
    publishDate: new Date(Date.now() - seed * 86400000).toLocaleDateString(),
    wordCount: 800 + (seed % 2000),
    readabilityScore: 65 + (seed % 35),
  };

  return { summary, metadata };
}
