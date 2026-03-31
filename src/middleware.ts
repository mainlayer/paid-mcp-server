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

import { McpError, ErrorCode, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { requirePayment, Entitlement } from './mainlayer.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolRequest {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

// Re-export the SDK's CallToolResult so tool files can import from one place
export type { CallToolResult };

/** Map of tool name → Mainlayer resource ID */
export type ResourceIdMap = Record<string, string>;

/** Handler function that receives validated args and the entitlement */
export type ToolHandler = (
  args: Record<string, unknown>,
  entitlement: Entitlement
) => Promise<CallToolResult>;

// ---------------------------------------------------------------------------
// withPayment middleware
// ---------------------------------------------------------------------------

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
export async function withPayment(
  request: ToolRequest,
  resourceIds: ResourceIdMap,
  handler: ToolHandler
): Promise<CallToolResult> {
  const { name, arguments: rawArgs = {} } = request.params;
  const apiKey = process.env.MAINLAYER_API_KEY;

  if (!apiKey) {
    throw new McpError(
      ErrorCode.InternalError,
      'Server misconfiguration: MAINLAYER_API_KEY is not set. ' +
      'Add your Mainlayer API key to the .env file.'
    );
  }

  const resourceId = resourceIds[name];
  if (!resourceId) {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: "${name}". No resource ID mapping found.`
    );
  }

  const payerWallet = rawArgs.payer_wallet as string | undefined;

  // Verify payment — throws McpError with instructions if not paid
  const entitlement = await requirePayment({
    resourceId,
    payerWallet: payerWallet ?? '',
    apiKey,
  });

  // Payment confirmed — run the actual tool logic
  return handler(rawArgs, entitlement);
}
