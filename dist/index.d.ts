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
//# sourceMappingURL=index.d.ts.map