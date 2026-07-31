import defu from '@dword-design/defu';

import type { Base } from '@/src';

export default (base: Base) =>
  defu(base.config.typescriptConfig, {
    compilerOptions: {
      declaration: true,
      esModuleInterop: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      ...(base.config.hasTypescriptConfigRootAlias && {
        paths: { '@/*': ['./*'] },
      }),
      skipLibCheck: true,
      strict: true,
      target: 'ESNext',
    },
    exclude: ['test-results'],
  });
