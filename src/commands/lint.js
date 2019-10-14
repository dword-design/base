const nodeEnv = require('@dword-design/node-env')
const getLang = require('../get-lang')
const { CLIEngine } = require('eslint')
const { exists } = require('fs-extra')
const LintError = require('../lint-error')

module.exports = {
  name: 'lint',
  description: 'Outputs linting errors',
  handler: async ({ log } = {}) => {
    const { eslintConfig } = getLang()
    const gitignoreExists = await exists('.gitignore')
    const eslint = new CLIEngine({
      baseConfig: eslintConfig,
      ...gitignoreExists ? { ignorePath: '.gitignore' } : {},
    })
    const report = eslint.executeOnFiles(['src'])
    const formatter = eslint.getFormatter()
    if (log) {
      console.log(formatter(report.results))
    }
    if (report.errorCount > 0) {
      throw new LintError()
    }
  },
  isEnabled: nodeEnv === 'development',
}
