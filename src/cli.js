#!/usr/bin/env node

(async () => {
  const { spawn } = require('child-process-promise')
  const commandName = process.argv.slice(2)

  try {
    switch (commandName) {
      case 'build': {
        await spawn('eslint', ['--config', require.resolve('./eslintrc')])
        await spawn('babel', ['--out-dir', 'dist', '--config-file', require.resolve('./babel.config'), 'src'], { stdio: 'inherit' })
        break
      }
      case 'start': spawn('babel', ['src', 'watch', '--out-dir', 'dist'], { stdio: 'inherit' }); break
    }
  } catch (error) {
    if (error.name === 'ChildProcessError') {
      process.exit()
    } else {
      throw error
    }
  }
})()
