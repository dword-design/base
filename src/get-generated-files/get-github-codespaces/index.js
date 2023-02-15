export default function () {
	return {
		"image": `mcr.microsoft.com/devcontainers/javascript-node:0-${this.config.nodeVersion}`,
		"features": {
			"ghcr.io/devcontainers/features/docker-in-docker:2": {}
		},
		updateContentCommand: 'yarn --frozen-lockfile',
	}
}
