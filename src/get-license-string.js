import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'
import { endent } from '@dword-design/functions'

export default ({ author, license: licenseExpression }) => {
  
  const { license: licenseName } = spdxParse(licenseExpression)
  const license = spdxList[licenseName]
  
  return endent`
    # License

    Unless stated otherwise all works are:

    Copyright &copy; ${author}

    and licensed under:

    [${license.name}](${license.url})

    ## ${license.name}

    ${license.licenseText}
  `
}