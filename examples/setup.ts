/**
 * examples/setup.ts
 *
 * Demonstrates what the `npm run setup` script does under the hood.
 *
 * This is purely educational — the real setup script is src/setup.ts.
 * Run `npm run setup` instead of this file.
 *
 * ============================================================
 * What "registering a resource" means
 * ============================================================
 *
 * A Mainlayer "resource" is a paywall entry that:
 *   - Has a name and description (shown to paying agents/users)
 *   - Has a price (e.g. $0.001 per call)
 *   - Gets a unique `resource_id` your server checks against
 *
 * When an agent wants to use your tool:
 *   1. They call the tool with their `payer_wallet`.
 *   2. Your server calls GET /entitlements/check.
 *   3. If they haven't paid, they get a 402 with payment instructions.
 *   4. They pay via POST /payments.
 *   5. They retry the tool call — now it works.
 *
 * ============================================================
 * Manual registration example
 * ============================================================
 */

import axios from 'axios';

async function registerResourceManually() {
  const apiKey = process.env.MAINLAYER_API_KEY!;

  // Create a resource on Mainlayer
  const { data: resource } = await axios.post(
    'https://api.mainlayer.fr/resources',
    {
      name: 'my_custom_tool',
      display_name: 'My Custom Tool',
      description: 'Does something valuable that agents want to pay for.',
      price: 0.005,
      currency: 'USD',
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('Resource created:', resource.id);
  // => Save resource.id as RESOURCE_ID_MY_CUSTOM_TOOL in .env
}

/**
 * ============================================================
 * Checking an entitlement manually
 * ============================================================
 *
 * This is what requirePayment() does internally.
 * You can call this directly if you want more control.
 */
async function checkEntitlementManually(resourceId: string, payerWallet: string) {
  const apiKey = process.env.MAINLAYER_API_KEY!;

  const { data } = await axios.get('https://api.mainlayer.fr/entitlements/check', {
    params: { resource_id: resourceId, payer_wallet: payerWallet },
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (data.hasAccess) {
    console.log('Access granted. Entitlement:', data.entitlement);
    return data.entitlement;
  } else {
    console.log('Access denied. Resource info:', data.resource);
    // data.resource.price tells you how much to charge the agent
    return null;
  }
}

// These functions are exported for documentation purposes
export { registerResourceManually, checkEntitlementManually };
