#!/usr/bin/env node
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

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { withPayment } from './middleware.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// PAID TOOLS
import { weatherToolSchema, handleWeatherTool } from './tools/weather.js';
import { searchToolSchema, handleSearchTool } from './tools/search.js';
import { codeAnalyzerToolSchema, handleCodeAnalyzerTool } from './tools/code-analyzer.js';
import { imagePromptToolSchema, handleImagePromptTool } from './tools/image-prompt.js';
import { urlSummaryToolSchema, handleUrlSummaryTool } from './tools/url-summary.ts';

// FREE TOOLS
import {
  helloToolSchema,
  handleHelloTool,
  getTimeToolSchema,
  handleGetTimeTool,
  echoToolSchema,
  handleEchoTool,
} from './tools/free-tools.js';

// ---------------------------------------------------------------------------
// Paid tool resource ID mapping
//
// Maps each PAID tool name to its Mainlayer resource ID.
// These IDs come from running `npm run setup` and copying the output into .env.
// Free tools don't need resource IDs.
// ---------------------------------------------------------------------------

const PAID_TOOL_RESOURCE_IDS: Record<string, string> = {
  weather_current: process.env.RESOURCE_ID_WEATHER ?? '',
  search_web: process.env.RESOURCE_ID_SEARCH_WEB ?? '',
  analyze_code: process.env.RESOURCE_ID_ANALYZE_CODE ?? '',
  generate_image_prompt: process.env.RESOURCE_ID_GENERATE_IMAGE_PROMPT ?? '',
  summarize_url: process.env.RESOURCE_ID_SUMMARIZE_URL ?? '',
};

// ---------------------------------------------------------------------------
// Tool handler registry
//
// Paid tools: require `withPayment` wrapper
// Free tools: called directly
// ---------------------------------------------------------------------------

const PAID_TOOL_HANDLERS: Record<string, typeof handleWeatherTool> = {
  weather_current: handleWeatherTool,
  search_web: handleSearchTool,
  analyze_code: handleCodeAnalyzerTool,
  generate_image_prompt: handleImagePromptTool,
  summarize_url: handleUrlSummaryTool,
};

const FREE_TOOL_HANDLERS: Record<string, typeof handleHelloTool> = {
  hello: handleHelloTool,
  get_time: handleGetTimeTool,
  echo: handleEchoTool,
};

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: 'paid-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ---------------------------------------------------------------------------
// List tools handler
//
// Returns the schema for all available tools, including their `payer_wallet`
// parameter which every tool requires for payment verification.
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Return all tools: paid and free
  return {
    tools: [
      // Paid tools
      weatherToolSchema,
      searchToolSchema,
      codeAnalyzerToolSchema,
      imagePromptToolSchema,
      urlSummaryToolSchema,
      // Free tools
      helloToolSchema,
      getTimeToolSchema,
      echoToolSchema,
    ],
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs = {} } = request.params;

  // Check if it's a free tool (no payment required)
  const freeHandler = FREE_TOOL_HANDLERS[name];
  if (freeHandler) {
    return freeHandler(rawArgs);
  }

  // Check if it's a paid tool (requires Mainlayer payment)
  const paidHandler = PAID_TOOL_HANDLERS[name];
  if (!paidHandler) {
    throw new McpError(ErrorCode.MethodNotFound, `Tool not found: "${name}"`);
  }

  // Payment gate — paid tools require Mainlayer entitlement
  return withPayment(request, PAID_TOOL_RESOURCE_IDS, paidHandler);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  validateEnvironment();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with the stdio MCP transport
  console.error('Paid MCP Server running. Awaiting tool calls...');
  console.error(`Free tools: ${Object.keys(FREE_TOOL_HANDLERS).join(', ')}`);
  console.error(`Paid tools: ${Object.keys(PAID_TOOL_HANDLERS).join(', ')}`);
}

/**
 * Warns about missing environment variables at startup.
 * The server still runs — free tools always work, paid tools will fail with clear payment errors
 * if the relevant variables are missing.
 */
function validateEnvironment() {
  if (!process.env.MAINLAYER_API_KEY) {
    console.error(
      '[WARNING] MAINLAYER_API_KEY is not set. Paid tools will fail with clear payment instructions.'
    );
  }

  const missingResources = Object.entries(PAID_TOOL_RESOURCE_IDS)
    .filter(([, id]) => !id)
    .map(([tool]) => tool);

  if (missingResources.length > 0) {
    console.error(
      `[WARNING] Missing resource IDs for paid tools: ${missingResources.join(', ')}. ` +
      'Run `npm run setup` to register resources on Mainlayer.'
    );
  }

  console.error('[INFO] Free tools (hello, get_time, echo) work without setup.');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
