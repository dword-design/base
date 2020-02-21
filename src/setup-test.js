if (process.platform === 'win32') {
  global.before(() => {
    process.removeAllListeners('uncaughtException')
    process.on('uncaughtException', err => {
      if (err.code !== 'ECONNRESET') {
        throw err
      }
    })
  })
}