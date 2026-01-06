import { NextRequest, NextResponse } from 'next/server';
import { validateMermaidDiagram } from '@/lib/validators/mermaid-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = body?.content;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Mermaid content is required' },
        { status: 400 }
      );
    }

    const result = await validateMermaidDiagram(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Mermaid validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate diagram' },
      { status: 500 }
    );
  }
}
