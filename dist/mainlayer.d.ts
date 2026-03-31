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
export interface EntitlementCheckOptions {
    /** The Mainlayer resource ID for this tool (from your .env). */
    resourceId: string;
    /** The wallet address / payer identity of the caller. */
    payerWallet: string;
    /** Your Mainlayer vendor API key. */
    apiKey: string;
}
export interface Entitlement {
    id: string;
    resourceId: string;
    payerWallet: string;
    status: 'active' | 'expired' | 'pending';
    expiresAt: string | null;
    createdAt: string;
}
export interface EntitlementCheckResponse {
    hasAccess: boolean;
    entitlement?: Entitlement;
    resource?: {
        id: string;
        name: string;
        price: number;
        currency: string;
        description: string;
    };
}
export interface PaymentRequiredDetails {
    resourceId: string;
    resourceName: string;
    price: number;
    currency: string;
    payEndpoint: string;
    instructions: string;
}
/**
 * Thrown when a tool is called without a valid entitlement.
 * The error message is structured so an AI agent can parse it and take action.
 */
export declare class PaymentRequiredError extends Error {
    readonly details: PaymentRequiredDetails;
    constructor(details: PaymentRequiredDetails);
}
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
export declare function requirePayment(options: EntitlementCheckOptions): Promise<Entitlement>;
//# sourceMappingURL=mainlayer.d.ts.map