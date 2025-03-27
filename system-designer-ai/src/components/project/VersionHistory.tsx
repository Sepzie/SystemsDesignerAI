import React from 'react';

const versions = [
  { version: '3.0', date: 'Today, 14:30' },
  { version: '2.0', date: 'Yesterday, 16:45' },
  { version: '1.0', date: 'March 19, 10:15' },
];

export const VersionHistory: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 p-4 border-l">
      <h2 className="text-lg font-semibold mb-4">Version History</h2>
      <div className="space-y-4">
        {versions.map((item) => (
          <div
            key={item.version}
            className="p-3 bg-white rounded-md shadow-sm hover:shadow cursor-pointer"
          >
            <div className="font-medium">Version {item.version}</div>
            <div className="text-sm text-gray-500">{item.date}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}; 