"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPayment = withPayment;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const mainlayer_js_1 = require("./mainlayer.js");
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
async function withPayment(request, resourceIds, handler) {
    const { name, arguments: rawArgs = {} } = request.params;
    const apiKey = process.env.MAINLAYER_API_KEY;
    if (!apiKey) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, 'Server misconfiguration: MAINLAYER_API_KEY is not set. ' +
            'Add your Mainlayer API key to the .env file.');
    }
    const resourceId = resourceIds[name];
    if (!resourceId) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: "${name}". No resource ID mapping found.`);
    }
    const payerWallet = rawArgs.payer_wallet;
    // Verify payment — throws McpError with instructions if not paid
    const entitlement = await (0, mainlayer_js_1.requirePayment)({
        resourceId,
        payerWallet: payerWallet ?? '',
        apiKey,
    });
    // Payment confirmed — run the actual tool logic
    return handler(rawArgs, entitlement);
}
//# sourceMappingURL=middleware.js.map