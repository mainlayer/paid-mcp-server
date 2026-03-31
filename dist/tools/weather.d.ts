/**
 * tools/weather.ts
 *
 * DEMO TOOL: weather_current
 * Price: $0.001 per call
 *
 * Returns the current weather for a given city.
 * The data in this demo is mocked — in production you would replace
 * the `fetchWeather` function with a real weather API call (e.g. OpenWeatherMap).
 *
 * Mainlayer payment is handled upstream in index.ts via `withPayment`.
 * By the time `handleWeatherTool` is called, payment has already been verified.
 */
import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';
export declare const weatherToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            payer_wallet: {
                type: string;
                description: string;
            };
            city: {
                type: string;
                description: string;
            };
            units: {
                type: string;
                enum: string[];
                description: string;
                default: string;
            };
        };
        required: string[];
    };
};
export declare function handleWeatherTool(args: Record<string, unknown>, _entitlement: Entitlement): Promise<CallToolResult>;
//# sourceMappingURL=weather.d.ts.map