import dedent from 'dedent';
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex';
import { readFileSync as safeReadFileSync } from 'safe-readfile';
import pathLib from 'node:path';

import replacements from '.';

export default function () {
  const readme =
    safeReadFileSync(pathLib.join(this.cwd, 'README.md'), 'utf8') ||
    dedent`
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
      dedent`
        <!-- ${sectionName}/ -->
        ${replacement.call(this)}
        <!-- /${sectionName} -->
      `,
    );
  }

  return result;
}
