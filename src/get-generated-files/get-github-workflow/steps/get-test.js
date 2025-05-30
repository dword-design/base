import pathLib from 'node:path';

import { endent, fromPairs, keys, map } from '@dword-design/functions';
import { constantCase } from 'change-case';
import { findUpStop, findUpSync } from 'find-up';
import fs from 'fs-extra';
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

  const envVariableNames =
    (envSchemaPath ? fs.readJsonSync(envSchemaPath) : {})
    |> keys
    |> map(name => `TEST_${name |> constantCase}`);

  return [
    {
      env: {
        ...(envVariableNames
          |> map(name => [name, `\${{ secrets.${name} }}`])
          |> fromPairs),
        GH_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
      },
      run: 'pnpm test',
    },
    {
      if: 'always()',
      uses: gitHubAction`actions/upload-artifact@v4`,
      with: {
        'if-no-files-found': 'ignore',
        name: 'Images from tests',
        path: endent`
          **/__image_snapshots__/__diff_output__
          test-results/*/**
        `,
      },
    },
  ];
}
