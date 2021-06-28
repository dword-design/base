import { endent, reduce, replace } from '@dword-design/functions'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'

import packageConfig from '@/src/generated-files/package-config'

import replacements from './replacements'

const readme =
  safeReadFileSync('README.md', 'utf8') ||
  endent`
  <!-- TITLE -->

  <!-- BADGES -->

  <!-- DESCRIPTION -->

  <!-- INSTALL -->

  <!-- LICENSE -->

`

export default async () =>
  replacements
  |> reduce(async (current, getReplacement, name) => {
    const sectionName = name.toUpperCase()

    return (
      current
      |> await
      |> replace(
        getProjectzReadmeSectionRegex(sectionName),
        endent`
        <!-- ${sectionName}/ -->
        ${getReplacement(packageConfig) |> await}
        <!-- /${sectionName} -->
      `
      )
    )
  }, readme)
  |> await
