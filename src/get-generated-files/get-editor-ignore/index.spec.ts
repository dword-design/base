import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('valid', () => {
  const base = new Base({ editorIgnore: ['foo'] });

  expect(
    JSON.stringify(base.getEditorIgnoreConfig(), undefined, 2),
  ).toMatchSnapshot();
});
