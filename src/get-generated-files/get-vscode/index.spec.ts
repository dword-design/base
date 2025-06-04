import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('valid', () =>
  expect(
    JSON.stringify(
      new Base({ editorIgnore: ['bar', 'foo'] }).getVscodeConfig(),
      undefined,
      2,
    ),
  ).toMatchSnapshot());
