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
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Functional Requirements</h4>
            <ul className="text-sm text-gray-600">
              {project.requirements.functional.slice(0, 2).map((req, index) => (
                <li key={index} className="line-clamp-1">• {req}</li>
              ))}
              {project.requirements.functional.length > 2 && (
                <li className="text-gray-400">+{project.requirements.functional.length - 2} more</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Tech Stack</h4>
            <p className="text-sm text-gray-600 line-clamp-1">{project.techStack || 'Not specified'}</p>
          </div>

          <div className="text-xs text-gray-400">
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </Card>
    </Link>
  );
} 