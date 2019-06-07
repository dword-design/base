const path = require('path')

module.exports = (content, filePath) => {
  const filename = path.basename(filePath)

  if (filename === 'package.json') {
    const packageConfig = JSON.parse(content)
    return packageConfig.typeName !== undefined ? [`@dword-design/base-type-${packageConfig.typeName}`] : []
  }
  return []
}
