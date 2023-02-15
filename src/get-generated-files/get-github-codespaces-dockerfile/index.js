import { endent } from '@dword-design/functions'

export default function () {
	return endent`
		FROM mcr.microsoft.com/devcontainers/universal

		RUN bash -c 'VERSION="${this.config.nodeVersion}" && source $HOME/.nvm/nvm.sh && nvm install $VERSION && nvm use $VERSION && nvm alias default $VERSION'
		RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix
	`
}
