import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'
import { endent } from '@dword-design/functions'
import packageConfig from './package-config'

const { license: licenseName } = spdxParse(packageConfig.license)
const license = spdxList[licenseName]

export default endent`
  # License

  Unless stated otherwise all works are:

  Copyright &copy; ${packageConfig.author}

  and licensed under:

  [${license.name}](${license.url})

  ## ${license.name}

  ${license.licenseText}
`
