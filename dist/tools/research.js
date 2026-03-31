"use strict";
/**
 * tools/research.ts
 *
 * DEMO TOOL: web_search
 * Price: $0.005 per call
 *
 * Searches the web and returns structured results.
 * The results in this demo are mocked — in production you would replace
 * the `performSearch` function with a real search API (e.g. Brave Search, SerpAPI).
 *
 * Mainlayer payment is handled upstream in index.ts via `withPayment`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchToolSchema = void 0;
exports.handleResearchTool = handleResearchTool;
// ---------------------------------------------------------------------------
// Tool schema definition
// ---------------------------------------------------------------------------
exports.researchToolSchema = {
    name: 'web_search',
    description: '[DEMO] Search the web and return relevant results. ' +
        'Requires Mainlayer payment ($0.005/call). Pass your payer_wallet to authorize.',
    inputSchema: {
        type: 'object',
        properties: {
            payer_wallet: {
                type: 'string',
                description: 'Your Mainlayer wallet address. Required for payment verification.',
            },
            query: {
                type: 'string',
                description: 'The search query.',
            },
            max_results: {
                type: 'number',
                description: 'Maximum number of results to return (1–10). Defaults to 5.',
                minimum: 1,
                maximum: 10,
                default: 5,
            },
        },
        required: ['payer_wallet', 'query'],
    },
};
// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
async function handleResearchTool(args, _entitlement) {
    const query = args.query;
    const maxResults = Math.min(Math.max(Number(args.max_results ?? 5), 1), 10);
    // DEMO: mocked search results
    // Replace this with a real search API call in production.
    const results = getMockedSearchResults(query, maxResults);
    const formatted = results
        .map((r, i) => [
        `${i + 1}. ${r.title}`,
        `   URL: ${r.url}`,
        `   ${r.snippet}`,
    ].join('\n'))
        .join('\n\n');
    return {
        content: [
            {
                type: 'text',
                text: [
                    `[DEMO] Web search results for: "${query}"`,
                    `Found ${results.length} results`,
                    '',
                    formatted,
                    '',
                    '(These are demo results. Replace getMockedSearchResults() with a real search API.)',
                ].join('\n'),
            },
        ],
    };
}
function getMockedSearchResults(query, maxResults) {
    const templates = [
        {
            title: `Understanding ${query} — A Complete Guide`,
            url: `https://example.com/guide-${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `This comprehensive guide covers everything you need to know about ${query}, including best practices, examples, and common pitfalls.`,
        },
        {
            title: `${query}: Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
            snippet: `${query} refers to a concept with broad applications. This article covers its history, definitions, and key characteristics.`,
        },
        {
            title: `Top 10 Facts About ${query}`,
            url: `https://blog.example.com/facts-${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Discover the most important things to know about ${query}. Experts share their insights on this topic.`,
        },
        {
            title: `${query} Tutorial for Beginners`,
            url: `https://tutorial.example.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `A step-by-step tutorial introducing ${query}. No prior experience required. Includes code examples and exercises.`,
        },
        {
            title: `Latest Research on ${query} — 2024`,
            url: `https://research.example.com/papers/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Recent studies on ${query} reveal new insights. Researchers from leading institutions share their findings.`,
        },
        {
            title: `${query} — Stack Overflow`,
            url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Popular questions and answers about ${query} from the developer community.`,
        },
        {
            title: `How to Use ${query} Effectively`,
            url: `https://howto.example.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Learn the most effective techniques for working with ${query}. Tips from practitioners with real-world experience.`,
        },
        {
            title: `${query} vs Alternatives — Comparison`,
            url: `https://compare.example.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}-vs-alternatives`,
            snippet: `A detailed comparison of ${query} against popular alternatives, covering features, performance, and use cases.`,
        },
        {
            title: `${query} GitHub Repository`,
            url: `https://github.com/example/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Open source repository for ${query}. Stars: 12.4k. Actively maintained with regular releases.`,
        },
        {
            title: `${query} Community Forum`,
            url: `https://forum.example.com/c/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Join the ${query} community. Ask questions, share ideas, and connect with other practitioners.`,
        },
    ];
    return templates.slice(0, maxResults);
}
//# sourceMappingURL=research.js.map