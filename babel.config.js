const aliases = require('./aliases.config')

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 10 } }],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'fsharp' }],
    'babel-plugin-add-module-exports',
    ['babel-plugin-module-resolver', { alias: aliases }],
    ['babel-plugin-transform-imports', {
      '@dword-design/functions': { transform: "@dword-design/functions/${member}" },
    }],
  ],
}
