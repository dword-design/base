import { endent } from '@functions'
import minimalPackageConfig from './minimal-package.config'

export default {
  'LICENSE.md': '<!-- LICENSEFILE -->\n',
  'package.json': JSON.stringify(minimalPackageConfig, undefined, 2) + '\n',
  'README.md': endent`
    <!-- TITLE -->

    <!-- BADGES -->

    <!-- DESCRIPTION -->

    <!-- INSTALL -->

    <!-- LICENSE -->
  ` + '\n',
  'src/index.js': 'export default 1',
}
