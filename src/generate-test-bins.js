import P from 'path'
import { mapValues, split, map, join } from '@dword-design/functions'
import safeRequire from 'safe-require'
import linkBins from 'bin-links/lib/link-bins'

export default async () => linkBins({
  path: '.',
  binTarget: P.join('node_modules', '.bin'),
  pkg: {
    bin: (safeRequire(P.join(process.cwd(), 'package.json'))?.bin ?? {})
      |> mapValues(filename => filename
        |> split('/')
        |> map(segment => segment === 'dist' ? 'src' : segment)
        |> join('/'),
      ),
  },
  force: true,
})

