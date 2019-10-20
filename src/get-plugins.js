const resolveDep = require('resolve-dep')
const pipe = require('pipe-fns')
const unary = require('@dword-design/functions/unary')
const mapValues = require('@dword-design/functions/mapValues')
const values = require('@dword-design/functions/values')

module.exports = () => pipe(
  resolveDep(['base-plugin-*', '@*/base-plugin-*']),
  mapValues(unary(require)),
  values,
)
