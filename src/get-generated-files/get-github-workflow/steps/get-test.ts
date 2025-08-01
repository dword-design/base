import pathLib from 'node:path';

import { constantCase } from 'change-case';
import { findUpStop, findUpSync } from 'find-up';
import fs from 'fs-extra';
import parsePackagejsonName from 'parse-packagejson-name';
import gitHubAction from 'tagged-template-noop';

export default function () {
  const envSchemaPath = findUpSync(
    path => {
      if (fs.existsSync(pathLib.join(path, '.env.schema.json'))) {
        return '.env.schema.json';
      }

      if (fs.existsSync(pathLib.join(path, 'package.json'))) {
        return findUpStop;
      }
    },
    { cwd: this.cwd },
  );

  const envVariableNames = Object.keys(
    envSchemaPath ? fs.readJsonSync(envSchemaPath) : {},
  ).map(name => constantCase(name));

  const packageName = parsePackagejsonName(this.packageConfig.name).fullName;
  return [
    ...(this.config.doppler
      ? [
          {
            name: 'Install Doppler CLI',
            uses: gitHubAction`dword-design/doppler-cli-action-fork@fork`,
          },
        ]
      : []),
    {
      env: {
        ...(this.config.doppler
          ? { DOPPLER_TOKEN: '${{ secrets.DOPPLER_TOKEN }}' }
          : Object.fromEntries(
              envVariableNames.map(name => [name, `\${{ secrets.${name} }}`]),
            )),
        GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
      },
      run: `${this.config.doppler ? `doppler run -p ${packageName} -c test -- ` : ''}pnpm verify`,
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
}
