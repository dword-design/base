export default function () {
  return {
    image: `mcr.microsoft.com/devcontainers/javascript-node:1-${this.config.nodeVersion}`,
    postCreateCommand:
      'COREPACK_INTEGRITY_KEYS=0 pnpm install --frozen-lockfile',
  };
}
