import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../data/stage_b.json');
const target = resolve(here, '../public/stage_b.json');

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log(`synced ${source} -> ${target}`);
