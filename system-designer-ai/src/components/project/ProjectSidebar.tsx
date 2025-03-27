import React from 'react';
import Link from 'next/link';

const projectAssets = [
  { id: 'system-context', name: 'System Context', href: '#' },
  { id: 'component-diagram', name: 'Component Diagram', href: '#' },
  { id: 'database-schema', name: 'Database Schema', href: '#' },
  { id: 'api-specifications', name: 'API Specifications', href: '#' },
  { id: 'user-flow', name: 'User Flow', href: '#' },
  { id: 'deployment-plan', name: 'Deployment Plan', href: '#' },
  { id: 'implementation-guide', name: 'Implementation Guide', href: '#' },
];

export const ProjectSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 p-4 border-r">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Project Assets</h2>
        <nav>
          <ul className="space-y-2">
            {projectAssets.map((asset) => (
              <li key={asset.id}>
                <Link
                  href={asset.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {asset.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Export All
          </button>
          <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
            Generate AI Prompt
          </button>
        </div>
      </div>
    </aside>
  );
}; 