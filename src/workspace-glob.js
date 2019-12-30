import P from 'path'
import safeRequire from 'safe-require'

export default safeRequire(P.join(process.cwd(), 'package.json'))?.workspaces
