import { endent } from '@dword-design/functions'
import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full.js'

import packageConfig from './package-config.mjs'

const parsed = spdxParse(packageConfig.license)

const license = spdxList[parsed.license]

export default endent`
  # License

  Unless stated otherwise all works are:

  Copyright &copy; ${packageConfig.author}

  and licensed under:

  [${license.name}](${license.url})

  ## ${license.name}

  ${license.licenseText}
`
