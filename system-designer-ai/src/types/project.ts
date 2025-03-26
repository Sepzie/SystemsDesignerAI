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

export interface Project extends ProjectFormData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  progress: number;
} 