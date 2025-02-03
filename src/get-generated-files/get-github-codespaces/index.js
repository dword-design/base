export default function () {
  return {
    features: { 'ghcr.io/devcontainers/features/docker-in-docker:2': {} },
    image: `mcr.microsoft.com/devcontainers/javascript-node:1-${this.config.nodeVersion}`,
    updateContentCommand: 'COREPACK_INTEGRITY_KEYS=0 pnpm install --frozen-lockfile',
  };
}
