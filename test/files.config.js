import packageConfig from './package.config'

export default {
  'package.json': JSON.stringify(packageConfig, undefined, 2) + '\n',
  'src/index.js': 'export default 1',
}
