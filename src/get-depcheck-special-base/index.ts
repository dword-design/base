import pathLib from 'node:path';

export default name => filePath =>
  name !== '@dword-design/base-config-node' &&
  pathLib.basename(filePath) === 'package.json'
    ? [name]
    : [];
