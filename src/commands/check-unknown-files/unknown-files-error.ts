import endent from 'endent';
import fs from 'fs-extra';
import { identity, sortBy } from 'lodash-es';

const packageConfig = fs.readJsonSync(
  new URL('../../../package.json', import.meta.url),
);

export default class extends Error {
  constructor(files) {
    super(endent`
      There are files in this repository that are not known to ${
        packageConfig.name
      }. Let's discuss about them in a PR!

      ${sortBy(
        Object.keys(files).map(file => `* ${file}`),
        identity,
      ).join('\n')}
    `);
  }
}
