import { identity, sortBy } from 'lodash-es';
export default function () {
    return sortBy([
        '.DS_Store',
        '/.env.json',
        '/.test.env.json',
        '/.nyc_output',
        '/coverage',
        '/node_modules',
        ...(this.config.testRunner === 'playwright' ? ['/test-results'] : []),
        ...this.config.gitignore,
    ], identity);
}
