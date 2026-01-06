"""
Implementation Tracker - A tool for analyzing and visualizing project structure and dependencies.

This script scans a directory structure, analyzes TypeScript/JavaScript imports, and generates:
1. A JSON representation of the file structure
2. A text-based tree visualization of the structure
3. A dependency graph in JSON format
4. A DOT file for visualizing the dependency graph

Usage:
    Basic usage (default settings):
        python implementation_tracker.py

    Specify a custom root directory:
        python implementation_tracker.py --root-dir /path/to/your/project

    Customize output files:
        python implementation_tracker.py --structure-json my_structure.json --structure-txt my_tree.txt --dependency-json my_deps.json --dependency-dot my_graph.dot

    Show help:
        python implementation_tracker.py --help

Command Line Arguments:
    --root-dir         Directory to analyze (default: system-designer-ai/src)
    --structure-json   Output file for JSON structure (default: file_structure.json)
    --structure-txt    Output file for tree structure (default: file_structure.txt)
    --dependency-json  Output file for dependency graph (default: dependency_graph.json)
    --dependency-dot   Output file for DOT graph (default: dependency_graph.dot)

Output Files:
    - JSON structure: Contains hierarchical representation of the file system
    - Text tree: Human-readable tree visualization of the file structure
    - Dependency JSON: Graph representation of file dependencies
    - DOT file: Graphviz-compatible file for visualizing dependencies
"""

import os
import json
import re
import argparse
import logging
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple
import fnmatch
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'implementation_tracker_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)

