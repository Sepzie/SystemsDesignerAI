export interface ProjectRequirements {
  functional: string[];
  nonFunctional: string[];
}

export interface ProjectFormData {
  name: string;
  description: string;
  requirements: ProjectRequirements;
  techStack: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  requirements: ProjectRequirements;
  tech_stack: string;
  created_at: string;
  updated_at: string;
  progress: number;
} 