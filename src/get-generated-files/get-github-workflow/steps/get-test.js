import { fromPairs, keys, map } from '@dword-design/functions';
import { constantCase } from 'change-case';
import { findUpStop, findUpSync } from 'find-up';
import fs from 'fs-extra';
import P from 'path';
import gitHubAction from 'tagged-template-noop';

export default () => {
  const envSchemaPath = findUpSync(path => {
    if (fs.existsSync('.env.schema.json')) {
      return '.env.schema.json';
    }

    if (fs.existsSync(P.join(path, 'package.json'))) {
      return findUpStop;
    }

    return undefined;
  });

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
      run: 'yarn test',
    },
    {
      if: 'failure()',
      uses: gitHubAction`actions/upload-artifact@v3`,
      with: {
        name: 'Image Snapshot Diffs',
        path: '**/__image_snapshots__/__diff_output__',
      },
    },
  ];
};
