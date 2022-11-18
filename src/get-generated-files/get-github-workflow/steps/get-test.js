import { fromPairs, keys, map } from '@dword-design/functions'
import { constantCase } from 'constant-case'
import findUp from 'find-up'
import { existsSync } from 'fs-extra'
import P from 'path'

export default () => {
  const envSchemaPath = findUp.sync(path => {
    if (existsSync('.env.schema.json')) {
      return '.env.schema.json'
    }
    if (existsSync(P.join(path, 'package.json'))) {
      return findUp.stop
    }

    return undefined
  })

  const envVariableNames =
    (envSchemaPath ? require(envSchemaPath) : {})
    |> keys
    |> map(name => `TEST_${name |> constantCase}`)

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
      uses: 'actions/upload-artifact@v3',
      with: {
        name: 'Image Snapshot Diffs',
        path: '**/__image_snapshots__/__diff_output__',
      },
    },
  ]
}
