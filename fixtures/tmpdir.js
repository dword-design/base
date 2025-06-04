import { tmpdir as createTmpDir } from 'node:os';

import { test as base } from '@playwright/test';
import fs from 'fs-extra';

export const test = base.extend({
  tmpdir: async ({}, use) => {
    const cwd = createTmpDir();

    try {
      await use(cwd);
    } finally {
      await fs.remove(cwd);
    }
  },
});
