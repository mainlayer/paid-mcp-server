/**
 * middleware.ts
 *
 * Payment gate middleware for MCP tool handlers.
 *
 * Rather than calling `requirePayment` manually in every tool, you can
 * wrap your tool handlers with `withPayment`. This keeps tool logic clean
 * and ensures the payment check is never accidentally skipped.
 *
 * @example
 * ```typescript
 * server.setRequestHandler(CallToolRequestSchema, async (request) => {
 *   return withPayment(request, TOOL_RESOURCE_IDS, async (args) => {
 *     // Tool logic — only runs after payment is verified
 *     return { content: [{ type: 'text', text: 'Result here' }] }
 *   });
 * });
 * ```
 */
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Entitlement } from './mainlayer.js';
export interface ToolRequest {
    params: {
        name: string;
        arguments?: Record<string, unknown>;
    };
}
export type { CallToolResult };
/** Map of tool name → Mainlayer resource ID */
export type ResourceIdMap = Record<string, string>;
/** Handler function that receives validated args and the entitlement */
export type ToolHandler = (args: Record<string, unknown>, entitlement: Entitlement) => Promise<CallToolResult>;
/**
 * Wraps a tool handler with Mainlayer payment gating.
 *
 * 1. Extracts `payer_wallet` from the tool arguments.
 * 2. Looks up the resource ID for the tool by name.
 * 3. Calls `requirePayment` — throws if the agent hasn't paid.
 * 4. Passes validated args + entitlement info to the handler.
 *
 * @param request    The raw MCP CallTool request
 * @param resourceIds Map of tool name → resource ID (from your .env)
 * @param handler    Your tool implementation
 */
export declare function withPayment(request: ToolRequest, resourceIds: ResourceIdMap, handler: ToolHandler): Promise<CallToolResult>;
//# sourceMappingURL=middleware.d.ts.map