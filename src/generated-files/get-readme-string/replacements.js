import { endent, join, map } from '@dword-design/functions'
import { Octokit } from '@octokit/rest'
import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'

import config from '@/src/config'
import packageConfig from '@/src/generated-files/package-config'

const octokit = new Octokit()

export default {
  badges: () =>
    endent`
      <p>
        ${
          [
            ...(config.npmPublish
              ? [
                  endent`
                <a href="https://npmjs.org/package/${packageConfig.name}">
                  <img
                    src="https://img.shields.io/npm/v/${packageConfig.name}.svg"
                    alt="npm version"
                  >
                </a>
              `,
                ]
              : []),
            '<img src="https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue" alt="Linux macOS Windows compatible">',
            endent`
            <a href="https://github.com/${packageConfig.repository}/actions">
              <img
                src="https://github.com/${packageConfig.repository}/workflows/build/badge.svg"
                alt="Build status"
              >
            </a>
          `,
            endent`
            <a href="https://codecov.io/gh/${packageConfig.repository}">
              <img
                src="https://codecov.io/gh/${
                  packageConfig.repository
                }/branch/master/graph/badge.svg${
              config.codecovGraphToken
                ? `?token=${config.codecovGraphToken}`
                : ''
            }"
                alt="Coverage status"
              >
            </a>
          `,
            endent`
            <a href="https://david-dm.org/${packageConfig.repository}">
              <img src="https://img.shields.io/david/${packageConfig.repository}" alt="Dependency status">
            </a>
          `,
            '<img src="https://img.shields.io/badge/renovate-enabled-brightgreen" alt="Renovate enabled">',
            '<br/>',
            endent`
            <a href="https://gitpod.io/#https://github.com/${packageConfig.repository}">
              <img
                src="https://gitpod.io/button/open-in-gitpod.svg"
                alt="Open in Gitpod"
                height="32"
              >
            </a>
          `,
            endent`
            <a href="https://www.buymeacoffee.com/dword">
              <img
                src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
                alt="Buy Me a Coffee"
                height="32"
              >
            </a>
          `,
            endent`
            <a href="https://paypal.me/SebastianLandwehr">
              <img
                src="https://sebastianlandwehr.com/images/paypal.svg"
                alt="PayPal"
                height="32"
              >
            </a>
          `,
            endent`
            <a href="https://www.patreon.com/dworddesign">
              <img
                src="https://sebastianlandwehr.com/images/patreon.svg"
                alt="Patreon"
                height="32"
              >
            </a>
          `,
          ] |> join('')
        }
    </p>
  `,
  description: () => packageConfig.description || '',
  install: () => config.readmeInstallString,
  license: async () =>
    [
      endent`
      ## Contribute

      Are you missing something or want to contribute? Feel free to file an [issue](https://github.com/${packageConfig.repository}/issues) or a [pull request](https://github.com/${packageConfig.repository}/pulls)! ⚙️

      ## Support

      Hey, I am Sebastian Landwehr, a freelance web developer, and I love developing web apps and open source packages. If you want to support me so that I can keep packages up to date and build more helpful tools, you can donate here:

      <p>
        <a href="https://www.buymeacoffee.com/dword">
          <img
            src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
            alt="Buy Me a Coffee"
            height="32"
          >
        </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
        <a href="https://paypal.me/SebastianLandwehr">
          <img
            src="https://sebastianlandwehr.com/images/paypal.svg"
            alt="PayPal"
            height="32"
          >
        </a>&nbsp;Also for one time donations if you like PayPal.<br/>
        <a href="https://www.patreon.com/dworddesign">
          <img
            src="https://sebastianlandwehr.com/images/patreon.svg"
            alt="Patreon"
            height="32"
          >
        </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
      </p>

      Thanks a lot for your support! ❤️
    `,
      ...(config.seeAlso.length > 0
        ? [
            await (async () => {
              const repos =
                config.seeAlso
                |> map(seeAlso => {
                  let parts = seeAlso.split('/')
                  if (parts.length <= 1) {
                    parts = ['dword-design', ...parts]
                  }

                  return octokit.rest.repos.get({
                    owner: parts[0],
                    repo: parts[1],
                  })
                })
                |> Promise.all
                |> await

              return endent`
          ## See Also

          ${
            repos
            |> map('data')
            |> map(
              repo => `* [${repo.name}](${repo.html_url}): ${repo.description}`
            )
            |> join('\n')
          }
        `
            })(),
          ]
        : []),
      packageConfig.license
        ? [
            (() => {
              const parsed = spdxParse(packageConfig.license)

              const license = spdxList[parsed.license]

              return endent`
      ## License
  
      [${license.name}](${license.url}) © [Sebastian Landwehr](https://sebastianlandwehr.com)
    `
            })(),
          ]
        : [],
    ] |> join('\n\n'),
  title: () => `# ${packageConfig.name}`,
}
