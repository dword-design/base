import * as pathLib from 'node:path';

export default name => filePath =>
  pathLib.basename(filePath) === 'package.json' &&
  name !== '@dword-design/base-config-node'
    ? [name]
    : [];
