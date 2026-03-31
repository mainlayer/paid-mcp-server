/**
 * examples/custom-tool.ts
 *
 * Step-by-step guide to adding your own paid tool to this MCP server.
 *
 * This file is NOT imported by the server — it's documentation you can
 * copy-paste and adapt. Each section is labeled with the files you need
 * to edit.
 *
 * ============================================================
 * STEP 1: Define your tool (src/tools/my-tool.ts)
 * ============================================================
 */

// ---------- src/tools/my-tool.ts ----------

import type { ToolResult } from '../src/middleware.js';
import type { Entitlement } from '../src/mainlayer.js';

/**
 * The schema tells the MCP client what your tool does and what parameters
 * it accepts. Every tool MUST include `payer_wallet` as a required property.
 */
export const myToolSchema = {
  name: 'my_tool',
  description:
    '[DEMO] A brief, clear description of what this tool does. ' +
    'Requires Mainlayer payment ($0.005/call). Pass your payer_wallet to authorize.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      // *** REQUIRED: Every paid tool must include payer_wallet ***
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      // Add your tool-specific parameters below:
      my_input: {
        type: 'string',
        description: 'The input for my tool.',
      },
    },
    required: ['payer_wallet', 'my_input'],
  },
};

/**
 * The handler contains your actual tool logic.
 * By the time this function is called, payment has already been verified.
 *
 * @param args         Validated tool arguments (includes payer_wallet)
 * @param entitlement  The Mainlayer entitlement — useful for logging/auditing
 */
export async function handleMyTool(
  args: Record<string, unknown>,
  entitlement: Entitlement
): Promise<ToolResult> {
  const myInput = args.my_input as string;

  // Your tool logic goes here.
  // You can use `entitlement.payerWallet` for per-customer logging.
  console.error(`Tool called by wallet: ${entitlement.payerWallet}`);

  const result = `Processed: ${myInput}`;

  return {
    content: [
      {
        type: 'text',
        text: result,
      },
    ],
  };
}

// ============================================================
// STEP 2: Register the resource in setup.ts
// ============================================================
//
// In src/setup.ts, add your tool to the RESOURCES_TO_CREATE array:
//
//   {
//     envKey: 'RESOURCE_ID_MY_TOOL',
//     name: 'my_tool',
//     displayName: 'My Tool',
//     description: 'What my tool does.',
//     price: 0.005,       // Price per call in USD
//     currency: 'USD',
//     category: 'custom',
//   },
//
// Then run:  npm run setup
// Copy the printed RESOURCE_ID_MY_TOOL=xxx into your .env file.

// ============================================================
// STEP 3: Add the resource ID to .env
// ============================================================
//
// After running setup, add to .env:
//   RESOURCE_ID_MY_TOOL=res_xxxx

// ============================================================
// STEP 4: Register the tool in src/index.ts
// ============================================================
//
// In src/index.ts, make three additions:
//
// A) Import your tool:
//    import { myToolSchema, handleMyTool } from './tools/my-tool.js';
//
// B) Add to TOOL_RESOURCE_IDS:
//    TOOL_RESOURCE_IDS = {
//      ...existing tools...
//      my_tool: process.env.RESOURCE_ID_MY_TOOL ?? '',
//    };
//
// C) Add to TOOL_HANDLERS:
//    TOOL_HANDLERS = {
//      ...existing tools...
//      my_tool: handleMyTool,
//    };
//
// D) Add to the ListTools response:
//    return {
//      tools: [weatherToolSchema, researchToolSchema, summaryToolSchema, myToolSchema],
//    };

// ============================================================
// STEP 5: Test your tool
// ============================================================
//
// Start the server:
//   npm start
//
// Test with the MCP inspector:
//   npx @modelcontextprotocol/inspector dist/index.js
//
// Example tool call payload:
//   {
//     "name": "my_tool",
//     "arguments": {
//       "payer_wallet": "your_wallet_address",
//       "my_input": "hello world"
//     }
//   }
//
// If payment is required, you'll receive a structured error like:
//
//   === PAYMENT REQUIRED ===
//   Tool: My Tool
//   Price: 0.0050 USD per call
//   Resource ID: res_xxxx
//
//   To pay, POST to: https://api.mainlayer.fr/payments
//   ...
//
// After payment, retry the same call and the tool will execute.

// ============================================================
// PRICING GUIDELINES
// ============================================================
//
// Choose a price that reflects the value and cost of your tool:
//
//   $0.001   Simple data lookups (weather, exchange rates)
//   $0.005   Search queries, enrichment APIs
//   $0.01    AI inference calls, complex computations
//   $0.05+   Premium operations (image generation, video, etc.)
//
// You can change prices at any time in the Mainlayer dashboard.
// Existing entitlements remain valid until they expire.

export {};
