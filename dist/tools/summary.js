"use strict";
/**
 * tools/summary.ts
 *
 * DEMO TOOL: ai_summary
 * Price: $0.01 per call
 *
 * Summarizes text using AI. The summary in this demo is mocked — in production
 * you would replace `generateSummary` with a real LLM call (e.g. Anthropic API,
 * OpenAI, or a local model).
 *
 * Mainlayer payment is handled upstream in index.ts via `withPayment`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryToolSchema = void 0;
exports.handleSummaryTool = handleSummaryTool;
// ---------------------------------------------------------------------------
// Tool schema definition
// ---------------------------------------------------------------------------
exports.summaryToolSchema = {
    name: 'ai_summary',
    description: '[DEMO] Summarize text with AI. Returns a concise summary with key points. ' +
        'Requires Mainlayer payment ($0.01/call). Pass your payer_wallet to authorize.',
    inputSchema: {
        type: 'object',
        properties: {
            payer_wallet: {
                type: 'string',
                description: 'Your Mainlayer wallet address. Required for payment verification.',
            },
            text: {
                type: 'string',
                description: 'The text to summarize (max ~10,000 characters).',
                maxLength: 10000,
            },
            style: {
                type: 'string',
                enum: ['brief', 'detailed', 'bullet-points'],
                description: 'Summary style. Defaults to "brief".',
                default: 'brief',
            },
            max_sentences: {
                type: 'number',
                description: 'Maximum number of sentences in the summary (1–10). Defaults to 3.',
                minimum: 1,
                maximum: 10,
                default: 3,
            },
        },
        required: ['payer_wallet', 'text'],
    },
};
// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
async function handleSummaryTool(args, _entitlement) {
    const text = args.text;
    const style = args.style ?? 'brief';
    const maxSentences = Math.min(Math.max(Number(args.max_sentences ?? 3), 1), 10);
    if (!text.trim()) {
        return {
            content: [{ type: 'text', text: 'Error: The text parameter is empty.' }],
            isError: true,
        };
    }
    // DEMO: mocked summary generation
    // Replace this with a real LLM API call in production.
    const summary = generateMockedSummary(text, style, maxSentences);
    return {
        content: [
            {
                type: 'text',
                text: [
                    `[DEMO] AI Summary (${style} style):`,
                    '',
                    summary,
                    '',
                    `Original length: ${text.length} characters`,
                    `Summary length:  ${summary.length} characters`,
                    `Compression:     ${Math.round((1 - summary.length / text.length) * 100)}%`,
                    '',
                    '(This is a demo summary. Replace generateMockedSummary() with a real LLM call.)',
                ].join('\n'),
            },
        ],
    };
}
// ---------------------------------------------------------------------------
// Mock summary generation (replace with real LLM in production)
// ---------------------------------------------------------------------------
function generateMockedSummary(text, style, maxSentences) {
    // Extract "sentences" naively for the demo
    const sentences = text
        .replace(/([.!?])\s+/g, '$1\n')
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 20);
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\W+/)).size;
    if (style === 'bullet-points') {
        const points = sentences.slice(0, maxSentences).map((s) => `• ${s}`);
        if (points.length === 0) {
            points.push(`• The provided text contains ${wordCount} words.`);
            points.push(`• It uses ${uniqueWords} unique terms.`);
        }
        return points.join('\n');
    }
    if (style === 'detailed') {
        const selected = sentences.slice(0, Math.min(maxSentences, sentences.length));
        if (selected.length === 0) {
            return (`The text provided contains ${wordCount} words and ${uniqueWords} unique terms. ` +
                `It covers topics that merit further exploration.`);
        }
        return selected.join(' ');
    }
    // brief (default)
    if (sentences.length > 0) {
        return sentences.slice(0, Math.min(maxSentences, sentences.length)).join(' ');
    }
    return (`The provided text is ${wordCount} words long. ` +
        `It covers ${uniqueWords} unique concepts.`);
}
//# sourceMappingURL=summary.js.map