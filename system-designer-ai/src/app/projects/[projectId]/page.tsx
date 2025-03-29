import React from 'react';
import { ProjectLayout } from '@/components/project/ProjectLayout';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  
  return (
    <ProjectLayout projectId={resolvedParams.projectId} />
  );
} 