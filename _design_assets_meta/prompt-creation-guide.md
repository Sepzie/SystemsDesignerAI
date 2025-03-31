# Guide for Creating Effective Coding Agent Prompts

## Core Principles

1. **Project Structure Awareness**
   - Direct the agent to analyze existing project structure first
   - Reference specific files and directories relevant to the task
   - Guide toward correct placement within the existing architecture

2. **Standalone Instructions**
   - Make each prompt self-contained, avoiding references to previous prompts
   - Include all necessary context within each prompt
   - Assume minimal context carryover between prompts

3. **Conciseness and Clarity**
   - Remove unnecessary explanation, tips, and fluff
   - Focus on requirements, deliverables, and acceptance criteria
   - Use direct, matter-of-fact language

4. **Modular Implementation**
   - Break complex tasks into sequential, manageable steps
   - Create clear checkpoints between implementation phases
   - Each section should build logically on previous work

5. **Visual Context**
   - Reference wireframes or mockups when available
   - Specify component placement and layout clearly
   - Provide guidance on visual hierarchy

## Prompt Structure

### 1. Project Structure Context
- List specific files and directories relevant to the task
- Identify key existing components to examine
- Highlight integration points in the codebase

### 2. Objective
- Single-sentence statement of the core objective
- Clearly define scope boundaries

### 3. Requirements
- Bullet list of specific, actionable requirements
- Focus on what needs to be done, not how to do it
- Specify critical functionality and constraints

### 4. Expected Files
- List specific files to create or modify
- Use exact paths as they appear in the project structure
- Specify file relationships where relevant

### 5. Implementation Notes (Optional)
- Brief technical guidance for complex integration points
- Note existing patterns to follow
- Highlight potential pitfalls to avoid

### 6. Acceptance Criteria
- Specific, testable success criteria
- Focus on functionality rather than implementation details
- Include error handling and edge cases

## Balance Specificity and Developer Agency

1. **Be Specific About What, Flexible About How**
   - Clearly define what needs to be accomplished
   - Allow latitude in implementation approaches
   - Trust the coder's judgment for technical details

2. **Appropriate Areas for Developer Discretion**
   - Error handling strategies
   - Code organization within files
   - Specific utility functions
   - Performance optimizations
   - Testing approaches

3. **Areas Requiring More Specificity**
   - File locations and naming
   - Integration points with existing code
   - Data structures and interfaces
   - Required functionality
   - Alignment with existing patterns

4. **Things to Avoid**
   - Verbosity and unnecessary explanation
   - References to other prompts
   - Contradictory or ambiguous requirements
   - Excessive prescription of implementation details

## Examples of Strong vs. Weak Directions

### Weak:
"Create a chat interface component that handles messages in a user-friendly way with good UX patterns and proper loading states."

### Strong:
"Create `src/components/chat/ChatInterface.tsx` that displays messages from `messageData` array with different styling for user vs. assistant messages. Include a loading spinner during message sending."

### Too Prescriptive:
"Add try/catch blocks in `sendMessage()` function that displays error toast when API calls fail and allows message retry."

### Better Balance:
"Implement error handling in `sendMessage()` function that provides user feedback when API calls fail and allows recovery from errors."