import { endent, map, join, sortBy, identity } from '@dword-design/functions'
import minimalPackageConfig from './minimal-package.config'
import gitignoreConfig from './gitignore.config'

export default {
  '.gitignore': gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''),
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
