# paid-mcp-server

A production-ready MCP server template where each tool call requires payment via [Mainlayer](https://mainlayer.fr) — payment infrastructure for AI agents.

Use this as the starting point for monetizing your MCP tools. Every tool call passes through a payment gate — if the caller hasn't paid, they receive clear instructions on how to do so.

**High-virality template**: Perfect for AI marketplaces, prompt shops, and tool marketplaces where every API call is monetized.

---

## What this template does

AI agents use MCP servers to access tools. This template shows you how to **monetize those tools** using Mainlayer.

The flow:

1. An agent calls a tool (e.g. `search_web`) and provides their `payer_wallet`.
2. The server checks for a valid Mainlayer entitlement before running any logic.
3. If not paid: agent receives a structured error with price and payment instructions.
4. Agent pays via Mainlayer, then retries the same tool call.
5. Tool executes and returns its result.

This template includes 6 tools (4 paid, 2 free):

**Paid Tools**

| Tool | Description | Price |
|------|-------------|-------|
| `search_web` | Web search with structured results | $0.01/call |
| `analyze_code` | Analyze source code for issues | $0.05/analysis |
| `generate_image_prompt` | Generate optimized image generation prompts | $0.02/call |
| `summarize_url` | Summarize web content from URL | $0.03/call |

**Free Tools** (always available)

| Tool | Description |
|------|-------------|
| `hello` | Greeting endpoint (free demo) |
| `get_time` | Current server time (free demo) |
| `echo` | Echo tool for testing |

All demo tools use mocked data — replace implementations with real API calls for production.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [Mainlayer account](https://mainlayer.fr) with an API key

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/paid-mcp-server
cd paid-mcp-server
npm install
```

### 2. Configure your API key

```bash
cp .env.example .env
```

Open `.env` and set your Mainlayer API key:

```
MAINLAYER_API_KEY=ml_your_api_key_here
```

Get your API key from the [Mainlayer dashboard](https://dashboard.mainlayer.fr).

### 3. Register your tools on Mainlayer

This creates a "resource" for each tool — a paywall entry with a name and price.

```bash
npm run setup
```

The script will print resource IDs. Copy them into your `.env`:

```
RESOURCE_ID_WEATHER=res_xxxxxxxxxxxx
RESOURCE_ID_SEARCH=res_xxxxxxxxxxxx
RESOURCE_ID_SUMMARY=res_xxxxxxxxxxxx
```

### 4. Build and start the server

```bash
npm run build
npm start
```

The server runs over stdio, which is the standard MCP transport.

---

## Connecting to Claude Desktop

This server works as an MCP server for Claude Desktop. Add it to your config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "paid-tools": {
      "command": "node",
      "args": ["/absolute/path/to/paid-mcp-server/dist/index.js"],
      "env": {
        "MAINLAYER_API_KEY": "ml_your_api_key_here",
        "RESOURCE_ID_SEARCH_WEB": "res_xxxxxxxxxxxx",
        "RESOURCE_ID_ANALYZE_CODE": "res_xxxxxxxxxxxx",
        "RESOURCE_ID_GENERATE_IMAGE_PROMPT": "res_xxxxxxxxxxxx",
        "RESOURCE_ID_SUMMARIZE_URL": "res_xxxxxxxxxxxx"
      }
    }
  }
}
```

After restarting Claude Desktop, the tools will appear in the tool list. Free tools are always available; paid tools return a 402 error with payment instructions if not authorized.

### Example: Claude asks to search the web

Claude uses your payer wallet to call the tool:
```
Tool: search_web
Arguments: { "payer_wallet": "wallet_abc123", "query": "Claude AI" }
```

If not paid:
```
Error (402):
=== PAYMENT REQUIRED ===

Tool: Web Search
Price: 0.0100 USD per call
Resource ID: res_search_web

To pay, POST to: https://api.mainlayer.fr/payments
Authorization: Bearer <your_mainlayer_api_key>
Content-Type: application/json

{
  "resource_id": "res_search_web",
  "payer_wallet": "wallet_abc123"
}

After payment, retry your original tool call.
========================
```

Claude can handle this automatically or prompt you to pay.

---

## How agents pay

When an agent calls a tool without a valid entitlement, they receive a structured error message:

```
=== PAYMENT REQUIRED ===

Tool: Current Weather
Price: 0.0010 USD per call
Resource ID: res_xxxxxxxxxxxx

To pay, POST to: https://api.mainlayer.fr/payments
Authorization: Bearer <your_mainlayer_api_key>
Content-Type: application/json

{
  "resource_id": "res_xxxxxxxxxxxx",
  "payer_wallet": "<your_wallet_address>"
}

After payment, retry your original tool call with the same arguments.
========================
```

The agent (or a human) makes the payment via Mainlayer, then retries the tool call. No changes needed on the server side — the entitlement check passes automatically.

---

## Adding your own paid tool

### Step 1 — Create the tool file

Create `src/tools/my-tool.ts`:

```typescript
import type { ToolResult } from '../middleware.js';
import type { Entitlement } from '../mainlayer.js';

// Schema: what the tool does and what parameters it accepts
export const myToolSchema = {
  name: 'my_tool',
  description: 'What my tool does. Requires Mainlayer payment ($0.005/call).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      // Every tool must include payer_wallet
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      my_input: {
        type: 'string',
        description: 'Input for my tool.',
      },
    },
    required: ['payer_wallet', 'my_input'],
  },
};

// Handler: runs only after payment is verified
export async function handleMyTool(
  args: Record<string, unknown>,
  _entitlement: Entitlement
): Promise<ToolResult> {
  const myInput = args.my_input as string;

  // Your tool logic here
  const result = `Processed: ${myInput}`;

  return {
    content: [{ type: 'text', text: result }],
  };
}
```

### Step 2 — Register the resource in `src/setup.ts`

Add to the `RESOURCES_TO_CREATE` array:

```typescript
{
  envKey: 'RESOURCE_ID_MY_TOOL',
  name: 'my_tool',
  displayName: 'My Tool',
  description: 'What my tool does.',
  price: 0.005,
  currency: 'USD',
},
```

Run setup again: `npm run setup` — copy the new resource ID into `.env`.

### Step 3 — Register in `src/index.ts`

```typescript
// Add import
import { myToolSchema, handleMyTool } from './tools/my-tool.js';

// Add to TOOL_RESOURCE_IDS
const TOOL_RESOURCE_IDS = {
  // ...existing
  my_tool: process.env.RESOURCE_ID_MY_TOOL ?? '',
};

// Add to TOOL_HANDLERS
const TOOL_HANDLERS = {
  // ...existing
  my_tool: handleMyTool,
};

// Add to ListTools response
return {
  tools: [...existing, myToolSchema],
};
```

### Step 4 — Rebuild and restart

```bash
npm run build && npm start
```

That's it. Your new tool is live and paywalled.

---

## Project structure

```
paid-mcp-server/
├── src/
│   ├── index.ts          # Server entry point + tool registration
│   ├── mainlayer.ts      # Mainlayer entitlement checking
│   ├── middleware.ts      # withPayment() — the payment gate
│   ├── setup.ts          # One-time resource registration script
│   └── tools/
│       ├── weather.ts    # Demo: weather tool ($0.001/call)
│       ├── research.ts   # Demo: web search tool ($0.005/call)
│       └── summary.ts    # Demo: AI summary tool ($0.01/call)
├── examples/
│   ├── custom-tool.ts    # Annotated guide to adding your own tool
│   └── setup.ts          # What setup does under the hood
├── .env.example          # Environment variable template
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

---

## Deployment

### Quick deployment to Railway

Deploy in 2 minutes without writing deployment config:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Set environment variables
railway variables set MAINLAYER_API_KEY=ml_your_key_here

# 5. Deploy
railway up
```

Visit your Railway project dashboard to see the deployed URL.

### Quick deployment to Fly.io

```bash
# 1. Install and login
curl -L https://fly.io/install.sh | sh
flyctl auth login

# 2. Launch new app
flyctl launch --name my-paid-mcp-server

# 3. Set secrets
flyctl secrets set MAINLAYER_API_KEY=ml_your_key_here

# 4. Deploy
flyctl deploy
```

Your server will be live at `https://my-paid-mcp-server.fly.dev`.

### Docker (local or self-hosted)

```bash
# 1. Copy and fill in your .env
cp .env.example .env

# 2. Build and run
docker-compose up --build

# 3. Server runs on http://localhost:3000
```

### Manual VPS deployment

```bash
# On your VPS (Ubuntu/Debian):
sudo apt-get update && sudo apt-get install -y nodejs npm

# Clone repo and install
git clone https://github.com/your-org/paid-mcp-server.git
cd paid-mcp-server
npm install

# Set environment
export MAINLAYER_API_KEY=ml_your_key_here
npm run setup  # Register resources on Mainlayer

# Build and run (with PM2 for background process)
npm run build
npm install -g pm2
pm2 start dist/index.js --name "paid-mcp-server"
pm2 startup && pm2 save

# Server will automatically restart on reboot
```

---

## Development

```bash
# Run in development mode (no build step)
npm run dev

# Type check
npm run typecheck

# Build
npm run build
```

---

## Pricing guidelines

| Price | Suitable for |
|-------|-------------|
| $0.001 | Simple lookups (weather, exchange rates) |
| $0.005 | Search queries, data enrichment |
| $0.01 | AI inference, complex computations |
| $0.05+ | Premium operations (image generation, video) |

You can update prices at any time in the [Mainlayer dashboard](https://dashboard.mainlayer.fr). Existing entitlements remain valid until they expire.

---

## Key files to understand

- **`src/mainlayer.ts`** — The `requirePayment()` function. Calls `GET /entitlements/check` and throws a structured `McpError` if payment is needed.
- **`src/middleware.ts`** — The `withPayment()` wrapper. Extracts `payer_wallet` from args, looks up the resource ID, and calls `requirePayment`.
- **`src/index.ts`** — Wires everything together. Add your tools here.

---

## Support

- Mainlayer docs: [https://docs.mainlayer.fr](https://docs.mainlayer.fr)
- MCP specification: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
