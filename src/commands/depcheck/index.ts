import depcheck from 'depcheck';
import endent from 'endent';
import { isEmpty, mapValues, omit } from 'lodash-es';

export default async function () {
  const dependenciesResult = await depcheck(this.cwd, {
    package: omit(this.packageConfig, ['devDependencies']),
    skipMissing: true,
    ...this.config.depcheckConfig,
    ignorePatterns: [
      '*.spec.ts',
      '/fixtures',
      '/playwright.config.ts',
      'package.json',
      'eslint.config.ts',
    ],
  });

  const devDependenciesResult = await depcheck(this.cwd, {
    package: omit(this.packageConfig, ['dependencies']),
    skipMissing: true,
    ...this.config.depcheckConfig,
    ignorePatterns: [
      '!*.spec.ts',
      '!/fixtures',
      '!/playwright.config.ts',
      'eslint.config.ts',
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
          endent`
            Unused dependencies
            ${result.dependencies.map(dep => `* ${dep}`).join('\n')}
          `,
        ]
      : []),
    ...(result.devDependencies.length > 0
      ? [
          endent`
            Unused devDependencies
            ${result.devDependencies.map(dep => `* ${dep}`).join('\n')}
          `,
        ]
      : []),
    ...(isEmpty(result.invalidFiles)
      ? []
      : [
          endent`
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
