import React from 'react';

export const ChatInterface: React.FC = () => {
  return (
    <div className="h-64 border-t bg-white p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">AI System Designer Assistant</h3>
      </div>
      
      {/* Chat messages area - to be implemented */}
      <div className="h-32 overflow-y-auto mb-4 bg-gray-50 rounded-md p-4">
        <div className="text-gray-500 italic">
          Chat messages will appear here...
        </div>
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message here..."
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          Send
        </button>
      </div>
    </div>
  );
}; 