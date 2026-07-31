import pathLib from 'node:path';

import { constantCase } from 'change-case';
import { findUpStop, findUpSync } from 'find-up';
import fs from 'fs-extra';
import parsePackagejsonName from 'parse-packagejson-name';
import gitHubAction from 'tagged-template-noop';

import type { Base } from '@/src';
import coverageSteps from '@/src/get-generated-files/get-github-workflow/steps/coverage';
import getReleaseSteps from '@/src/get-generated-files/get-github-workflow/steps/get-release';
import getTestSteps from '@/src/get-generated-files/get-github-workflow/steps/get-test';

export default (
  base: Base,
  environments: Array<{ node: number; os: string }>,
) => {
  const environmentSchemaPath = findUpSync(
    path => {
      if (fs.existsSync(pathLib.join(path, '.env.schema.json'))) {
        return '.env.schema.json';
      }

      if (fs.existsSync(pathLib.join(path, 'package.json'))) {
        return findUpStop;
      }
    },
    { cwd: base.cwd },
  );

  const localEnvironmentVariableNames = Object.keys(
    environmentSchemaPath ? fs.readJsonSync(environmentSchemaPath) : {},
  ).map(name => constantCase(name));

  const environmentVariables = {
    ...(base.config.doppler
      ? { DOPPLER_TOKEN: '${{ secrets.DOPPLER_TOKEN }}' }
      : Object.fromEntries(
          localEnvironmentVariableNames.map(name => [
            name,
            `\${{ secrets.${name} }}`,
          ]),
        )),
  };

  const packageName = parsePackagejsonName(base.packageConfig.name).fullName;
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
          uses: gitHubAction`actions/setup-node@v4`,
          with: { 'node-version': base.config.nodeVersion },
        },
        { run: 'corepack enable' },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'pnpm install --frozen-lockfile' },
        ...(base.config.doppler
          ? [
              {
                name: 'Install Doppler CLI',
                uses: gitHubAction`dword-design/doppler-cli-action-fork@fork`,
              },
            ]
          : []),
        {
          ...(Object.keys(environmentVariables).length > 0 && {
            env: environmentVariables,
          }),
          run: `${base.config.doppler ? `doppler run -p ${packageName} -c test -- ` : ''}pnpm lint`,
        },
        ...getReleaseSteps(base),
      ],
    },
    test: {
      'runs-on': '${{ matrix.os }}',
      steps: [
        {
          uses: gitHubAction`actions/checkout@v4`,
          with: {
            ...(base.config.fetchGitHistory && { 'fetch-depth': 0 }),
            lfs: true,
          },
        },
        {
          uses: gitHubAction`actions/setup-node@v4`,
          with: { 'check-latest': true, 'node-version': '${{ matrix.node }}' },
        },
        { run: 'corepack enable' },
        { run: 'pnpm install --frozen-lockfile' },
        ...getTestSteps(base),
        ...coverageSteps.map(step => ({
          if: `matrix.os == 'ubuntu-latest'${base.config.supportedNodeVersions.length > 1 ? ` && matrix.node == ${base.config.nodeVersion}` : ''}`,
          ...step,
        })),
      ],
      strategy: { matrix: { include: environments } },
    },
  };
};
