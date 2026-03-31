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
import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';
export declare const summaryToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            payer_wallet: {
                type: string;
                description: string;
            };
            text: {
                type: string;
                description: string;
                maxLength: number;
            };
            style: {
                type: string;
                enum: string[];
                description: string;
                default: string;
            };
            max_sentences: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                default: number;
            };
        };
        required: string[];
    };
};
export declare function handleSummaryTool(args: Record<string, unknown>, _entitlement: Entitlement): Promise<CallToolResult>;
//# sourceMappingURL=summary.d.ts.map