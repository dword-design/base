import { expect, test } from '@playwright/test';

import self from '.';

test('valid', () =>
  expect(JSON.stringify(self, undefined, 2)).toMatchSnapshot());
