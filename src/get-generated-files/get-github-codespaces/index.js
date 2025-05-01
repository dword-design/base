export default function () {
  return {
    features: {
      'ghcr.io/devcontainers/features/desktop-lite:1': {},
      'ghcr.io/devcontainers/features/node:1': {
        version: this.config.nodeVersion,
      },
    },
    postCreateCommand:
      'COREPACK_INTEGRITY_KEYS=0 pnpm install --frozen-lockfile',
  };
}
