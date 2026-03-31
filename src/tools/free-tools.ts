/**
 * tools/free-tools.ts
 *
 * FREE TOOLS (no payment required)
 *
 * These tools are always available and demonstrate free MCP tools alongside paid ones.
 */

import { CallToolResult } from '../middleware.js';

// ============================================================================
// HELLO TOOL (Free greeting endpoint)
// ============================================================================

export const helloToolSchema = {
  name: 'hello',
  description: 'A simple free greeting tool. No payment required.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      name: {
        type: 'string',
        description: 'The name to greet. Defaults to "Agent".',
      },
    },
    required: [],
  },
};

export async function handleHelloTool(args: Record<string, unknown>): Promise<CallToolResult> {
  const name = (args.name as string | undefined) ?? 'Agent';

  return {
    content: [
      {
        type: 'text',
        text: `Hello, ${name}! This is a free tool. No payment required. Try the paid tools to see how Mainlayer payment gates work.`,
      },
    ],
  };
}

// ============================================================================
// GET_TIME TOOL (Free current time endpoint)
// ============================================================================

export const getTimeToolSchema = {
  name: 'get_time',
  description: 'Get the current server time. No payment required. Always free.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timezone: {
        type: 'string',
        description: 'Timezone for the time output. Format: "America/New_York", "Europe/London", "Asia/Tokyo"',
        default: 'UTC',
      },
    },
    required: [],
  },
};

export async function handleGetTimeTool(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const timezone = (args.timezone as string | undefined) ?? 'UTC';

  const now = new Date();
  const timeString = timezone === 'UTC'
    ? now.toISOString()
    : new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now);

  return {
    content: [
      {
        type: 'text',
        text: [
          'Current Server Time (Free Tool)',
          '',
          `Timezone: ${timezone}`,
          `Time: ${timeString}`,
          `Unix Timestamp: ${Math.floor(now.getTime() / 1000)}`,
        ].join('\n'),
      },
    ],
  };
}

// ============================================================================
// ECHO TOOL (Free echo for testing)
// ============================================================================

export const echoToolSchema = {
  name: 'echo',
  description: 'Echo back your input. Free tool useful for testing.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      message: {
        type: 'string',
        description: 'The message to echo back.',
      },
    },
    required: ['message'],
  },
};

export async function handleEchoTool(args: Record<string, unknown>): Promise<CallToolResult> {
  const message = args.message as string;

  return {
    content: [
      {
        type: 'text',
        text: [
          'Echo (Free Tool)',
          '',
          `You said: "${message}"`,
          '',
          'This tool echoes your input back to you.',
          'It demonstrates a free tool alongside paid ones.',
          'Try calling paid tools to see the payment flow.',
        ].join('\n'),
      },
    ],
  };
}
