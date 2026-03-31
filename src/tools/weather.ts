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

// ---------------------------------------------------------------------------
// Tool schema definition (used when registering with MCP server)
// ---------------------------------------------------------------------------

export const weatherToolSchema = {
  name: 'weather_current',
  description:
    '[DEMO] Get the current weather for a city. ' +
    'Requires Mainlayer payment ($0.001/call). Pass your payer_wallet to authorize.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      city: {
        type: 'string',
        description: 'The name of the city, e.g. "San Francisco" or "London".',
      },
      units: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature units. Defaults to "celsius".',
        default: 'celsius',
      },
    },
    required: ['payer_wallet', 'city'],
  },
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function handleWeatherTool(
  args: Record<string, unknown>,
  _entitlement: Entitlement
): Promise<CallToolResult> {
  const city = args.city as string;
  const units = (args.units as string | undefined) ?? 'celsius';

  // DEMO: mocked weather data
  // Replace this with a real weather API call in production.
  const weather = getMockedWeather(city, units);

  return {
    content: [
      {
        type: 'text',
        text: [
          `[DEMO] Current weather in ${weather.city}:`,
          '',
          `  Temperature:  ${weather.temperature}°${units === 'celsius' ? 'C' : 'F'}`,
          `  Condition:    ${weather.condition}`,
          `  Humidity:     ${weather.humidity}%`,
          `  Wind:         ${weather.windSpeed} km/h ${weather.windDirection}`,
          `  Feels like:   ${weather.feelsLike}°${units === 'celsius' ? 'C' : 'F'}`,
          '',
          '(This is demo data. Replace getMockedWeather() with a real API call.)',
        ].join('\n'),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Mock data (replace with real API in production)
// ---------------------------------------------------------------------------

interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
}

function getMockedWeather(city: string, units: string): WeatherData {
  // Deterministic fake data based on city name so demos look reasonable
  const seed = city.length + city.charCodeAt(0);
  const baseTempC = 10 + (seed % 25);
  const temperature = units === 'celsius' ? baseTempC : Math.round(baseTempC * 1.8 + 32);
  const feelsLike = units === 'celsius' ? baseTempC - 2 : Math.round((baseTempC - 2) * 1.8 + 32);

  const conditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Clear'];
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return {
    city: city.charAt(0).toUpperCase() + city.slice(1),
    temperature,
    feelsLike,
    condition: conditions[seed % conditions.length],
    humidity: 40 + (seed % 50),
    windSpeed: 5 + (seed % 30),
    windDirection: directions[seed % directions.length],
  };
}
