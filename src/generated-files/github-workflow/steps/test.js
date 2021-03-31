import { fromPairs, keys, map } from '@dword-design/functions'
import { constantCase } from 'constant-case'
import findUp from 'find-up'

const envSchemaPath = findUp.sync('.env.schema.json')

const envVariableNames =
  (envSchemaPath ? require(envSchemaPath) : {})
  |> keys
  |> map(name => `TEST_${name |> constantCase}`)

export default [
  {
    run: 'yarn test',
    ...(envVariableNames.length > 0
      ? {
          env:
            envVariableNames
            |> map(name => [name, `\${{ secrets.${name} }}`])
            |> fromPairs,
        }
      : {}),
  },
  {
    if: 'failure()',
    uses: 'actions/upload-artifact@v2',
    with: {
      path: '**/__image_snapshots__/__diff_output__',
    },
  },
]
