import findYarnWorkspaceRoot from 'find-yarn-workspace-root'

export default [process.cwd(), null].includes(findYarnWorkspaceRoot())
