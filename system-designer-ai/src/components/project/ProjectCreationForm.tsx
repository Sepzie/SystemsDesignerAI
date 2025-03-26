'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ProjectFormData, ProjectRequirements } from '@/types/project';

const initialFormData: ProjectFormData = {
  name: '',
  description: '',
  requirements: {
    functional: [''],
    nonFunctional: ['']
  },
  techStack: ''
};

export function ProjectCreationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.requirements.functional.length === 1 && !formData.requirements.functional[0].trim()) {
      newErrors.requirements = 'At least one functional requirement is required';
    }

    if (formData.requirements.nonFunctional.length === 1 && !formData.requirements.nonFunctional[0].trim()) {
      newErrors.requirements = 'At least one non-functional requirement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create project');
      }

      // Redirect to the project page
      router.push(`/projects/${data.project.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequirementChange = (
    type: 'functional' | 'nonFunctional',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type]: prev.requirements[type].map((req, i) => 
          i === index ? value : req
        )
      }
    }));
  };

  const addRequirement = (type: 'functional' | 'nonFunctional') => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type]: [...prev.requirements[type], '']
      }
    }));
  };

  const removeRequirement = (type: 'functional' | 'nonFunctional', index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type]: prev.requirements[type].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Project Name
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={errors.description}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Functional Requirements
          </label>
          {formData.requirements.functional.map((req, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={req}
                onChange={(e) => handleRequirementChange('functional', index, e.target.value)}
                placeholder={`Requirement ${index + 1}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeRequirement('functional', index)}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addRequirement('functional')}
            className="mt-2"
            disabled={isSubmitting}
          >
            Add Requirement
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Non-Functional Requirements
          </label>
          {formData.requirements.nonFunctional.map((req, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={req}
                onChange={(e) => handleRequirementChange('nonFunctional', index, e.target.value)}
                placeholder={`Requirement ${index + 1}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => removeRequirement('nonFunctional', index)}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addRequirement('nonFunctional')}
            className="mt-2"
            disabled={isSubmitting}
          >
            Add Requirement
          </Button>
        </div>

        <div>
          <label htmlFor="techStack" className="block text-sm font-medium mb-2">
            Technology Stack
          </label>
          <Input
            id="techStack"
            value={formData.techStack}
            onChange={(e) => setFormData(prev => ({ ...prev, techStack: e.target.value }))}
            placeholder="e.g., React, Node.js, PostgreSQL"
            disabled={isSubmitting}
          />
        </div>

        {errors.requirements && (
          <p className="text-red-500 text-sm">{errors.requirements}</p>
        )}

        {submitError && (
          <p className="text-red-500 text-sm">{submitError}</p>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Project...' : 'Create Project'}
        </Button>
      </form>
    </Card>
  );
} 