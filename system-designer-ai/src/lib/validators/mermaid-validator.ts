import { MermaidValidationResult } from '@/types/asset';
import mermaid from 'mermaid';

// Initialize mermaid with default config
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'default'
});

const MERMAID_DIAGRAM_TYPES = [
  'graph',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram-v2',
  'erDiagram',
  'gantt',
  'pie',
  'flowchart',
  'timeline'
];

const MERMAID_SYNTAX_PATTERNS = {
  graph: /^graph\s+(TD|LR|RL|DU|UD)\s*$/m,
  sequence: /^sequenceDiagram\s*$/m,
  class: /^classDiagram\s*$/m,
  state: /^stateDiagram-v2\s*$/m,
  er: /^erDiagram\s*$/m,
  gantt: /^gantt\s*$/m,
  pie: /^pie\s*$/m,
  flowchart: /^flowchart\s+(TD|LR|RL|DU|UD)\s*$/m,
  timeline: /^timeline\s*$/m
};

/**
 * Validates a Mermaid diagram for correct syntax and structure
 * @param content The Mermaid diagram content to validate
 * @returns Validation result with any errors or warnings
 */
export async function validateMermaidDiagram(content: string): Promise<MermaidValidationResult> {
  const result: MermaidValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  console.log('\n=== Mermaid Diagram Validation ===');
  console.log('Content:', content);

  // Check if content is empty
  if (!content.trim()) {
    result.isValid = false;
    result.errors?.push('Diagram content is empty');
    console.log('Validation failed: Empty content');
    return result;
  }

  try {
    // Basic syntax validation
    const lines = content.split('\n');
    let hasContent = false;
    let hasConnections = false;
    let hasValidType = false;

    // Check for valid diagram type
    for (const [type, pattern] of Object.entries(MERMAID_SYNTAX_PATTERNS)) {
      if (pattern.test(content)) {
        hasValidType = true;
        break;
      }
    }

    if (!hasValidType) {
      result.isValid = false;
      result.errors?.push('Invalid diagram type. Must start with one of: ' + MERMAID_DIAGRAM_TYPES.join(', '));
      console.log('Validation failed: Invalid diagram type');
      return result;
    }

    // Check for content and connections
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('%')) continue;
      
      hasContent = true;
      
      // Check for basic connection syntax including labeled connections
      if (
        trimmedLine.includes('-->') || 
        trimmedLine.includes('--') || 
        trimmedLine.includes('->') ||
        trimmedLine.includes('-->|') ||  // Labeled connections
        trimmedLine.includes('--|') ||    // Labeled connections
        trimmedLine.includes('->|')       // Labeled connections
      ) {
        hasConnections = true;
        console.log('Found connection in line:', trimmedLine);
      }
    }

    if (!hasContent) {
      result.isValid = false;
      result.errors?.push('Diagram has no content');
      console.log('Validation failed: No content');
    }

    if (!hasConnections && !content.includes('pie') && !content.includes('gantt')) {
      result.warnings?.push('Diagram has no connections between elements');
      console.log('Warning: No connections found');
    }

    // Try to parse with mermaid to validate syntax
    try {
      await mermaid.parse(content);
      console.log('Syntax validation passed');
    } catch (parseError) {
      result.isValid = false;
      result.errors?.push(parseError instanceof Error ? parseError.message : 'Invalid Mermaid syntax');
      console.error('Parse error:', parseError);
    }

    console.log('Validation result:', result);
    console.log('========================\n');

  } catch (error) {
    result.isValid = false;
    result.errors?.push(error instanceof Error ? error.message : 'Invalid Mermaid syntax');
    console.error('Validation error:', error);
    console.log('========================\n');
  }

  return result;
} 