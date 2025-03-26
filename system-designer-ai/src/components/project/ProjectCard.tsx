import Link from 'next/link';
import { Card } from '../ui/Card';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
        <p className="text-gray-600 mb-4">{project.description}</p>
        
        <div className="mb-4">
          <h4 className="font-medium mb-1">Functional Requirements:</h4>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {project.requirements.functional.slice(0, 2).map((req, index) => (
              <li key={index}>{req}</li>
            ))}
            {project.requirements.functional.length > 2 && (
              <li className="text-gray-400">+{project.requirements.functional.length - 2} more</li>
            )}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-1">Tech Stack:</h4>
          <p className="text-sm text-gray-600">
            {project.tech_stack || 'Not specified'}
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Created: {new Date(project.created_at).toLocaleDateString()}
        </div>
      </Card>
    </Link>
  );
} 