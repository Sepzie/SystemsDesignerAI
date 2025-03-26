# Project Creation Implementation Prompts

## Prompt 1: Analyze Codebase & Design Project Creation Form

### Task Overview
Analyze the existing codebase structure and implement the Project Creation form component.

### Instructions
1. First, examine the existing codebase to understand:
   - The overall application structure
   - Component organization patterns
   - State management approach
   - Routing implementation
   - UI component library usage

2. Create a Project Creation form component that:
   - Captures required project information as defined in the database schema
   - Includes fields for:
     - Project name
     - Description
     - Requirements (split into functional and non-functional if possible)
     - Technology preferences/stack
   - Implements form validation
   - Provides proper error handling and feedback
   - Includes a submit button that will call the API (to be implemented later)

3. Style the form using the existing application's styling approach.

4. Focus only on the UI component in this step - don't worry about API integration yet.

### Acceptance Criteria
- Form component renders correctly on the dashboard
- All required fields are present with appropriate validation
- Form follows existing application styling
- Component is prepared to integrate with an API endpoint later

### Deliverables
- Project creation form component with proper styling and validation
- Any necessary types or interfaces for project data

---

## Prompt 2: Implement Project API Route

### Task Overview
Create the API route handler for project creation.

### Instructions
1. Examine the existing API route structure to understand the pattern being used.

2. Implement a POST `/api/projects` endpoint that:
   - Validates incoming project creation requests
   - Requires authentication (reuse existing auth middleware)
   - Prepares data for storage in the database
   - Returns appropriate success/error responses

3. Set up proper error handling for invalid requests, authentication failures, and server errors.

4. Initially implement using the established mock pattern for database operations (if applicable).

5. Add appropriate type definitions and validation.

### Acceptance Criteria
- API route correctly validates incoming requests
- Authentication is properly enforced
- Route returns appropriate status codes and response data
- Error handling is comprehensive

### Deliverables
- Project creation API route handler
- Request/response type definitions
- Validation implementation

---

## Prompt 3: Connect Form to API & Implement Database Operations

### Task Overview
Connect the project creation form to the API and implement actual database operations.

### Instructions
1. Update the project creation form to submit data to the API endpoint.

2. Implement form submission handling with:
   - Loading state management
   - Error handling and user feedback
   - Success state and redirection

3. In the API route, implement the actual database operations:
   - Connect to the database service (Supabase based on project documentation)
   - Create database insertion logic following the schema
   - Handle database errors appropriately
   - Return the created project ID and details on success

4. Ensure proper user association with created projects.

### Acceptance Criteria
- Form successfully submits data to the API
- User receives appropriate feedback during submission (loading, success, error)
- Project is correctly stored in the database with all fields
- Projects are associated with the creating user
- Successful creation redirects to an appropriate page

### Deliverables
- Connected form with submission handling
- Complete API implementation with database operations
- Success/error handling on both client and server

---

## Prompt 4: Implement Project Listing & Navigation

### Task Overview
Implement project listing on the dashboard and navigation to the new project after creation.

### Instructions
1. Update the dashboard to fetch and display user projects:
   - Create a GET `/api/projects` endpoint if not already implemented
   - Implement project card/list component to display projects
   - Add loading and empty states

2. Implement navigation flow after project creation:
   - Redirect to the newly created project page
   - Or redirect back to dashboard with success message

3. Ensure proper error handling and loading states throughout.

4. Update any necessary routing to accommodate the new flow.

### Acceptance Criteria
- Dashboard displays user's projects
- Projects are fetched from the database
- Navigation after project creation works correctly
- Loading and error states are handled appropriately

### Deliverables
- Project listing implementation
- Navigation flow after project creation
- Any additional API routes needed

---

## Prompt 5: Testing & Refinement

### Task Overview
Test the complete project creation workflow and refine as needed.

### Instructions
1. Test the entire project creation workflow:
   - Form validation
   - API submission
   - Database storage
   - Navigation after creation
   - Error scenarios

2. Implement any missing error handling or edge cases.

3. Create unit tests for:
   - Form validation
   - API route handling
   - Database operations (using mocks if needed)

4. Refine UX based on testing:
   - Improve error messages
   - Enhance loading states
   - Optimize navigation

### Acceptance Criteria
- Complete workflow functions without errors
- Edge cases are handled properly
- Tests are implemented for critical components
- User experience is smooth and intuitive

### Deliverables
- Refined implementation with full error handling
- Unit tests for key components
- Documentation of the workflow
