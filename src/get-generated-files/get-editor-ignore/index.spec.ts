import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';
import self from '.'

test('valid', () => {
  const base = new Base({ editorIgnore: ['foo'] });
  expect(self(base)).toMatchSnapshot();
});
