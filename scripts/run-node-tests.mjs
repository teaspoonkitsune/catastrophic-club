#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

function collectTestFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

const args = process.argv.slice(2);
const testFiles = collectTestFiles('src').sort();

if (testFiles.length === 0) {
  console.error('No test files found under src.');
  process.exit(1);
}

let exitCode = 0;

for (const testFile of testFiles) {
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--test', ...args, testFile],
    { stdio: 'inherit' },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    exitCode = result.status ?? 1;
    break;
  }
}

process.exit(exitCode);
