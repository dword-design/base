const nodeEnv = require('@dword-design/node-env')
const getLang = require('../get-lang')
const { CLIEngine } = require('eslint')
const { exists } = require('fs-extra')
const LintError = require('../lint-error')
const reduce = require('@dword-design/functions/reduce')
const identity = require('@dword-design/functions/identity')
const getPlugins = require('../get-plugins')
const pipe = require('pipe-fns')

module.exports = {
  name: 'lint',
  description: 'Outputs linting errors',
  handler: async ({ log } = {}) => {
    const { eslintConfig } = getLang() || {}
    if (eslintConfig !== undefined) {
      const mappedEslintConfig = pipe(
        getPlugins(),
        reduce(
          (eslintConfig, { mapEslintConfig = identity }) => mapEslintConfig(eslintConfig),
          eslintConfig
        ),
      )
      const gitignoreExists = await exists('.gitignore')
      const eslint = new CLIEngine({
        baseConfig: mappedEslintConfig,
        ...gitignoreExists ? { ignorePath: '.gitignore' } : {},
      })
      const report = eslint.executeOnFiles(['.'])
      const formatter = eslint.getFormatter()
      if (log) {
        console.log(formatter(report.results))
      }
      if (report.errorCount > 0) {
        throw new LintError()
      }
    }
  },
  isEnabled: nodeEnv === 'development',
}
