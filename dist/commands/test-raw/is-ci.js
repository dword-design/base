import { execaCommandSync } from 'execa';
export default ({ cwd = '.' } = {}) => {
    try {
        execaCommandSync('is-ci', { cwd });
        return true;
    }
    catch {
        return false;
    }
};
