import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create dist directory if it doesn't exist
if (!existsSync('./dist')) {
  mkdirSync('./dist');
}

// Create dist/icons directory if it doesn't exist
if (!existsSync('./dist/icons')) {
  mkdirSync('./dist/icons');
}

// Copy manifest.json to dist
const manifest = JSON.parse(readFileSync('./manifest.json', 'utf-8'));
writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));

// Copy icons
const iconSizes = ['16', '48', '128'];
iconSizes.forEach(size => {
  copyFileSync(
    `./icons/icon${size}.png`,
    `./dist/icons/icon${size}.png`
  );
}); 