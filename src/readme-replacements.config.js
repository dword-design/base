import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'
import { split, endent, join } from '@dword-design/functions'

export default {
  title: ({ name }) => `# ${name}`,
  badges: ({ name, repository }) => [
    `[![NPM version](https://img.shields.io/npm/v/${name}.svg)](https://npmjs.org/package/${name})`,
    ...repository !== undefined
      ? [(() => {
        const [userName, repoName] = repository |> split('/')
        return endent`
          [![Build status](https://img.shields.io/github/workflow/status/${userName}/${repoName}/build)](https://github.com/${userName}/${repoName}/actions)
          [![Coverage status](https://img.shields.io/coveralls/${userName}/${repoName})](https://coveralls.io/github/${userName}/${repoName}?branch=master)
          [![Dependency status](https://img.shields.io/david/${userName}/${repoName})](https://david-dm.org/${userName}/${repoName})
          ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)

          [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/${userName}/${repoName})
        `
      })()]
      : [],
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