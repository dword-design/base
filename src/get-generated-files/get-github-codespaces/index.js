export default function () {
  return {
    image: 'universal',
    onCreateCommand: `nvm use ${this.config.nodeVersion} && yarn --frozen-lockfile`,
  }
}
