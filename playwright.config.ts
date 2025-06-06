import { defineConfig } from '@playwright/test';

export default defineConfig({
  //fullyParallel: true,
  workers: 1,
  timeout: 60_000,
  preserveOutput: 'failures-only',
  snapshotPathTemplate:
    '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
});
