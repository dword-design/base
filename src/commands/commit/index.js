import { execa } from 'execa';

export default function (options) {
  options = { log: process.env.NODE_ENV !== 'test', ...options };
  return execa('git-cz', [...(options.allowEmpty ? ['--allow-empty'] : [])], {
    cwd: this.cwd,
    [options.log ? 'stdio' : 'stderr']: 'inherit',
  });
};
