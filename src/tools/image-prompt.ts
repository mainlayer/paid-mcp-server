/**
 * tools/generate_image_prompt.ts
 *
 * PAID TOOL: generate_image_prompt
 * Price: $0.02 per call
 *
 * Generate optimized prompts for image generation models (DALL-E, Midjourney, Stable Diffusion).
 * Takes a rough idea and returns a detailed, artistic prompt with style recommendations.
 * Demo data is mocked — in production, integrate with Claude API or GPT-4.
 *
 * Payment is verified upstream in index.ts via `withPayment`.
 */

import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';

export const imagePromptToolSchema = {
  name: 'generate_image_prompt',
  description:
    'Generate optimized, detailed prompts for image generation models (DALL-E, Midjourney, Stable Diffusion). ' +
    'Requires Mainlayer payment ($0.02/call).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      idea: {
        type: 'string',
        description:
          'Your rough image idea. Example: "A futuristic city at sunset" or "A cat wearing a astronaut suit"',
      },
      style: {
        type: 'string',
        description:
          'Art style preference: "photorealistic", "oil-painting", "digital-art", "watercolor", "anime", "3d-render"',
        default: 'digital-art',
      },
      length: {
        type: 'string',
        description: 'Prompt length: "short" (50 words), "medium" (100 words), "long" (150+ words)',
        default: 'medium',
      },
    },
    required: ['payer_wallet', 'idea'],
  },
};

export async function handleImagePromptTool(
  args: Record<string, unknown>,
  _entitlement: Entitlement
): Promise<CallToolResult> {
  const idea = args.idea as string;
  const style = (args.style as string | undefined) ?? 'digital-art';
  const length = (args.length as string | undefined) ?? 'medium';

  // DEMO: generated prompt (mocked)
  const result = generateMockedImagePrompt(idea, style, length);

  return {
    content: [
      {
        type: 'text',
        text: [
          `[DEMO] Image Generation Prompt`,
          '',
          `Your idea: "${idea}"`,
          `Style: ${style}`,
          `Length: ${length}`,
          '',
          '=== OPTIMIZED PROMPT ===',
          '',
          result.prompt,
          '',
          '=== USAGE TIPS ===',
          result.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n'),
          '',
          '=== RECOMMENDED MODELS ===',
          result.recommendedModels.join('\n'),
          '',
          '(This is demo generation. Integrate with Claude API or GPT-4 for best results)',
        ].join('\n'),
      },
    ],
  };
}

interface GeneratedPrompt {
  prompt: string;
  tips: string[];
  recommendedModels: string[];
}

function generateMockedImagePrompt(idea: string, style: string, length: string): GeneratedPrompt {
  // Build a more detailed prompt based on inputs
  const styleDescriptions: Record<string, string> = {
    'photorealistic': 'ultra-realistic, 8k photo quality, sharp focus, professional lighting',
    'oil-painting': 'classic oil painting style, visible brushstrokes, warm color palette',
    'digital-art': 'stunning digital art, vibrant colors, modern aesthetic',
    'watercolor': 'soft watercolor painting, dreamy, pastel colors, fluid brushwork',
    'anime': 'anime art style, expressive eyes, vibrant colors, Japanese illustration',
    '3d-render': '3D render, cinema 4d quality, professional lighting, octane render',
  };

  const styleDesc = styleDescriptions[style] || 'beautiful digital art';

  // Generate prompt of appropriate length
  const wordCounts = {
    'short': 50,
    'medium': 100,
    'long': 150,
  };

  const targetWords = wordCounts[length as keyof typeof wordCounts] || 100;

  // Mock prompts with varying length
  let prompt = `${idea}. ${styleDesc}. `;

  // Add atmospheric and compositional details
  const compositionalElements = [
    'Masterpiece composition, balanced framing, rule of thirds.',
    'Dramatic lighting, volumetric rays, cinematic atmosphere.',
    'Rich detail, intricate textures, hyper-detailed.',
    'Soft ambient lighting, warm golden hour, romantic mood.',
    'High contrast, dramatic shadows, cinematic depth.',
    'Vibrant saturated colors, dynamic composition.',
  ];

  const seed = idea.length + style.length;
  for (let i = 0; i < Math.ceil(targetWords / 50); i++) {
    const idx = (seed + i) % compositionalElements.length;
    prompt += compositionalElements[idx] + ' ';
  }

  prompt = prompt.trim();

  return {
    prompt,
    tips: [
      `This prompt is optimized for ${style} style. Use it with DALL-E 3, Midjourney, or Stable Diffusion.`,
      'If the result needs adjustments, try adding: "more detailed", "better lighting", "higher quality"',
      `The ${length} length provides good detail without being overwhelming.`,
      'Specific art styles and techniques help models produce better results.',
    ],
    recommendedModels: [
      '• DALL-E 3 (best for coherent prompts)',
      '• Midjourney (best for artistic quality)',
      '• Stable Diffusion (fast, runs locally)',
      '• Adobe Firefly (good for web images)',
    ],
  };
}
