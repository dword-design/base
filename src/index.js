const pipe = require('pipe-fns')
const keyBy = require('@dword-design/functions/keyBy')
const mapValues = require('@dword-design/functions/mapValues')
const mapKeys = require('@dword-design/functions/mapKeys')
const { camelCase } = require('change-case')
const commands = require('./commands')
const LintError = require('./lint-error')

module.exports = {
  ...pipe(commands, keyBy('name'), mapKeys((config, name) => camelCase(name)), mapValues('handler')),
  LintError,
}
