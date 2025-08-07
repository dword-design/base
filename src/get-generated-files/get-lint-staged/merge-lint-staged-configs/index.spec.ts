import { expect, test } from '@playwright/test';

import self from '.';

test('merges non-overlapping globs', () => {
  const result = self(
    { '*.js': ['eslint --fix'] },
    { '*.css': ['stylelint --fix'] },
  );

  expect(result).toEqual({
    '*.css': 'stylelint --fix',
    '*.js': 'eslint --fix',
  });
});

test('merges overlapping globs with exact match', () => {
  const result = self(
    { '*.js': ['eslint --fix'] },
    { '*.js': ['prettier --write'] },
  );

  expect(result['*.js']).toEqual(
    expect.arrayContaining(['eslint --fix', 'prettier --write']),
  );
});

test('expands *.{js,ts} into separate globs and merges correctly', () => {
  const result = self(
    { '*.js': ['eslint --fix'] },
    { '*.{js,ts}': ['prettier --write'] },
  );

  expect(result).toEqual({
    '*.js': ['eslint --fix', 'prettier --write'],
    '*.ts': 'prettier --write',
  });
});

test('deduplicates commands', () => {
  const result = self(
    { '*.js': ['eslint --fix'] },
    { '*.js': ['eslint --fix', 'prettier --write'] },
  );

  expect(result['*.js'].filter(v => v === 'eslint --fix')).toHaveLength(1);
});

test('handles single string commands and arrays uniformly', () => {
  const result = self(
    { '*.js': 'eslint --fix' },
    { '*.js': ['prettier --write'] },
  );

  expect(result['*.js']).toEqual(
    expect.arrayContaining(['eslint --fix', 'prettier --write']),
  );
});

test('preserves brace patterns when no overlaps and merges overlapping extensions', () => {
  const result = self(
    { '*.{json,ts,vue}': 'eslint --fix --config eslint.lint-staged.config.ts' },
    { '*.{css,scss,vue}': 'stylelint --fix' },
  );

  expect(result).toEqual({
    '*.vue': [
      'eslint --fix --config eslint.lint-staged.config.ts',
      'stylelint --fix',
    ],
    '*.{css,scss}': 'stylelint --fix',
    '*.{json,ts}': 'eslint --fix --config eslint.lint-staged.config.ts',
  });
});

test('sorts keys', () => {
  const result = self(
    { '*.ts': ['prettier --write'] },
    { '*.js': ['eslint --fix'] },
  );

  expect(Object.keys(result)).toEqual(['*.js', '*.ts']);
});
