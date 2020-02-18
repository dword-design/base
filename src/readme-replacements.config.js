import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'
import { endent, join } from '@dword-design/functions'

export default {
  title: ({ name }) => `# ${name}`,
  badges: ({ name, repository }) => [
    `[![NPM version](https://img.shields.io/npm/v/${name}.svg)](https://npmjs.org/package/${name})`,
    '![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)',
    '',
    `[![Build status](https://img.shields.io/github/workflow/status/${repository}/build)](https://github.com/${repository}/actions)`,
    `[![Coverage status](https://img.shields.io/coveralls/${repository})](https://coveralls.io/github/${repository})`,
    `[![Dependency status](https://img.shields.io/david/${repository})](https://david-dm.org/${repository})`,
    '![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)',
    '',
    `[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/${repository})`,
  ]
    |> join('\n'),
  description: ({ description }) => description,
  install: ({ name }) => endent`
    # Install

    \`\`\`bash
    # NPM
    $ npm install ${name}

    # Yarn
    $ yarn add ${name}
    \`\`\`
  `,
  license: ({ author, license: licenseExpression }) => {
    if (licenseExpression !== undefined) {
      const { license: licenseName } = spdxParse(licenseExpression)
      const license = spdxList[licenseName]
      
      return endent`
        # License

        Unless stated otherwise all works are:

        Copyright &copy; ${author}

        and licensed under:

        [${license.name}](${license.url})
      `
    }
    return ''
  },
}