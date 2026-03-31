/**
 * tools/code-analyzer.ts
 *
 * PAID TOOL: analyze_code
 * Price: $0.05 per analysis
 *
 * Analyze source code for potential issues, security vulnerabilities, and improvements.
 * Demo returns mocked analysis — in production, integrate with:
 *   - Anthropic Claude API
 *   - OpenAI GPT-4
 *   - SonarQube API
 *   - CodeClimate API
 *   - Your custom analysis service
 *
 * Payment is verified upstream in index.ts via `withPayment`.
 */

import { CallToolResult } from '../middleware.js';
import { Entitlement } from '../mainlayer.js';

export const codeAnalyzerToolSchema = {
  name: 'analyze_code',
  description:
    'Analyze source code for security issues, performance problems, and best practice violations. ' +
    'Requires Mainlayer payment ($0.05/analysis).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      payer_wallet: {
        type: 'string',
        description: 'Your Mainlayer wallet address. Required for payment verification.',
      },
      code: {
        type: 'string',
        description: 'The source code to analyze. Can be TypeScript, Python, JavaScript, etc.',
      },
      language: {
        type: 'string',
        description: 'Programming language: "typescript", "python", "javascript", "go", "rust"',
        default: 'typescript',
      },
      focus: {
        type: 'string',
        description: 'Analysis focus: "security", "performance", "style", "all"',
        default: 'all',
      },
    },
    required: ['payer_wallet', 'code'],
  },
};

export async function handleCodeAnalyzerTool(
  args: Record<string, unknown>,
  _entitlement: Entitlement
): Promise<CallToolResult> {
  const code = args.code as string;
  const language = (args.language as string | undefined) ?? 'typescript';
  const focus = (args.focus as string | undefined) ?? 'all';

  // DEMO: mocked code analysis
  const analysis = getMockedCodeAnalysis(code, language, focus);

  const issuesText = analysis.issues
    .map(
      (issue, i) =>
        `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n   Line: ${issue.line}\n   Suggestion: ${issue.suggestion}`
    )
    .join('\n\n');

  return {
    content: [
      {
        type: 'text',
        text: [
          `[DEMO] Code Analysis Results for ${language}:`,
          '',
          `Focus: ${focus}`,
          `Total Issues Found: ${analysis.issues.length}`,
          '',
          issuesText,
          '',
          `Quality Score: ${analysis.score}/100`,
          '',
          '(This is demo analysis. Integrate with Claude API, GPT-4, SonarQube, or your service)',
        ].join('\n'),
      },
    ],
  };
}

interface CodeIssue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  title: string;
  suggestion: string;
}

interface CodeAnalysis {
  issues: CodeIssue[];
  score: number;
}

function getMockedCodeAnalysis(
  code: string,
  language: string,
  focus: string
): CodeAnalysis {
  // Deterministic analysis based on code length
  const codeLength = code.length;
  const lineCount = code.split('\n').length;

  // More complex code = more issues
  const issueCount = Math.max(1, Math.floor(codeLength / 100));

  const issues: CodeIssue[] = [];

  // Simulate finding different issue types
  if (focus === 'security' || focus === 'all') {
    issues.push({
      line: Math.max(1, Math.floor(lineCount * 0.3)),
      severity: 'error',
      title: 'Potential SQL Injection',
      suggestion: 'Use parameterized queries instead of string concatenation.',
    });
  }

  if (focus === 'performance' || focus === 'all') {
    issues.push({
      line: Math.max(1, Math.floor(lineCount * 0.5)),
      severity: 'warning',
      title: 'Inefficient Algorithm',
      suggestion: 'Consider using a Set or Map instead of Array.includes() for lookups.',
    });
  }

  if (focus === 'style' || focus === 'all') {
    issues.push({
      line: Math.max(1, Math.floor(lineCount * 0.7)),
      severity: 'info',
      title: 'Inconsistent Naming',
      suggestion: 'Use camelCase for variable names in ' + language,
    });
  }

  // Add more issues if code is long
  for (let i = 0; i < issueCount - issues.length; i++) {
    issues.push({
      line: Math.max(1, Math.floor(lineCount * Math.random())),
      severity: i % 2 === 0 ? 'warning' : 'info',
      title: 'Code Quality Issue #' + (i + 1),
      suggestion: 'Review and refactor this section for clarity.',
    });
  }

  // Score based on issue severity
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'error') score -= 20;
    else if (issue.severity === 'warning') score -= 10;
    else score -= 3;
  }

  return {
    issues: issues.slice(0, 10),
    score: Math.max(0, score),
  };
}
