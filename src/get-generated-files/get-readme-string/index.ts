import pathLib from 'node:path';

import endent from 'endent';
import fs from 'fs-extra';
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex';

import type { Base } from '@/src';

import replacements from './replacements';

export default (base: Base) => {
  const readme =
    (fs.existsSync(pathLib.join(base.cwd, 'README.md'))
      ? fs.readFileSync(pathLib.join(base.cwd, 'README.md'), 'utf8')
      : '') ||
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
      () => endent`
        <!-- ${sectionName}/ -->
        ${replacement(base)}
        <!-- /${sectionName} -->
      `,
    );
  }

  return result;
};
