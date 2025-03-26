'use client';

import { useState } from 'react';
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
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

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
    
    if (!validateForm()) {
      return;
    }

    // TODO: Implement API call
    console.log('Form submitted:', formData);
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
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeRequirement('functional', index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => addRequirement('functional')}
            className="mt-2"
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
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeRequirement('nonFunctional', index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => addRequirement('nonFunctional')}
            className="mt-2"
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
          />
        </div>

        {errors.requirements && (
          <p className="text-red-500 text-sm">{errors.requirements}</p>
        )}

        <Button type="submit" className="w-full">
          Create Project
        </Button>
      </form>
    </Card>
  );
} 