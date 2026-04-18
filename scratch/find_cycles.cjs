const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const files = [];

function getFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(res);
    } else if (res.endsWith('.ts') || res.endsWith('.tsx')) {
      files.push(res);
    }
  }
}

getFiles(srcDir);

const imports = {};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativeFile = path.relative(srcDir, file).replace(/\\/g, '/');
  imports[relativeFile] = [];
  
  const regex = /from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let importPath = match[1];
    if (importPath.startsWith('@/')) {
      importPath = importPath.substring(2);
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const dir = path.dirname(relativeFile);
      importPath = path.posix.join(dir, importPath);
    } else {
      continue; // Skip node_modules
    }
    
    // Normalize and add extension if missing
    let fullPath = path.join(srcDir, importPath);
    if (!importPath.endsWith('.ts') && !importPath.endsWith('.tsx')) {
      if (fs.existsSync(fullPath + '.ts')) importPath += '.ts';
      else if (fs.existsSync(fullPath + '.tsx')) importPath += '.tsx';
      else if (fs.existsSync(path.join(fullPath, 'index.ts'))) importPath += '/index.ts';
      else if (fs.existsSync(path.join(fullPath, 'index.tsx'))) importPath += '/index.tsx';
    }
    
    imports[relativeFile].push(importPath);
  }
});

function findCycles(node, visited = new Set(), stack = []) {
  visited.add(node);
  stack.push(node);
  
  const neighbors = imports[node] || [];
  for (const neighbor of neighbors) {
    if (stack.includes(neighbor)) {
      console.log('Cycle found:', stack.slice(stack.indexOf(neighbor)).join(' -> ') + ' -> ' + neighbor);
    } else if (!visited.has(neighbor)) {
      findCycles(neighbor, visited, stack);
    }
  }
  
  stack.pop();
}

const visited = new Set();
Object.keys(imports).forEach(file => {
  if (!visited.has(file)) {
    findCycles(file, visited);
  }
});
