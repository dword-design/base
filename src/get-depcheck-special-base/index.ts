import pathLib from 'node:path';

export default (name?: string) => (filePath: string) =>
  name !== '@dword-design/base-config-node' &&
  pathLib.basename(filePath) === 'package.json'
    ? [name]
    : [];
