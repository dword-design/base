export default function () {
  return {
    image: `mcr.microsoft.com/devcontainers/javascript-node:0-${this.config.nodeVersion}`,
    name: 'Node.js',
    onCreateCommand: 'yarn --frozen-lockfile',
  }
}
