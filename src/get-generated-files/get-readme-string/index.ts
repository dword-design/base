import pathLib from 'node:path';

import endent from 'endent';
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex';
import { readFileSync as safeReadFileSync } from 'safe-readfile';

import replacements from './replacements';

export default function () {
  const readme =
    safeReadFileSync(pathLib.join(this.cwd, 'README.md'), 'utf8') ||
    endent`
      <!-- TITLE -->

      <!-- BADGES -->

      <!-- DESCRIPTION -->

      <!-- INSTALL -->

      <!-- LICENSE -->\n
    `;

  let result = readme;

  for (const [name, replacement] of Object.entries(replacements)) {
    const sectionName = name.toUpperCase();

    result = result.replace(
      getProjectzReadmeSectionRegex(sectionName),
      endent`
        <!-- ${sectionName}/ -->
        ${replacement.call(this)}
        <!-- /${sectionName} -->
      `,
    );
  }

  return result;
}
