export default {
  ...(process.platform === 'win32'
    ? {
        before: () => {
          process.removeAllListeners('uncaughtException')
          process.on('uncaughtException', err => {
            if (err.code !== 'ECONNRESET') {
              throw err
            }
          })
        },
      }
    : {}),
}
