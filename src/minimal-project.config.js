import { endent, map, join, sortBy, identity } from '@dword-design/functions'
import minimalPackageConfig from './minimal-package.config'
import { readFileSync } from 'fs-extra'
import P from 'path'
import gitignoreConfig from './gitignore.config'

export default {
  '.gitignore': gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''),
  '.gitpod.yml': readFileSync(P.resolve(__dirname, 'config-files', 'gitpod.yml'), 'utf8'),
  '.renovaterc.json': readFileSync(P.resolve(__dirname, 'config-files', 'renovaterc.json'), 'utf8'),
  '.travis.yml': readFileSync(P.resolve(__dirname, 'config-files', 'travis.yml'), 'utf8'),
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
