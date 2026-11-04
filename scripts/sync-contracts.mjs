import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const source = resolve(process.argv[2] || '../arena-gym');
await mkdir('packages/contracts/src', { recursive: true });
await cp(resolve(source, 'packages/shared/src'), 'packages/contracts/src', { recursive: true });
await writeFile('docs/contracts-source.json', JSON.stringify({ repository: 'Wingital-Company/arena-gym', commit: execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), path: 'packages/shared/src' }, null, 2) + '\n');
