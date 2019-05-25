module.exports = {
  hooks: {
    'pre-commit': `lint-staged --config ${require.resolve('@dword-design/base/src/lint-staged.config.js')}`,
  },
}
