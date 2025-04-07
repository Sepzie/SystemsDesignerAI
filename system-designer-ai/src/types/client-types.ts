
export interface ProjectFormData {
  name: string;
  description: string;
  techStack: string;
}

export interface AssetReference {
  id: string;
  message_id: string;
  asset_id: string;
  version_referenced: number;
  reference_type: 'creation' | 'modification' | 'mention';
}

