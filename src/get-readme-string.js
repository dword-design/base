import { endent, replace, reduce } from '@dword-design/functions'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import replacements from './readme-replacements.config'

export default async packageConfig => {
  
  const readme = safeReadFileSync('README.md', 'utf8') ?? endent`
    <!-- TITLE -->

    <!-- BADGES -->

    <!-- DESCRIPTION -->

    <!-- INSTALL -->

    <!-- LICENSE -->

  `
  
  return replacements
    |> reduce(
      (readme, getReplacement, name) => {
        const sectionName = name.toUpperCase()
        return readme |> replace(
          getProjectzReadmeSectionRegex(sectionName),
          endent`
            <!-- ${sectionName}/ -->

            ${getReplacement(packageConfig)}
            
            <!-- /${sectionName} -->
          `,
        )
      },
      readme,
    )
}