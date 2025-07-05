import { tmpdir as createTmpDir } from 'node:os';
import pathLib from 'node:path';

import { test as base } from '@playwright/test';
import fs from 'fs-extra';
import { v4 as uuid } from 'uuid';

export const test = base.extend<{ tmpdir: string }>({
  tmpdir: async ({}, use) => {
    const cwd = pathLib.join(createTmpDir(), uuid());

    try {
      await use(cwd);
    } finally {
      await fs.remove(cwd);
    }
  },
});
