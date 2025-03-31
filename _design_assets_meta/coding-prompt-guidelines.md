# Guidelines for Creating Effective Coding Agent Prompts

## Lessons Learned from Implementation Challenges

When crafting prompts for coding agents, we often encounter integration challenges that stem from how we structure our requests. The following guidelines address common pitfalls and provide a framework for creating more effective prompts.

## Common Implementation Issues

1. **Type Redundancy**: Creation of overlapping or redundant type definitions across system boundaries.
2. **Frontend-Backend Confusion**: Frontend code incorrectly attempting to access backend utilities.
3. **Missing Database Implementation**: Database schema changes implied but not explicitly implemented.
4. **Integration Failures**: Components that work in isolation but fail to integrate properly.

## Root Causes in Prompt Creation

1. **Insufficient Architecture Context**
   - Failure to clearly establish architectural boundaries between frontend and backend
   - Lack of emphasis on separation of concerns between client and server code

2. **Incomplete System View**
   - Focus on individual components without sufficiently addressing their interactions
   - Implementation details without structural changes to support them

3. **Lack of Clear Data Flow Specification**
   - Undefined data flow paths from backend to frontend
   - Unclear relationships between types at different system layers

4. **Component-First vs. Flow-First Approach**
   - Structuring prompts around components rather than following data through the system
   - Leading to inconsistencies in component interactions

## Improved Prompt Creation Process

### 1. Start with Data and State Management

- Begin by defining the complete data model, including database schema changes
- Explicitly model data transformations across system boundaries
- Create clear type hierarchies that show how data evolves through the system
- Ensure types have a single source of truth with clear ownership

### 2. Layer-Based Prompt Structure

- Structure prompts based on architectural layers (DB → API → Frontend)
- Complete each layer before moving to the next
- Explicitly address the interfaces between layers
- Include contract definitions between layers

### 3. Explicit Context Boundaries

- Clearly delineate frontend vs. backend concerns in each prompt
- Include specific guidance on where code should run and what it should access
- Be explicit about which libraries and utilities are available in each context
- Address authentication and authorization boundaries

### 4. Implementation Sequence Diagrams

- Include simplified sequence diagrams showing how components interact
- Use these to validate the planned implementation before writing prompts
- Ensure data flow is consistent across all prompts
- Identify potential race conditions or timing issues

### 5. Integration-First Testing

- Start with integration test specifications that verify cross-component behaviors
- Use these as a guide to ensure components are designed to work together
- Address potential integration issues explicitly
- Include examples of successful integration patterns

## Recommended Implementation Sequence

For optimal results, follow this sequence when implementing new features:

1. **Data Model Definition**
   - Start with database schema changes
   - Define shared type definitions
   - Document type transformations between system layers

2. **API Contract Design**
   - Define clear API contracts between frontend and backend
   - Specify request/response formats
   - Document error handling and edge cases

3. **Backend Implementation**
   - Implement database access layer
   - Build API endpoints
   - Include validation and error handling

4. **Frontend State Management**
   - Design how frontend will manage and transform API data
   - Implement state containers or context providers
   - Define loading, error, and success states

5. **UI Component Implementation**
   - Build UI components that consume the state
   - Implement user interactions
   - Handle edge cases and error states

6. **Integration Testing**
   - Verify all layers work together as expected
   - Test end-to-end workflows
   - Validate error handling and edge cases

## Template for Cross-Layer Feature Implementation

When implementing features that span multiple system layers, include these sections in your prompts:

```
# Implement [Feature Name]

## System Context
- Current architecture diagram or description
- Affected system layers (DB, API, Frontend)
- System boundaries and interfaces

## Data Model Changes
- Database schema modifications
- New or modified type definitions
- Data transformations between layers

## Backend Implementation
- Database access methods
- API endpoints and controllers
- Security and validation requirements

## Frontend State Management
- State containers or contexts
- Data fetching and caching strategy
- Error and loading state handling

## UI Components
- Component hierarchy and responsibilities
- User interaction handling
- Edge case management

## Testing Strategy
- Unit testing requirements
- Integration testing approach
- Critical paths to validate
```

By following these guidelines, we can create prompts that lead to more cohesive, integrated implementations with fewer cross-boundary issues.
