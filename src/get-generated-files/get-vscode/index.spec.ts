import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('valid', () =>
  expect(
    new Base({ editorIgnore: ['bar', 'foo'] }).getVscodeConfig(),
  ).toMatchSnapshot());
