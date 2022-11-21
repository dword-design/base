import { endent, reduce, replace } from '@dword-design/functions'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'

import replacements from './replacements.js'

export default function () {
  const readme =
    safeReadFileSync('README.md', 'utf8') ||
    endent`
      <!-- TITLE -->

      <!-- BADGES -->

      <!-- DESCRIPTION -->

      <!-- INSTALL -->

      <!-- LICENSE -->

    `

  return (
    replacements
    |> reduce((current, replacement, name) => {
      const sectionName = name.toUpperCase()

      return (
        current
        |> replace(
          getProjectzReadmeSectionRegex(sectionName),
          endent`
            <!-- ${sectionName}/ -->
            ${replacement.call(this)}
            <!-- /${sectionName} -->
          `
        )
      )
    }, readme)
  )
}
