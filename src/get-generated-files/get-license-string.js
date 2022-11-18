import { endent } from '@dword-design/functions'
import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'

export default function () {
  const parsed = spdxParse(this.config.package.license)

  const license = spdxList[parsed.license]

  return endent`
    # License

    Unless stated otherwise all works are:

    Copyright &copy; ${this.config.package.author}

    and licensed under:

    [${license.name}](${license.url})

    ## ${license.name}

    ${license.licenseText}
  `
}
