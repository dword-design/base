const path = require('path')

module.exports = () => require(path.resolve(process.env.INIT_CWD, 'package.json')).base || {}
