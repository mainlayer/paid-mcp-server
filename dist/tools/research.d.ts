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
import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';
export declare const researchToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            payer_wallet: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            max_results: {
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
export declare function handleResearchTool(args: Record<string, unknown>, _entitlement: Entitlement): Promise<CallToolResult>;
//# sourceMappingURL=research.d.ts.map