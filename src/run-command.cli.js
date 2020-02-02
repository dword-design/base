#!/usr/bin/env node

import { spawn } from 'child-process-promise'

(async () => {
  try {
    await spawn('base', [process.argv[2]], { stdio: 'inherit' })
  } catch (error) {
    process.exit(1)
  }
})()