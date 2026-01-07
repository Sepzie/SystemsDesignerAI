import Link from 'next/link';
import { Card } from '../ui/Card';
import { Project } from "@/types/base-types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="p-6 hover:shadow-[0_18px_40px_rgba(24,20,16,0.12)] transition-shadow">
        <h3 className="text-xl font-semibold mb-2 text-[var(--ink)]">{project.name}</h3>
        <p className="text-[var(--ink-muted)] mb-4">{project.description}</p>
        
        <div className="mb-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold mb-2">Tech Stack</h4>
          <p className="text-sm text-[var(--ink-muted)]">
            {project.tech_stack || 'Not specified'}
          </p>
        </div>

        <div className="text-sm text-[var(--ink-muted)]">
          Created: {new Date(project.created_at).toLocaleDateString()}
        </div>
      </Card>
    </Link>
  );
} 
