import { endent, join, last, map, split } from '@dword-design/functions'
import spdxParse from 'spdx-expression-parse'
import spdxList from 'spdx-license-list/full'

export default {
  badges: config =>
    endent`
      <p>
        ${
          [
            ...(config.npmPublish && !config.package.private
              ? [
                  endent`
                <a href="https://npmjs.org/package/${config.package.name}">
                  <img
                    src="https://img.shields.io/npm/v/${config.package.name}.svg"
                    alt="npm version"
                  >
                </a>
              `,
                ]
              : []),
            '<img src="https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue" alt="Linux macOS Windows compatible">',
            endent`
            <a href="https://github.com/${config.package.repository}/actions">
              <img
                src="https://github.com/${config.package.repository}/workflows/build/badge.svg"
                alt="Build status"
              >
            </a>
          `,
            endent`
            <a href="https://codecov.io/gh/${config.package.repository}">
              <img
                src="https://codecov.io/gh/${
                  config.package.repository
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
            <a href="https://david-dm.org/${config.package.repository}">
              <img src="https://img.shields.io/david/${config.package.repository}" alt="Dependency status">
            </a>
          `,
            '<img src="https://img.shields.io/badge/renovate-enabled-brightgreen" alt="Renovate enabled">',
            '<br/>',
            endent`
            <a href="https://gitpod.io/#https://github.com/${config.package.repository}">
              <img
                src="https://gitpod.io/button/open-in-gitpod.svg"
                alt="Open in Gitpod"
                width="114"
              >
            </a>
          `,
            endent`
            <a href="https://www.buymeacoffee.com/dword">
              <img
                src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
                alt="Buy Me a Coffee"
                width="114"
              >
            </a>
          `,
            endent`
            <a href="https://paypal.me/SebastianLandwehr">
              <img
                src="https://sebastianlandwehr.com/images/paypal.svg"
                alt="PayPal"
                width="163"
              >
            </a>
          `,
            endent`
            <a href="https://www.patreon.com/dworddesign">
              <img
                src="https://sebastianlandwehr.com/images/patreon.svg"
                alt="Patreon"
                width="163"
              >
            </a>
          `,
          ] |> join('')
        }
    </p>
  `,
  description: config => config.package.description || '',
  install: config => config.readmeInstallString,
  license: config =>
    [
      endent`
      ## Contribute

      Are you missing something or want to contribute? Feel free to file an [issue](https://github.com/${config.package.repository}/issues) or a [pull request](https://github.com/${config.package.repository}/pulls)! ⚙️

      ## Support

      Hey, I am Sebastian Landwehr, a freelance web developer, and I love developing web apps and open source packages. If you want to support me so that I can keep packages up to date and build more helpful tools, you can donate here:

      <p>
        <a href="https://www.buymeacoffee.com/dword">
          <img
            src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
            alt="Buy Me a Coffee"
            width="114"
          >
        </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
        <a href="https://paypal.me/SebastianLandwehr">
          <img
            src="https://sebastianlandwehr.com/images/paypal.svg"
            alt="PayPal"
            width="163"
          >
        </a>&nbsp;Also for one time donations if you like PayPal.<br/>
        <a href="https://www.patreon.com/dworddesign">
          <img
            src="https://sebastianlandwehr.com/images/patreon.svg"
            alt="Patreon"
            width="163"
          >
        </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
      </p>

      Thanks a lot for your support! ❤️
    `,
      ...(config.seeAlso.length > 0
        ? [
            endent`
            ## See also

            ${
              config.seeAlso
              |> map(entry => {
                const parts = entry.repository |> split('/')

                const owner = parts.length >= 2 ? parts[0] : 'dword-design'

                const name = parts |> last

                return `* [${name}](https://github.com/${owner}/${name}): ${entry.description}`
              })
              |> join('\n')
            }
          `,
          ]
        : []),
      config.package.license
        ? [
            (() => {
              const parsed = spdxParse(config.package.license)

              const license = spdxList[parsed.license]

              return endent`
      ## License
  
      [${license.name}](${license.url}) © [Sebastian Landwehr](https://sebastianlandwehr.com)
    `
            })(),
          ]
        : [],
    ] |> join('\n\n'),
  title: config => `# ${config.package.name}`,
}
