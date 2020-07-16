import { keys, map, zipObject } from '@dword-design/functions'
import { constantCase } from 'constant-case'
import findUp from 'find-up'

const envSchemaPath = findUp.sync('.env.schema.json')
const envVariableNames =
  (envSchemaPath ? require(envSchemaPath) : {}) |> keys |> map(constantCase)

export default [
  { run: 'yarn clean' },
  {
    run: 'yarn test',
    ...(envVariableNames.length > 0
      ? {
          env: zipObject(
            envVariableNames,
            envVariableNames |> map(name => `\${{ secrets.${name} }}`)
          ),
        }
      : {}),
  },
]
