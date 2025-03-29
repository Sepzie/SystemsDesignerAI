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

  // Check if content is empty
  if (!content.trim()) {
    result.isValid = false;
    result.errors?.push('Diagram content is empty');
    return result;
  }

  try {
    // Parse the diagram to validate syntax
    await mermaid.parse(content);
    
    // Additional validation for diagram structure
    const lines = content.split('\n');
    let hasContent = false;
    let hasConnections = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('%')) continue;
      
      hasContent = true;
      
      // Check for basic connection syntax
      if (trimmedLine.includes('-->') || trimmedLine.includes('--') || trimmedLine.includes('->')) {
        hasConnections = true;
      }
    }

    if (!hasContent) {
      result.isValid = false;
      result.errors?.push('Diagram has no content');
    }

    if (!hasConnections && !content.includes('pie') && !content.includes('gantt')) {
      result.warnings?.push('Diagram has no connections between elements');
    }

  } catch (error) {
    result.isValid = false;
    result.errors?.push(error instanceof Error ? error.message : 'Invalid Mermaid syntax');
  }

  return result;
} 