import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('valid', () => {
  const base = new Base({ editorIgnore: ['foo'] });
  expect(base.getEditorIgnoreConfig()).toMatchSnapshot();
});
