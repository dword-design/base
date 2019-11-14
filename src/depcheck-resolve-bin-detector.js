import { map } from '@functions'
import { readlinkSync } from 'fs'
import getPackageName from 'get-package-name'
import { resolve } from 'path'

const getBinaries = node => {
  if (node.type === 'CallExpression'
    && node.callee.type === 'MemberExpression'
    && node.callee.object.name === 'resolveBin'
    && node.callee.property.name === 'sync'
  ) {
    const binaryNode = (node.arguments[1] ?? {})?.executable ?? node.arguments[0]
    if (binaryNode !== undefined && binaryNode.type === 'StringLiteral') {
      return [binaryNode.value]
    }
  }
  return []
}

export default node => getBinaries(node) |> map(binaryName => {
  const binaryPath = resolve('node_modules', '.bin', readlinkSync(resolve('node_modules', '.bin', binaryName)))
  return getPackageName(binaryPath)
})
