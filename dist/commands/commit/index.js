import { execaCommand } from 'execa';
import { Base } from '@/src';
Base.prototype.commit = function (options) {
    options = {
        log: process.env.NODE_ENV !== 'test',
        stderr: 'inherit',
        ...options,
    };
    return execaCommand(`git-cz${options.allowEmpty ? ' --allow-empty' : ''}`, {
        cwd: this.cwd,
        ...(options.log && { stdout: 'inherit' }),
        stderr: options.stderr,
    });
};
