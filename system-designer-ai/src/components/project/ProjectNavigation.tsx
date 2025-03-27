'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Card } from '../ui/Card'

interface ProjectNavigationProps {
  projectId: string
}

export function ProjectNavigation({ projectId }: ProjectNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('chat')

  const tabs = [
    { id: 'chat', label: 'Chat' },
    { id: 'design', label: 'Design' },
    { id: 'assets', label: 'Assets' },
    { id: 'settings', label: 'Settings' }
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    router.push(`/projects/${projectId}/${tabId}`)
  }

  return (
    <Card className="p-4 mb-8">
      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </Card>
  )
} 