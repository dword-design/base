import { endent } from '@functions'

export default {
  'LICENSE.md': '<!-- LICENSEFILE/ -->\n',
  'package.json': JSON.stringify({
    license: 'MIT',
    name: 'foo',
    repository: 'bar/foo',
  }),
  'README.md': endent`
    <!-- TITLE -->

    <!-- BADGES -->

    <!-- DESCRIPTION -->

    <!-- INSTALL -->

    <!-- LICENSE -->
  ` + '\n',
  'src/index.js': 'export default 1',
}
