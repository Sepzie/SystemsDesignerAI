import { MermaidValidationResult } from '@/types/langchain';
import mermaid from 'mermaid';

// Initialize mermaid with server-side configuration
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
});


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
    if (!result.errors) result.errors = [];
    result.errors.push('Diagram content is empty');
    return result;
  }

  try {
    // Use mermaid's parse method to validate the diagram
    await mermaid.parse(content);
  } catch (error) {
    result.isValid = false;
    if (!result.errors) result.errors = [];
    result.errors.push(error instanceof Error ? error.message : 'Invalid Mermaid syntax');
  }

  return result;
} 