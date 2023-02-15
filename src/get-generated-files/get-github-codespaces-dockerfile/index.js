import { endent } from '@dword-design/functions'

export default function () {
	return endent`
		FROM mcr.microsoft.com/devcontainers/universal

		RUN nvm install $VERSION && nvm use $VERSION && nvm alias default $VERSION'
	`
}
