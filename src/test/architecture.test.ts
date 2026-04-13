import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const SRC_DIR = path.resolve(path.dirname(CURRENT_FILE), '..');
const BANNED_IMPORT_ROOTS = ['@/app/components', '@/auth', '@/service'];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return getSourceFiles(entryPath);
    }

    if (!entryPath.endsWith('.ts') && !entryPath.endsWith('.tsx')) {
      return [];
    }

    return [entryPath];
  });
}

describe('architecture imports', () => {
  it('does not import from removed architectural roots', () => {
    const violations = getSourceFiles(SRC_DIR).flatMap((filePath) => {
      if (filePath === CURRENT_FILE) {
        return [];
      }

      const fileContent = readFileSync(filePath, 'utf8');

      return BANNED_IMPORT_ROOTS.filter((importRoot) => {
        const importPattern = new RegExp(`['"]${escapeRegExp(importRoot)}(?:\\/[^'"]*)?['"]`, 'g');

        return importPattern.test(fileContent);
      }).map((importRoot) => `${path.relative(SRC_DIR, filePath)} -> ${importRoot}`);
    });

    expect(violations).toEqual([]);
  });
});
