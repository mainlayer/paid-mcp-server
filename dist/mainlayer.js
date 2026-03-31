"use strict";
/**
 * mainlayer.ts
 *
 * Integration with the Mainlayer payment API.
 * Mainlayer is payment infrastructure for AI agents — think "Stripe for AI".
 *
 * Core concept:
 *   - A "resource" is a paywalled API/tool registered on Mainlayer with a price.
 *   - An "entitlement" is proof that a payer has purchased access to a resource.
 *   - Before running any tool, we check for a valid entitlement via the API.
 *   - If no entitlement exists, we throw an error with everything the agent
 *     needs to complete payment and retry.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequiredError = void 0;
exports.requirePayment = requirePayment;
const axios_1 = __importDefault(require("axios"));
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const MAINLAYER_API_BASE = 'https://api.mainlayer.fr';
// ---------------------------------------------------------------------------
// Payment requirement error
// ---------------------------------------------------------------------------
/**
 * Thrown when a tool is called without a valid entitlement.
 * The error message is structured so an AI agent can parse it and take action.
 */
class PaymentRequiredError extends Error {
    details;
    constructor(details) {
        super(`Payment required to use this tool.\n\n` +
            `Resource: ${details.resourceName}\n` +
            `Price: ${details.currency} ${details.price.toFixed(4)}\n` +
            `Resource ID: ${details.resourceId}\n\n` +
            `To pay, POST to: ${details.payEndpoint}\n` +
            `Body: { "resource_id": "${details.resourceId}", "payer_wallet": "<your_wallet>" }\n\n` +
            `After payment, retry your original tool call.`);
        this.name = 'PaymentRequiredError';
        this.details = details;
    }
}
exports.PaymentRequiredError = PaymentRequiredError;
// ---------------------------------------------------------------------------
// Core function: requirePayment
// ---------------------------------------------------------------------------
/**
 * Checks whether the calling agent has a valid entitlement for a resource.
 *
 * - If access is granted, returns the entitlement and continues execution.
 * - If access is denied, throws an McpError containing structured payment
 *   instructions so the agent (or user) knows exactly how to pay and retry.
 *
 * @example
 * ```typescript
 * const entitlement = await requirePayment({
 *   resourceId: process.env.RESOURCE_ID_WEATHER!,
 *   payerWallet: args.payer_wallet,
 *   apiKey: process.env.MAINLAYER_API_KEY!,
 * });
 * // If we reach here, payment is confirmed — run tool logic.
 * ```
 */
async function requirePayment(options) {
    const { resourceId, payerWallet, apiKey } = options;
    if (!resourceId) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, 'Server misconfiguration: resource ID is not set. ' +
            'Run `npm run setup` to register resources on Mainlayer, then update your .env.');
    }
    if (!payerWallet) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Missing required parameter: `payer_wallet`. ' +
            'Provide your Mainlayer wallet address to use this tool.');
    }
    let response;
    try {
        const { data } = await axios_1.default.get(`${MAINLAYER_API_BASE}/entitlements/check`, {
            params: {
                resource_id: resourceId,
                payer_wallet: payerWallet,
            },
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 10_000,
        });
        response = data;
    }
    catch (err) {
        const axiosErr = err;
        if (axiosErr.response?.status === 402) {
            // 402 Payment Required — Mainlayer returned structured payment info
            const body = axiosErr.response.data;
            const resource = body.resource;
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, buildPaymentRequiredMessage({
                resourceId,
                resourceName: resource?.name ?? 'Unknown resource',
                price: resource?.price ?? 0,
                currency: resource?.currency ?? 'USD',
                payEndpoint: `${MAINLAYER_API_BASE}/payments`,
                instructions: 'Pay via the Mainlayer API, then retry this tool call with the same parameters.',
            }));
        }
        if (axiosErr.response?.status === 401) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, 'Mainlayer API key is invalid or missing. Check your MAINLAYER_API_KEY environment variable.');
        }
        // Network or unexpected error
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Mainlayer entitlement check failed: ${axiosErr.message}. Please try again.`);
    }
    if (!response.hasAccess || !response.entitlement) {
        // API returned 200 but access was denied
        const resource = response.resource;
        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, buildPaymentRequiredMessage({
            resourceId,
            resourceName: resource?.name ?? 'Unknown resource',
            price: resource?.price ?? 0,
            currency: resource?.currency ?? 'USD',
            payEndpoint: `${MAINLAYER_API_BASE}/payments`,
            instructions: 'Pay via the Mainlayer API, then retry this tool call with the same parameters.',
        }));
    }
    return response.entitlement;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Builds a structured, human- and agent-readable payment error message.
 * The format is intentionally easy to parse — an AI agent reading this
 * message should know exactly what endpoint to call and with what payload.
 */
function buildPaymentRequiredMessage(details) {
    return [
        '=== PAYMENT REQUIRED ===',
        '',
        `Tool: ${details.resourceName}`,
        `Price: ${details.price.toFixed(4)} ${details.currency} per call`,
        `Resource ID: ${details.resourceId}`,
        '',
        'To gain access, pay with Mainlayer:',
        '',
        `  POST ${details.payEndpoint}`,
        `  Authorization: Bearer <your_mainlayer_api_key>`,
        `  Content-Type: application/json`,
        '',
        '  {',
        `    "resource_id": "${details.resourceId}",`,
        `    "payer_wallet": "<your_wallet_address>"`,
        '  }',
        '',
        'After payment, retry your original tool call with the same arguments.',
        '========================',
    ].join('\n');
}
//# sourceMappingURL=mainlayer.js.map