class ImplementationTracker:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.file_structure = {}
        self.dependency_graph = {}
        logging.info(f"Initializing ImplementationTracker with root directory: {self.root_dir}")
        self.ignore_patterns = self._load_gitignore_patterns()
        logging.info(f"Loaded {len(self.ignore_patterns)} gitignore patterns")

    def _load_gitignore_patterns(self) -> List[str]:
        """Load and parse .gitignore patterns from the root directory and its subdirectories."""
        patterns = []
        start_time = datetime.now()
        logging.info("Starting to load gitignore patterns...")
        
        for root, _, files in os.walk(self.root_dir):
            if '.gitignore' in files:
                gitignore_path = Path(root) / '.gitignore'
                logging.info(f"Found gitignore file at: {gitignore_path}")
                with open(gitignore_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            rel_path = Path(root).relative_to(self.root_dir)
                            if rel_path != Path('.'):
                                pattern = str(rel_path / line)
                            else:
                                pattern = line
                            patterns.append(pattern)
        
        duration = (datetime.now() - start_time).total_seconds()
        logging.info(f"Finished loading gitignore patterns in {duration:.2f} seconds")
        return patterns

    def _should_ignore(self, path: Path) -> bool:
        """Check if a path should be ignored based on .gitignore patterns."""
        rel_path = path.relative_to(self.root_dir)
        rel_path_str = str(rel_path)
        
        for pattern in self.ignore_patterns:
            # Handle directory patterns (ending with /)
            if pattern.endswith('/'):
                dir_pattern = pattern.rstrip('/')
                # Check if the path is inside the directory
                if fnmatch.fnmatch(rel_path_str, dir_pattern) or rel_path_str.startswith(dir_pattern + '/'):
                    return True
            # Handle regular patterns
            elif fnmatch.fnmatch(rel_path_str, pattern) or fnmatch.fnmatch(rel_path_str, pattern + '/*'):
                return True
        return False

    def scan_directory(self, directory: Path) -> Dict[str, Any]:
        """Recursively scan a directory and create a representation of its structure."""
        structure = {}
        logging.info(f"Scanning directory: {directory}")
        start_time = datetime.now()
        items_processed = 0
        items_ignored = 0
        
        # Skip node_modules directories completely
        if directory.name == 'node_modules':
            logging.info(f"Skipping node_modules directory: {directory}")
            return structure
        
        for item in directory.iterdir():
            items_processed += 1
            if (item.name.startswith('.') or 
                item.name.startswith('__') or 
                item.name == 'node_modules' or
                self._should_ignore(item)):
                items_ignored += 1
                if item.name == 'node_modules':
                    logging.info(f"Skipping node_modules directory: {item}")
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
        
        duration = (datetime.now() - start_time).total_seconds()
        logging.info(f"Finished scanning {directory} in {duration:.2f} seconds")
        logging.info(f"Processed {items_processed} items, ignored {items_ignored} items")
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
        # Separate directories and files
        dirs = []
        files = []
        for name, info in structure.items():
            if info['type'] == 'directory':
                dirs.append((name, info))
            else:
                files.append((name, info))
        
        # Sort directories and files alphabetically
        dirs.sort(key=lambda x: x[0])
        files.sort(key=lambda x: x[0])
        
        # Combine sorted lists with directories first
        items = dirs + files
        
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
        start_time = datetime.now()
        logging.info("Starting to build dependency graph...")
        files_processed = 0
        
        for root, _, files in os.walk(self.root_dir):
            # Skip node_modules directories and their contents
            if 'node_modules' in root.split(os.sep):
                logging.info(f"Skipping node_modules directory: {root}")
                continue
                
            # Skip directories that match gitignore patterns
            root_path = Path(root)
            if self._should_ignore(root_path):
                logging.info(f"Skipping ignored directory: {root}")
                continue
                
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    file_path = Path(root) / file
                    if self._should_ignore(file_path):
                        logging.info(f"Skipping ignored file: {file_path}")
                        continue
                        
                    relative_path = file_path.relative_to(self.root_dir)
                    logging.info(f"Processing file: {relative_path}")
                    
                    imports = self.extract_imports(file_path)
                    resolved_imports = []
                    for imp in imports:
                        resolved_path = self.resolve_import_path(imp, file_path)
                        if resolved_path.exists() and resolved_path.is_file():
                            try:
                                relative_import = resolved_path.relative_to(self.root_dir)
                                # Skip imports from node_modules and ignored paths
                                if ('node_modules' not in str(relative_import) and 
                                    not self._should_ignore(resolved_path)):
                                    resolved_imports.append(str(relative_import))
                            except ValueError:
                                pass
                    
                    dependency_graph[str(relative_path)] = resolved_imports
                    files_processed += 1
        
        duration = (datetime.now() - start_time).total_seconds()
        logging.info(f"Finished building dependency graph in {duration:.2f} seconds")
        logging.info(f"Processed {files_processed} files")
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
    parser = argparse.ArgumentParser(description='Track and analyze implementation structure and dependencies.')
    parser.add_argument('--root-dir', type=str, help='Root directory to analyze (default: system-designer-ai/src)')
    parser.add_argument('--structure-json', type=str, default='file_structure.json', help='Output file for JSON structure')
    parser.add_argument('--structure-txt', type=str, default='file_structure.txt', help='Output file for tree structure')
    parser.add_argument('--dependency-json', type=str, default='dependency_graph.json', help='Output file for dependency graph')
    parser.add_argument('--dependency-dot', type=str, default='dependency_graph.dot', help='Output file for DOT graph')
    
    args = parser.parse_args()
    
    logging.info("Starting implementation tracker...")
    start_time = datetime.now()
    
    # Get the project root directory
    if args.root_dir:
        root_dir = args.root_dir
    else:
        current_dir = Path(__file__).parent
        project_root = current_dir.parent
        root_dir = str(project_root) + '/system-designer-ai/src'
    
    tracker = ImplementationTracker(root_dir)
    
    # Generate and save structure
    logging.info("Generating file structure...")
    tracker.generate_structure()
    tracker.save_structure(args.structure_json)
    tracker.save_tree_structure(args.structure_txt)
    
    # Generate and save dependency graph
    logging.info("Generating dependency graph...")
    tracker.build_dependency_graph()
    tracker.save_dependency_graph(args.dependency_json)
    tracker.generate_dependency_dot(args.dependency_dot)
    
    duration = (datetime.now() - start_time).total_seconds()
    logging.info(f"Implementation tracker completed in {duration:.2f} seconds")

if __name__ == '__main__':
    main() 