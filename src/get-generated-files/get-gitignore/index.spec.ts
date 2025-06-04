import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('valid', () =>
  expect(
    JSON.stringify(
      new Base({ gitignore: ['foo'] }).getGitignoreConfig(),
      undefined,
      2,
    ),
  ).toMatchSnapshot());
