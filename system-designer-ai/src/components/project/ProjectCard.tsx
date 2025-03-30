'use client'

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block transition-transform hover:translate-y-[-4px]">
      <Card className="h-full border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Functional Requirements</h4>
            <ul className="space-y-1.5">
              {project.requirements.functional.slice(0, 2).map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-0.5 text-indigo-500">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{req}</span>
                </li>
              ))}
              {project.requirements.functional.length > 2 && (
                <li className="text-sm text-gray-400 dark:text-gray-500 pl-4">
                  +{project.requirements.functional.length - 2} more
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack</h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.tech_stack || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1.5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            Created: {new Date(project.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium">
            View Project
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
