#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const findUp = require('find-up')
const readPkgUp = require('read-pkg-up')

readPkgUp()
  .then(({ path: packagePath }) => path.dirname(packagePath))
  .then(packagePath => Promise.all([
    fs.readFile(path.resolve(packagePath, 'src/gitignore'), 'utf8'),
    findUp('.base.gitignore')
      .then(filePath => filePath !== undefined ? fs.readFile(filePath, 'utf8') : ''),
  ])
    .then(([
      gitignore,
      additions,
    ]) => fs.writeFile(
      `${packagePath}/gitignore-merged`,
      `${gitignore}\r\n${additions}`,
    ))
)
