import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';

test('valid', () => {
  const base = new Base({ editorIgnore: ['foo'] });
  expect(base.getEditorIgnoreConfig()).toMatchSnapshot();
});
