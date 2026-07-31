import depcheck from 'depcheck';
import endent from 'endent';
import { isEmpty, mapValues, omit } from 'lodash-es';

import type { Base } from '@/src';

export default async (base: Base) => {
  const dependenciesTypes = Object.keys(
    base.packageConfig.dependencies ?? {},
  ).filter(dependency => dependency.startsWith('@types/'));

  const dependenciesResult = await depcheck(base.cwd, {
    ignorePatterns: [
      '*.spec.ts',
      '/fixtures',
      '/playwright.config.ts',
      'package.json',
      'eslint.config.ts',
    ],
    package: omit(base.packageConfig, ['devDependencies']),
    ...base.config.depcheckConfig,
    skipMissing: true,
  });

  const developmentDependenciesResult = await depcheck(base.cwd, {
    ignorePatterns: [
      '!*.spec.ts',
      '!/fixtures',
      '!/playwright.config.ts',
      'eslint.config.ts',
    ],
    package: omit(base.packageConfig, ['dependencies']),
    ...base.config.depcheckConfig,
    skipMissing: true,
  });

  const result = {
    dependencies: dependenciesResult.dependencies,
    devDependencies: developmentDependenciesResult.devDependencies,
    invalidFiles: {
      ...dependenciesResult.invalidFiles,
      ...developmentDependenciesResult.invalidFiles,
    },
  };

  const errorMessage = [
    ...(dependenciesTypes.length > 0
      ? [
          endent`
            Types dependencies should be in devDependencies
            ${dependenciesTypes.map(dependency => `* ${dependency}`).join('\n')}
          `,
        ]
      : []),
    ...(result.dependencies.length > 0
      ? [
          endent`
            Unused dependencies
            ${result.dependencies.map(dependency => `* ${dependency}`).join('\n')}
          `,
        ]
      : []),
    ...(result.devDependencies.length > 0
      ? [
          endent`
            Unused devDependencies
            ${result.devDependencies.map(dependency => `* ${dependency}`).join('\n')}
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
};
