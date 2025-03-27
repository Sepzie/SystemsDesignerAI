'use client'

import { Project } from '@/types/project'
import { Card } from '../ui/Card'
import { usePathname } from 'next/navigation'

interface ProjectContentProps {
  project: Project
}

export function ProjectContent({ project }: ProjectContentProps) {
  const pathname = usePathname()
  const currentView = pathname.split('/').pop() || 'chat'

  // Placeholder content for different views
  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return (
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Chat interface will be implemented here
          </div>
        )
      case 'design':
        return (
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Design view will be implemented here
          </div>
        )
      case 'assets':
        return (
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Assets view will be implemented here
          </div>
        )
      case 'settings':
        return (
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Project settings will be implemented here
          </div>
        )
      default:
        return (
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Select a view from the navigation above
          </div>
        )
    }
  }

  return (
    <Card className="p-6">
      {renderContent()}
    </Card>
  )
} 