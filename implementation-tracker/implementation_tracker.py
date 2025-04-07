import os
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple

class ImplementationTracker:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.file_structure = {}
        self.dependency_graph = {}

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

    def extract_imports(self, file_path: Path) -> List[str]:
        """Extract import statements from a TypeScript/JavaScript file."""
        imports = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Match different import patterns
                # 1. import { ... } from '...'
                # 2. import ... from '...'
                # 3. import '...'
                # 4. require('...')
                import_patterns = [
                    r"import\s+{.*?}\s+from\s+['\"](.*?)['\"]",
                    r"import\s+.*?\s+from\s+['\"](.*?)['\"]",
                    r"import\s+['\"](.*?)['\"]",
                    r"require\(['\"](.*?)['\"]\)"
                ]
                
                for pattern in import_patterns:
                    matches = re.findall(pattern, content)
                    imports.extend(matches)
                
                return imports
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return []

    def resolve_import_path(self, import_path: str, current_file: Path) -> Path:
        """Resolve an import path to an absolute file path."""
        # Handle relative imports
        if import_path.startswith('.'):
            # Remove file extension if present
            if import_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
                import_path = import_path[:-4] if import_path.endswith('.tsx') or import_path.endswith('.jsx') else import_path[:-3]
            
            # Resolve relative path
            resolved_path = (current_file.parent / import_path).resolve()
            
            # Check for file extensions
            for ext in ['.ts', '.tsx', '.js', '.jsx']:
                if (resolved_path.with_suffix(ext)).exists():
                    return resolved_path.with_suffix(ext)
            
            # Check for index files
            for ext in ['.ts', '.tsx', '.js', '.jsx']:
                index_path = (resolved_path / f"index{ext}").resolve()
                if index_path.exists():
                    return index_path
            
            # Return the path as is if no file is found
            return resolved_path
        
        # Handle absolute imports (from node_modules or project root)
        # This is a simplified approach and might need adjustment based on your project structure
        if import_path.startswith('@/'):
            # Assuming @/ is an alias for the src directory
            import_path = import_path[2:]
            for ext in ['.ts', '.tsx', '.js', '.jsx']:
                path = (self.root_dir / import_path).with_suffix(ext)
                if path.exists():
                    return path
            
            # Check for index files
            for ext in ['.ts', '.tsx', '.js', '.jsx']:
                index_path = (self.root_dir / import_path / f"index{ext}").resolve()
                if index_path.exists():
                    return index_path
        
        # For node_modules imports, we'll just return the import path as is
        return Path(import_path)

    def build_dependency_graph(self) -> Dict[str, List[str]]:
        """Build a dependency graph from TypeScript/JavaScript imports."""
        dependency_graph = {}
        
        # Find all TypeScript/JavaScript files
        for root, _, files in os.walk(self.root_dir):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = Path(root) / file
                    relative_path = file_path.relative_to(self.root_dir)
                    
                    # Extract imports
                    imports = self.extract_imports(file_path)
                    
                    # Resolve import paths
                    resolved_imports = []
                    for imp in imports:
                        resolved_path = self.resolve_import_path(imp, file_path)
                        if resolved_path.exists() and resolved_path.is_file():
                            try:
                                relative_import = resolved_path.relative_to(self.root_dir)
                                resolved_imports.append(str(relative_import))
                            except ValueError:
                                # If the resolved path is outside the root directory, skip it
                                pass
                    
                    # Add to dependency graph
                    dependency_graph[str(relative_path)] = resolved_imports
        
        self.dependency_graph = dependency_graph
        return dependency_graph

    def save_dependency_graph(self, output_file: str = 'dependency_graph.json'):
        """Save the dependency graph to a JSON file."""
        if not self.dependency_graph:
            self.build_dependency_graph()
            
        output_path = Path(output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.dependency_graph, f, indent=2)

    def generate_dependency_dot(self, output_file: str = 'dependency_graph.dot'):
        """Generate a DOT file for visualizing the dependency graph with Graphviz."""
        if not self.dependency_graph:
            self.build_dependency_graph()
        
        dot_content = ["digraph Dependencies {"]
        dot_content.append("  rankdir=LR;")
        dot_content.append("  node [shape=box, style=filled, fillcolor=lightblue];")
        
        # Add nodes
        for file in self.dependency_graph:
            dot_content.append(f'  "{file}" [label="{file}"];')
        
        # Add edges
        for file, dependencies in self.dependency_graph.items():
            for dep in dependencies:
                dot_content.append(f'  "{file}" -> "{dep}";')
        
        dot_content.append("}")
        
        # Save to file
        output_path = Path(output_file)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(dot_content))

def main():
    # Get the project root directory (parent of this script)
    current_dir = Path(__file__).parent
    project_root = current_dir.parent
    
    tracker = ImplementationTracker(str(project_root)+ '/system-designer-ai/src')
    tracker.generate_structure()
    tracker.save_structure()
    tracker.save_tree_structure()
    
    # Generate and save dependency graph
    tracker.build_dependency_graph()
    tracker.save_dependency_graph()
    tracker.generate_dependency_dot()

if __name__ == '__main__':
    main() 