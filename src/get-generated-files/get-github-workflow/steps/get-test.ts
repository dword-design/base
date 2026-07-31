import pathLib from 'node:path';

import { constantCase } from 'change-case';
import { findUpStop, findUpSync } from 'find-up';
import fs from 'fs-extra';
import parsePackagejsonName from 'parse-packagejson-name';
import gitHubAction from 'tagged-template-noop';

import type { Base } from '@/src';

export default (base: Base) => {
  const environmentSchemaPath = findUpSync(
    path => {
      if (fs.existsSync(pathLib.join(path, '.env.schema.json'))) {
        return '.env.schema.json';
      }

      if (fs.existsSync(pathLib.join(path, 'package.json'))) {
        return findUpStop;
      }
    },
    { cwd: base.cwd },
  );

  const localEnvironmentVariableNames = Object.keys(
    environmentSchemaPath ? fs.readJsonSync(environmentSchemaPath) : {},
  ).map(name => constantCase(name));

  const environmentVariables = {
    ...(base.config.doppler
      ? { DOPPLER_TOKEN: '${{ secrets.DOPPLER_TOKEN }}' }
      : Object.fromEntries(
          localEnvironmentVariableNames.map(name => [
            name,
            `\${{ secrets.${name} }}`,
          ]),
        )),
    ...(base.config.githubActionsTypecheckMemoryLimitMb && {
      NODE_OPTIONS: `--max-old-space-size=${base.config.githubActionsTypecheckMemoryLimitMb}`,
    }),
  };

  const packageName = parsePackagejsonName(base.packageConfig.name).fullName;
  return [
    ...(base.config.doppler
      ? [
          {
            name: 'Install Doppler CLI',
            uses: gitHubAction`dword-design/doppler-cli-action-fork@fork`,
          },
        ]
      : []),
    {
      ...(Object.keys(environmentVariables).length > 0 && {
        env: environmentVariables,
      }),
      run: `${base.config.doppler ? `doppler run -p ${packageName} -c test -- ` : ''}pnpm verify`,
    },
    {
      if: 'always()',
      uses: gitHubAction`actions/upload-artifact@v4`,
      with: {
        'if-no-files-found': 'ignore',
        name: 'Data from tests',
        path: 'test-results/*/**',
      },
    },
  ];
};
