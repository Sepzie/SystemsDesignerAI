import { Project } from '@/types/project'
import { Card } from '../ui/Card'

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <Card className="p-6 mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(project.created_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(project.updated_at).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Progress:</span>{' '}
              <span className="text-blue-600">{project.progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 