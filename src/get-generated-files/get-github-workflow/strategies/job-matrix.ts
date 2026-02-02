import pathLib from 'node:path';

import { constantCase } from 'change-case';
import { findUpStop, findUpSync } from 'find-up';
import fs from 'fs-extra';
import parsePackagejsonName from 'parse-packagejson-name';
import gitHubAction from 'tagged-template-noop';

import coverageSteps from '@/src/get-generated-files/get-github-workflow/steps/coverage';
import getReleaseSteps from '@/src/get-generated-files/get-github-workflow/steps/get-release';
import getTestSteps from '@/src/get-generated-files/get-github-workflow/steps/get-test';

export default function () {
  const envSchemaPath = findUpSync(
    path => {
      if (fs.existsSync(pathLib.join(path, '.env.schema.json'))) {
        return '.env.schema.json';
      }

      if (fs.existsSync(pathLib.join(path, 'package.json'))) {
        return findUpStop;
      }
    },
    { cwd: this.cwd },
  );

  const localEnvVariableNames = Object.keys(
    envSchemaPath ? fs.readJsonSync(envSchemaPath) : {},
  ).map(name => constantCase(name));

  const envVariables = {
    ...(this.config.doppler
      ? { DOPPLER_TOKEN: '${{ secrets.DOPPLER_TOKEN }}' }
      : Object.fromEntries(
          localEnvVariableNames.map(name => [name, `\${{ secrets.${name} }}`]),
        )),
  };

  const packageName = parsePackagejsonName(this.packageConfig.name).fullName;
  return {
    release: {
      needs: 'test',
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          uses: gitHubAction`actions/checkout@v4`,
          with: {
            lfs: true,
            ref: "${{ github.event.pull_request.head.repo.full_name == github.repository && github.event.pull_request.head.ref || '' }}",
          },
        },
        {
          uses: gitHubAction`actions/setup-node@v6`,
          with: { 'node-version': this.config.nodeVersion },
        },
        { run: 'corepack enable' },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'pnpm install --frozen-lockfile' },
        ...(this.config.doppler
          ? [
              {
                name: 'Install Doppler CLI',
                uses: gitHubAction`dword-design/doppler-cli-action-fork@fork`,
              },
            ]
          : []),
        {
          ...(Object.keys(envVariables).length > 0
            ? { env: envVariables }
            : {}),
          run: `${this.config.doppler ? `doppler run -p ${packageName} -c test -- ` : ''}pnpm lint`,
        },
        ...getReleaseSteps.call(this),
      ],
    },
    test: {
      'runs-on': '${{ matrix.os }}',
      steps: [
        {
          uses: gitHubAction`actions/checkout@v4`,
          with: {
            ...(this.config.fetchGitHistory && { 'fetch-depth': 0 }),
            lfs: true,
          },
        },
        {
          uses: gitHubAction`actions/setup-node@v6`,
          with: { 'check-latest': true, 'node-version': '${{ matrix.node }}' },
        },
        { run: 'corepack enable' },
        { run: 'pnpm install --frozen-lockfile' },
        ...getTestSteps.call(this),
        ...coverageSteps.map(step => ({
          if: `matrix.os == 'ubuntu-latest' && matrix.node == ${this.config.nodeVersion}`,
          ...step,
        })),
      ],
      strategy: {
        matrix: {
          include: [
            ...this.config.supportedNodeVersions.map(version => ({
              node: version,
              os: 'ubuntu-latest',
            })),
            ...(this.config.macos
              ? [{ node: this.config.nodeVersion, os: 'macos-latest' }]
              : []),
            ...(this.config.windows
              ? [{ node: this.config.nodeVersion, os: 'windows-latest' }]
              : []),
          ],
        },
      },
    },
  };
}
