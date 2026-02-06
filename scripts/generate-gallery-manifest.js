#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const galleryDir = path.join(process.cwd(), 'public', 'gallery');
const outFile = path.join(galleryDir, 'manifest.json');
const exts = new Set(['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.avif']);

function walk(dir, relBase = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort();
  const result = { folders: {}, images: [] };
  
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = relBase ? `${relBase}/${e.name}` : e.name;
    
    if (e.isDirectory()) {
      const sub = walk(full, rel);
      if (sub.images.length > 0 || Object.keys(sub.folders).length > 0) {
        result.folders[rel] = sub;
      }
    } else if (e.isFile() && exts.has(path.extname(e.name).toLowerCase())) {
      const imgUrl = '/' + path.relative(path.join(process.cwd(), 'public'), full).replace(/\\/g, '/');
      result.images.push(imgUrl);
    }
  }
  return result;
}

try {
  if (!fs.existsSync(galleryDir)) {
    console.error('gallery folder not found at', galleryDir);
    process.exit(1);
  }

  const structure = walk(galleryDir);
  fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), ...structure }, null, 2), 'utf-8');
  
  const totalImages = countImages(structure);
  console.log('Wrote', outFile, 'with', totalImages, 'images in', Object.keys(structure.folders).length, 'folders');
} catch (err) {
  console.error(err);
  process.exit(1);
}

function countImages(obj) {
  let count = obj.images?.length || 0;
  for (const folder of Object.values(obj.folders || {})) {
    count += countImages(folder);
  }
  return count;
}
