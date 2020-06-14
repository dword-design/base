import { endent, reduce, replace } from '@dword-design/functions'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'

import packageConfig from './package-config'
import replacements from './readme-replacements.config'

const readme =
  safeReadFileSync('README.md', 'utf8') ||
  endent`
  <!-- TITLE -->

  <!-- BADGES -->

  <!-- DESCRIPTION -->

  <!-- INSTALL -->

  <!-- LICENSE -->

`

export default replacements
  |> reduce((current, getReplacement, name) => {
    const sectionName = name.toUpperCase()
    return (
      current
      |> replace(
        getProjectzReadmeSectionRegex(sectionName),
        endent`
          <!-- ${sectionName}/ -->
          ${getReplacement(packageConfig)}
          <!-- /${sectionName} -->
        `
      )
    )
  }, readme)
