import React from 'react';
import { ProjectLayout } from '@/components/project/ProjectLayout';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  
  return (
    <ProjectLayout projectId={resolvedParams.projectId}>
      <div className="h-full">
        <h2 className="text-xl font-semibold mb-4">System Context Diagram</h2>
        <div className="bg-white rounded-lg p-6 h-[calc(100%-2rem)] border">
          {/* Placeholder for the system context diagram */}
          <div className="h-full flex items-center justify-center text-gray-500">
            System Context Diagram will be displayed here
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
} 