import { endent } from '@dword-design/functions'

export default function () {
	return endent`
		FROM mcr.microsoft.com/devcontainers/universal

		RUN nvm install ${this.config.nodeVersion}
    RUN nvm use ${this.config.nodeVersion}
    RUN nvm alias default ${this.config.nodeVersion}
	`
}
