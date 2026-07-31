import endent from 'endent';
import fs from 'fs-extra';

const packageConfig = fs.readJsonSync(
  new URL('../../../package.json', import.meta.url),
);

export default class extends Error {
  constructor(files: Record<string, true>) {
    super(endent`
      There are files in this repository that are not known to ${
        packageConfig.name
      }. Let's discuss about them in a PR!

      ${Object.keys(files)
        .map(file => `* ${file}`)
        .toSorted((a, b) => a.localeCompare(b))
        .join('\n')}
    `);
  }
}
