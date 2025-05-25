import P from 'node:path';

export default name => filePath =>
  (filePath |> P.basename) === 'package.json' &&
  name !== '@dword-design/base-config-node'
    ? [name]
    : [];
