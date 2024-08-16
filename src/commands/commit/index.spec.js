import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { pEvent } from 'p-event';

import { Base } from '@/src/index.js';

export default tester({ 'allow-empty': { allowEmpty: true }, valid: {} }, [
  testerPluginTmpDir(),
  {
    transform: test => async () => {
      await fs.outputFile('foo.txt', '');
      await execaCommand('git init');
      await execaCommand('git config user.email "foo@bar.de"');
      await execaCommand('git config user.name "foo"');
      await execaCommand('git add .');
      const base = new Base();
      const childProcess = base.commit({ ...test, log: false });

      await pEvent(childProcess.stdout, 'data', data =>
        data.toString().includes('Select the type of change'),
      );

      childProcess.stdin.write('\n');

      await pEvent(childProcess.stdout, 'data', data =>
        data.toString().includes('What is the scope of this change'),
      );

      childProcess.stdin.write('config\n');

      await pEvent(childProcess.stdout, 'data', data =>
        data.toString().includes('Write a short, imperative tense description'),
      );

      childProcess.stdin.write('foo bar\n');

      await pEvent(childProcess.stdout, 'data', data =>
        data.toString().includes('Provide a longer description'),
      );

      childProcess.stdin.write('\n');

      await pEvent(childProcess.stdout, 'data', data =>
        data.toString().includes('Are there any breaking changes'),
      );

      childProcess.stdin.write('\n');

      await pEvent(childProcess.stdout, 'data', data =>
        data.toString().includes('Does this change affect any open issues'),
      );

      childProcess.stdin.write('\n');
      await childProcess;
      const output = await execaCommand('git log');
      expect(output.stdout).toMatch('feat(config): foo bar');
    },
  },
]);
