#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')

spawn(require.resolve('lint-staged'), ['--config', path.resolve(__dirname, 'lint-staged.config.js')], { stdio: 'inherit' })
