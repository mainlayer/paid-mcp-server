#!/usr/bin/env node
"use strict";
/**
 * index.ts — Paid MCP Server Entry Point
 *
 * This is the main server file. It:
 *   1. Creates an MCP server instance.
 *   2. Registers all paid tools with their schemas.
 *   3. Routes incoming tool calls through the payment gate.
 *   4. Delegates to the appropriate tool handler.
 *
 * To add your own paid tool, see examples/custom-tool.ts.
 *
 * Usage:
 *   npm start               # Run as MCP server (stdio transport)
 *   npm run dev             # Development mode with ts-node
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const middleware_js_1 = require("./middleware.js");
const weather_js_1 = require("./tools/weather.js");
const research_js_1 = require("./tools/research.js");
const summary_js_1 = require("./tools/summary.js");
// ---------------------------------------------------------------------------
// Resource ID mapping
//
// Maps each tool name to its Mainlayer resource ID.
// These IDs come from running `npm run setup` and copying the output into .env.
// ---------------------------------------------------------------------------
const TOOL_RESOURCE_IDS = {
    weather_current: process.env.RESOURCE_ID_WEATHER ?? '',
    web_search: process.env.RESOURCE_ID_SEARCH ?? '',
    ai_summary: process.env.RESOURCE_ID_SUMMARY ?? '',
};
// ---------------------------------------------------------------------------
// Tool handler registry
//
// Maps each tool name to its implementation function.
// When you add a new tool, register it here.
// ---------------------------------------------------------------------------
const TOOL_HANDLERS = {
    weather_current: weather_js_1.handleWeatherTool,
    web_search: research_js_1.handleResearchTool,
    ai_summary: summary_js_1.handleSummaryTool,
};
// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------
const server = new index_js_1.Server({
    name: 'paid-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// ---------------------------------------------------------------------------
// List tools handler
//
// Returns the schema for all available tools, including their `payer_wallet`
// parameter which every tool requires for payment verification.
// ---------------------------------------------------------------------------
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [weather_js_1.weatherToolSchema, research_js_1.researchToolSchema, summary_js_1.summaryToolSchema],
    };
});
// ---------------------------------------------------------------------------
// Call tool handler
//
// This is the main entry point for tool execution.
// Every call passes through `withPayment`, which:
//   1. Checks for a valid Mainlayer entitlement.
//   2. Throws a structured McpError with payment instructions if not paid.
//   3. Delegates to the tool handler if payment is verified.
// ---------------------------------------------------------------------------
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    const handler = TOOL_HANDLERS[name];
    if (!handler) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Tool not found: "${name}"`);
    }
    // Payment gate — all tools require Mainlayer payment
    return (0, middleware_js_1.withPayment)(request, TOOL_RESOURCE_IDS, handler);
});
// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function main() {
    validateEnvironment();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // Log to stderr so it doesn't interfere with the stdio MCP transport
    console.error('Paid MCP Server running. Awaiting tool calls...');
    console.error(`Registered tools: ${Object.keys(TOOL_HANDLERS).join(', ')}`);
}
/**
 * Warns about missing environment variables at startup.
 * The server still runs — individual tool calls will fail with clear errors
 * if the relevant variables are missing.
 */
function validateEnvironment() {
    if (!process.env.MAINLAYER_API_KEY) {
        console.error('[WARNING] MAINLAYER_API_KEY is not set. Tool calls will fail until this is configured.');
    }
    const missingResources = Object.entries(TOOL_RESOURCE_IDS)
        .filter(([, id]) => !id)
        .map(([tool]) => tool);
    if (missingResources.length > 0) {
        console.error(`[WARNING] Missing resource IDs for: ${missingResources.join(', ')}. ` +
            'Run `npm run setup` to register resources on Mainlayer.');
    }
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map