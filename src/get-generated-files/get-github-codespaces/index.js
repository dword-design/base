export default function () {
  return {
    onCreateCommand: `nvm use ${this.config.nodeVersion} && yarn --frozen-lockfile`,
  }
}
