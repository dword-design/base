export default function () {
  return {
    features: {
      'ghcr.io/devcontainers/features/docker-in-docker:2': {},
    },
    image: `mcr.microsoft.com/devcontainers/javascript-node:0-${this.config.nodeVersion}`,
    updateContentCommand: 'yarn --frozen-lockfile',
  }
}
