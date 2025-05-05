export default function () {
  return {
    postCreateCommand: `echo 'nvm install ${this.config.nodeVersion}' >> ~/.bashrc && COREPACK_INTEGRITY_KEYS=0 pnpm install --frozen-lockfile`,
  };
}
