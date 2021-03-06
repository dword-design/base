import { endent, join } from '@dword-design/functions'
import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'

import config from '@/src/config'

import packageConfig from './package-config'

export default {
  badges: () =>
    [
      ...(config.npmPublish
        ? [
            `[![npm version](https://img.shields.io/npm/v/${packageConfig.name}.svg)](https://npmjs.org/package/${packageConfig.name})`,
          ]
        : []),
      '![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)',
      `[![Build status](https://github.com/${packageConfig.repository}/workflows/build/badge.svg)](https://github.com/${packageConfig.repository}/actions)`,
      ...(config.useJobMatrix
        ? [
            `[![Coverage status](https://img.shields.io/coveralls/${packageConfig.repository})](https://coveralls.io/github/${packageConfig.repository})`,
          ]
        : []),
      `[![Dependency status](https://img.shields.io/david/${packageConfig.repository})](https://david-dm.org/${packageConfig.repository})`,
      '![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)',
      '',
      endent`
        <a href="https://gitpod.io/#https://github.com/dword-design/bar">
          <img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod">
        </a><a href="https://www.buymeacoffee.com/dword">
          <img
            src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
            alt="Buy Me a Coffee"
            height="32"
          >
        </a><a href="https://paypal.me/SebastianLandwehr">
          <img
            src="https://dword-design.de/images/paypal.svg"
            alt="PayPal"
            height="32"
          >
        </a><a href="https://www.patreon.com/dworddesign">
          <img
            src="https://dword-design.de/images/patreon.svg"
            alt="Patreon"
            height="32"
          >
        </a>
      `,
    ] |> join('\n'),
  description: () => packageConfig.description,
  install: () => config.readmeInstallString,
  license: () => {
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
  title: () => `# ${packageConfig.name}`,
}
