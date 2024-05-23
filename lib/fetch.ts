import * as fs from 'fs';
import * as path from 'path';

const cacheDir = path.join(__dirname, '..', '.cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

export async function cachedFetch(url: string): Promise<string> {
  const cacheFile = path.join(cacheDir, encodeURIComponent(url));
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, 'utf8');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const text = await response.text();
  fs.writeFileSync(cacheFile, text);
  return text;
}
