import { endent, join } from '@dword-design/functions'
import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'

export default {
  badges: packageConfig => endent`
    [![NPM version](https://img.shields.io/npm/v/${packageConfig.name}.svg)](https://npmjs.org/package/${packageConfig.name})
    ![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)
    [![Build status](https://img.shields.io/github/workflow/status/${packageConfig.repository}/build)](https://github.com/${packageConfig.repository}/actions)
    [![Coverage status](https://img.shields.io/coveralls/${packageConfig.repository})](https://coveralls.io/github/${packageConfig.repository})
    [![Dependency status](https://img.shields.io/david/${packageConfig.repository})](https://david-dm.org/${packageConfig.repository})
    ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)

    <a href="https://www.buymeacoffee.com/dword">
      <img
        src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
        alt="Buy Me a Coffee"
        height="32"
      >
    </a><a href="https://gitpod.io/#https://github.com/${packageConfig.repository}">
      <img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod">
    </a>
    <a href="https://paypal.me/SebastianLandwehr">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
        alt="PayPal"
        height="30"
      >
    </a>
  `,
  description: packageConfig => packageConfig.description,
  install: packageConfig => endent`
    ## Install

    \`\`\`bash
    # NPM
    $ npm install ${packageConfig.name}

    # Yarn
    $ yarn add ${packageConfig.name}
    \`\`\`
  `,
  license: packageConfig => {
    if (packageConfig.license) {
      const parsed = spdxParse(packageConfig.license)
      const license = spdxList[parsed.license]
      return endent`
        ## License

        Unless stated otherwise all works are:

        Copyright &copy; ${packageConfig.author}

        and licensed under:

        [${license.name}](${license.url})
      `
    }
    return ''
  },
  title: packageConfig => `# ${packageConfig.name}`,
}
