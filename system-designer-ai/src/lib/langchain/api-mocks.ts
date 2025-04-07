export const MOCK_LLM_RESPONSE_MARKDOWN_WITH_DIAGRAM = {
    "id": "chatcmpl-BGvHIghwVtstFFhdJhnNwtIGNqaHE",
    
      "content": "MOCK_RESPONSE\n\n\n### 1. Architecture Overview\n\nThe ecommerce website consists of these core components:\n\n- **Frontend**: Next.js for responsive UI\n- **Backend API**: Handles business logic\n- **Database**: Stores user and product data\n- **Auth Service**: Manages user sessions\n- **Payment Gateway**: Processes transactions\n\n### 2. Recommended Tech Stack\n\n- Frontend: Next.js\n- Backend: Node.js/Express\n- Database: PostgreSQL or MongoDB\n\n{asset_type:mermaid_diagram}\n{asset_name:high_level_architecture}\n```\ngraph TD\n    A[User] -->|Browses| B[Frontend -Next.js]\n    B -->|API Calls| C[Backend API]\n    C -->|Queries| D[Database]\n    C -->|Auth| E[Auth Service]\n    C -->|Payment| F[Payment Gateway]\n```\nThis diagram shows the key components and their interactions.",
        "additional_kwargs": {},
    "response_metadata": {
      "tokenUsage": {
        "promptTokens": 379,
        "completionTokens": 757,
        "totalTokens": 1136
      },
      "finish_reason": "stop",
      "model_name": "gpt-4o-mini-2024-07-18",
      "usage": {
        "prompt_tokens": 379,
        "completion_tokens": 757,
        "total_tokens": 1136,
        "prompt_tokens_details": {
          "cached_tokens": 0,
          "audio_tokens": 0
        },
        "completion_tokens_details": {
          "reasoning_tokens": 0,
          "audio_tokens": 0,
          "accepted_prediction_tokens": 0,
          "rejected_prediction_tokens": 0
        }
      },
      "system_fingerprint": "fp_86d0290411"
    },
    "tool_calls": [],
    "invalid_tool_calls": [],
    "usage_metadata": {
      "output_tokens": 757,
      "input_tokens": 379,
      "total_tokens": 1136,
      "input_token_details": {
        "audio": 0,
        "cache_read": 0
      },
      "output_token_details": {
        "audio": 0,
        "reasoning": 0
      }
    }
  }
  