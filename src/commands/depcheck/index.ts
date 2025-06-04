import dedent from 'dedent';
import depcheck from 'depcheck';
import { isEmpty, mapValues, omit } from 'lodash-es';
import { Base } from '@/src';

declare module '@/src' {
  interface Base {
    depcheck(): void;
  }
}

Base.prototype.depcheck = async function () {
  const dependenciesResult = await depcheck(this.cwd, {
    package: omit(this.packageConfig, ['devDependencies']),
    skipMissing: true,
    ...this.config.depcheckConfig,
    ignorePatterns: [
      '*.spec.js',
      ...(this.config.testRunner === 'playwright'
        ? ['/fixtures', '/playwright.config.js']
        : ['/global-test-hooks.js']),
      'package.json',
      'eslint.config.js',
    ],
  });

  const devDependenciesResult = await depcheck(this.cwd, {
    package: omit(this.packageConfig, ['dependencies']),
    skipMissing: true,
    ...this.config.depcheckConfig,
    ignorePatterns: [
      '!*.spec.js',
      ...(this.config.testRunner === 'playwright'
        ? ['!/fixtures', '!/playwright.config.js']
        : ['!/global-test-hooks.js']),
      'eslint.config.js',
    ],
  });

  const result = {
    dependencies: dependenciesResult.dependencies,
    devDependencies: devDependenciesResult.devDependencies,
    invalidFiles: {
      ...dependenciesResult.invalidFiles,
      ...devDependenciesResult.invalidFiles,
    },
  };

  const errorMessage = [
    ...(result.dependencies.length > 0
      ? [
          dedent`
              Unused dependencies
              ${result.dependencies.map(dep => `* ${dep}`).join('\n')}
            `,
        ]
      : []),
    ...(result.devDependencies.length > 0
      ? [
          dedent`
              Unused devDependencies
              ${result.devDependencies.map(dep => `* ${dep}`).join('\n')}
            `,
        ]
      : []),
    ...(isEmpty(result.invalidFiles)
      ? []
      : [
          dedent`
              Invalid files
              ${Object.values(
                mapValues(
                  result.invalidFiles,
                  (error, name) => `* ${name}: ${error}`,
                ),
              ).join('\n')}
            `,
        ]),
  ].join('\n\n');

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}
