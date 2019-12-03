import { map, filter, keys, compact, flatMap, flatten, groupBy, mapValues, uniq } from '@functions'

export default (node, deps) => {
  if (node.type === 'CallExpression'
    && node.callee?.type === 'Identifier'
    && node.callee?.name === 'spawn'
    && node.arguments?.[0].type === 'StringLiteral'
  ) {
    const binaryPackageMap = deps
      |> flatMap(dep => {
        const { name, bin = {} } = require(`${dep}/package.json`)
        const binaries = typeof bin === 'string' ? [name] : bin |> keys
        return binaries |> map(binary => ({ dep, binary }))
      })
      |> groupBy('binary')
      |> mapValues(tuples => tuples |> map('dep'))

    const segments = [
      node.arguments[0].value,
      ...node.arguments?.[1].type === 'ArrayExpression'
        ? node.arguments[1].elements |> filter({ type: 'StringLiteral' }) |> map('value')
        : [],
    ]
    return segments |> map(segment => binaryPackageMap[segment]) |> compact |> flatten |> uniq
  }
  return []
}
