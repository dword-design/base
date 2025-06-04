import packageName from 'depcheck-package-name';
export default function () {
    return {
        plugins: [
            '@semantic-release/commit-analyzer',
            '@semantic-release/release-notes-generator',
            packageName `@semantic-release/changelog`,
            this.config.npmPublish
                ? packageName `@semantic-release/npm`
                : [packageName `@semantic-release/npm`, { npmPublish: false }],
            [
                packageName `@semantic-release/github`,
                {
                    ...(this.config.deployAssets.length > 0 && {
                        assets: this.config.deployAssets,
                    }),
                    successComment: false,
                },
            ],
            [
                packageName `@semantic-release/git`,
                {
                    message: 'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
                },
            ],
            ...this.config.deployPlugins,
        ],
    };
}
