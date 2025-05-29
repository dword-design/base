import { execa } from 'execa';

export default (options) => {
  options = { cwd = '.', log: NODE_ENV !== 'test', ...options };

  return execa('git-cz', [...(options.allowEmpty ? ['--allow-empty'] : [])], {
    cwd: options.cwd,
    [options.log ? 'stdio' : 'stderr']: 'inherit',
  });
}
