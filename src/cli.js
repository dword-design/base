#!/usr/bin/env node

const makeCli = require('make-cli')

const commands = require('./commands')

makeCli({ commands })
