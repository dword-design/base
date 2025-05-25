import {
  endent,
  isEmpty,
  join,
  map,
  mapValues,
  omit,
  values,
} from '@dword-design/functions';
import depcheck from 'depcheck';

export default async function () {
  const dependenciesResult = await depcheck('.', {
    package: this.packageConfig |> omit(['devDependencies']),
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

  const devDependenciesResult = await depcheck('.', {
    package: this.packageConfig |> omit(['dependencies']),
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

  const errorMessage =
    [
      ...(result.dependencies.length > 0
        ? [
            endent`
              Unused dependencies
              ${result.dependencies |> map(dep => `* ${dep}`) |> join('\n')}
            `,
          ]
        : []),
      ...(result.devDependencies.length > 0
        ? [
            endent`
              Unused devDependencies
              ${result.devDependencies |> map(dep => `* ${dep}`) |> join('\n')}
            `,
          ]
        : []),
      ...(isEmpty(result.invalidFiles)
        ? []
        : [
            endent`
              Invalid files
              ${
                result.invalidFiles
                |> mapValues((error, name) => `* ${name}: ${error}`)
                |> values
                |> join('\n')
              }
            `,
          ]),
    ] |> join('\n\n');

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}
