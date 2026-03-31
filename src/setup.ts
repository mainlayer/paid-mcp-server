#!/usr/bin/env ts-node
/**
 * setup.ts
 *
 * Run this once to register your tools as paid resources on Mainlayer.
 *
 * What it does:
 *   1. Reads your MAINLAYER_API_KEY from .env.
 *   2. Calls the Mainlayer API to create a "resource" for each tool.
 *   3. Prints the resource IDs — copy these into your .env file.
 *
 * Usage:
 *   npm run setup
 *
 * Prerequisites:
 *   - A Mainlayer account (https://mainlayer.fr)
 *   - MAINLAYER_API_KEY set in .env
 */

import 'dotenv/config';
import axios, { AxiosError } from 'axios';

const MAINLAYER_API_BASE = 'https://api.mainlayer.fr';

// ---------------------------------------------------------------------------
// Resource definitions
//
// This array defines the tools you want to monetize.
// Customize the name, description, and price for each tool.
// You can add entries here when you add new tools.
// ---------------------------------------------------------------------------

const RESOURCES_TO_CREATE = [
  // Paid tools for this MCP server
  {
    envKey: 'RESOURCE_ID_WEATHER',
    name: 'weather_current',
    displayName: 'Current Weather',
    description: 'Get the current weather for any city. Returns temperature, conditions, humidity, and wind.',
    price: 0.001,
    currency: 'USD',
    category: 'data',
  },
  {
    envKey: 'RESOURCE_ID_SEARCH_WEB',
    name: 'search_web',
    displayName: 'Web Search',
    description: 'Search the web and receive structured results with titles, URLs, and snippets.',
    price: 0.01,
    currency: 'USD',
    category: 'search',
  },
  {
    envKey: 'RESOURCE_ID_ANALYZE_CODE',
    name: 'analyze_code',
    displayName: 'Code Analysis',
    description: 'Analyze source code for security issues, performance problems, and best practice violations.',
    price: 0.05,
    currency: 'USD',
    category: 'development',
  },
  {
    envKey: 'RESOURCE_ID_GENERATE_IMAGE_PROMPT',
    name: 'generate_image_prompt',
    displayName: 'Image Prompt Generator',
    description: 'Generate optimized prompts for image generation models (DALL-E, Midjourney, Stable Diffusion).',
    price: 0.02,
    currency: 'USD',
    category: 'ai',
  },
  {
    envKey: 'RESOURCE_ID_SUMMARIZE_URL',
    name: 'summarize_url',
    displayName: 'URL Summarizer',
    description: 'Fetch and summarize content from a web URL with metadata and readability score.',
    price: 0.03,
    currency: 'USD',
    category: 'content',
  },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreateResourcePayload {
  name: string;
  display_name: string;
  description: string;
  price: number;
  currency: string;
  category?: string;
}

interface CreatedResource {
  id: string;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Main setup function
// ---------------------------------------------------------------------------

async function setup() {
  console.log('=== Mainlayer Resource Setup ===\n');

  const apiKey = process.env.MAINLAYER_API_KEY;
  if (!apiKey || apiKey === 'ml_your_api_key_here') {
    console.error('ERROR: MAINLAYER_API_KEY is not set.');
    console.error('');
    console.error('Steps to fix:');
    console.error('  1. Copy .env.example to .env');
    console.error('  2. Get your API key at https://dashboard.mainlayer.fr');
    console.error('  3. Set MAINLAYER_API_KEY=ml_your_key in .env');
    console.error('  4. Re-run: npm run setup');
    process.exit(1);
  }

  console.log('API key found. Registering resources on Mainlayer...\n');

  const results: Array<{ envKey: string; resourceId: string; name: string }> = [];
  let hasErrors = false;

  for (const resource of RESOURCES_TO_CREATE) {
    process.stdout.write(`  Creating "${resource.displayName}" at $${resource.price.toFixed(4)}/call... `);

    try {
      const payload: CreateResourcePayload = {
        name: resource.name,
        display_name: resource.displayName,
        description: resource.description,
        price: resource.price,
        currency: resource.currency,
        category: resource.category,
      };

      const { data } = await axios.post<CreatedResource>(
        `${MAINLAYER_API_BASE}/resources`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15_000,
        }
      );

      console.log(`OK  (ID: ${data.id})`);
      results.push({ envKey: resource.envKey, resourceId: data.id, name: resource.displayName });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
      hasErrors = true;

      if (axiosErr.response?.status === 409) {
        // Resource already exists — fetch the existing one
        console.log('SKIPPED (already exists)');
        try {
          const { data } = await axios.get<{ resources: CreatedResource[] }>(
            `${MAINLAYER_API_BASE}/resources`,
            {
              params: { name: resource.name },
              headers: { Authorization: `Bearer ${apiKey}` },
              timeout: 15_000,
            }
          );
          const existing = data.resources.find((r) => r.name === resource.name);
          if (existing) {
            results.push({ envKey: resource.envKey, resourceId: existing.id, name: resource.displayName });
            hasErrors = false;
          }
        } catch {
          console.error(`         Could not retrieve existing resource for "${resource.name}".`);
        }
      } else if (axiosErr.response?.status === 401) {
        console.error('FAILED (invalid API key)');
        console.error('\nYour MAINLAYER_API_KEY appears to be invalid.');
        console.error('Get a valid key at: https://dashboard.mainlayer.fr');
        process.exit(1);
      } else {
        const message =
          axiosErr.response?.data?.error ??
          axiosErr.response?.data?.message ??
          axiosErr.message;
        console.error(`FAILED (${message})`);
      }
    }
  }

  if (results.length === 0) {
    console.error('\nNo resources were created. Check the errors above and try again.');
    process.exit(1);
  }

  // Print the .env additions
  console.log('\n=== Copy these into your .env file ===\n');
  for (const result of results) {
    console.log(`${result.envKey}=${result.resourceId}`);
  }

  console.log('\n=== Setup complete! ===\n');
  console.log('Next steps:');
  console.log('  1. Copy the resource IDs above into your .env file.');
  console.log('  2. Start the server: npm start');
  console.log('  3. Connect with your MCP client.');

  if (hasErrors) {
    console.log('\nSome resources failed to create — check the messages above.');
    process.exit(1);
  }
}

setup().catch((err) => {
  console.error('\nUnexpected error during setup:', err.message);
  process.exit(1);
});
