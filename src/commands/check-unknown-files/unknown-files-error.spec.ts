import { expect, test } from '@playwright/test';
import endent from 'endent';

import self from './unknown-files-error';

test('works', () => {
  expect(
    new self(
      Object.fromEntries(['foo.txt', 'bar.txt'].map(file => [file, true])),
    ).message,
  ).toEqual(endent`
    There are files in this repository that are not known to @dword-design/base. Let's discuss about them in a PR!

    * bar.txt
    * foo.txt
  `);
});
