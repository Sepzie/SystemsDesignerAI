import os
import json
from pathlib import Path
from typing import Dict, Any

class ImplementationTracker:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.file_structure = {}

    def scan_directory(self, directory: Path) -> Dict[str, Any]:
        """Recursively scan a directory and create a representation of its structure."""
        structure = {}
        
        for item in directory.iterdir():
            if item.name.startswith('.') or item.name.startswith('__'):
                continue
                
            if item.is_file():
                structure[item.name] = {
                    'type': 'file',
                    'extension': item.suffix,
                    'size': item.stat().st_size
                }
            elif item.is_dir():
                structure[item.name] = {
                    'type': 'directory',
                    'contents': self.scan_directory(item)
                }
        
        return structure

    def generate_structure(self) -> Dict[str, Any]:
        """Generate the complete file structure representation."""
        self.file_structure = {
            'root': str(self.root_dir),
            'structure': self.scan_directory(self.root_dir)
        }
        return self.file_structure

    def save_structure(self, output_file: str = 'file_structure.json'):
        """Save the file structure to a JSON file."""
        if not self.file_structure:
            self.generate_structure()
            
        output_path = Path(output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.file_structure, f, indent=2)

    def generate_tree_representation(self, structure: Dict[str, Any], prefix: str = "", is_last: bool = True) -> str:
        """Generate a tree-like representation of the file structure."""
        tree = []
        items = list(structure.items())
        
        for i, (name, info) in enumerate(items):
            is_last_item = i == len(items) - 1
            connector = "└── " if is_last_item else "├── "
            
            # Add the current item
            tree.append(f"{prefix}{connector}{name}")
            
            # If it's a directory, recursively add its contents
            if info['type'] == 'directory':
                next_prefix = prefix + ("    " if is_last_item else "│   ")
                tree.append(self.generate_tree_representation(info['contents'], next_prefix, is_last_item))
        
        return "\n".join(tree)

    def save_tree_structure(self, output_file: str = 'file_structure.txt'):
        """Save the file structure in a tree-like format."""
        if not self.file_structure:
            self.generate_structure()
        
        # Get the root directory name
        root_name = self.root_dir.name
        
        # Generate the tree representation
        tree = f"{root_name}/\n{self.generate_tree_representation(self.file_structure['structure'])}"
        
        # Save to file
        output_path = Path(output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(tree)

def main():
    # Get the project root directory (parent of this script)
    current_dir = Path(__file__).parent
    project_root = current_dir.parent
    
    tracker = ImplementationTracker(str(project_root)+ '/system-designer-ai/src')
    tracker.generate_structure()
    tracker.save_structure()
    tracker.save_tree_structure()

if __name__ == '__main__':
    main() 