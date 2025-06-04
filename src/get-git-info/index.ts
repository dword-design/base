import * as pathLib from 'node:path';

import fs from 'fs-extra';
import hostedGitInfo from 'hosted-git-info';
import parseGitConfig from 'parse-git-config';

export default ({ cwd = '.' } = {}) => {
  if (!fs.existsSync(pathLib.join(cwd, '.git'))) {
    return;
  }

  const gitUrl = parseGitConfig.sync({ cwd })['remote "origin"']?.url;

  if (gitUrl === undefined) {
    return;
  }

  const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {};

  if (gitInfo.type !== 'github') {
    throw new Error('Only GitHub repositories are supported.');
  }

  return gitInfo;
};
