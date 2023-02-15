export default function () {
  return {
    name: 'Node.js',
    image: 'mcr.microsoft.com/devcontainers/universal:2',
    updateContentCommand: `nvm install ${this.config.nodeVersion} && yarn --frozen-lockfile`,
  }
}
