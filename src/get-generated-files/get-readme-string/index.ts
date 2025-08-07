import pathLib from 'node:path';

import endent from 'endent';
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex';
import fs from 'fs-extra';
import type { Base } from '@/src';

import replacements from './replacements';

export default function (this: Base): string {
  let readme = endent`
    <!-- TITLE -->

    <!-- BADGES -->

    <!-- DESCRIPTION -->

    <!-- INSTALL -->

    <!-- LICENSE -->\n
  `;
  try {
    readme = fs.readFileSync(pathLib.join(this.cwd, 'README.md'), 'utf8');
  } catch {}

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
