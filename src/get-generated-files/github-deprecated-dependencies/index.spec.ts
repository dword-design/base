import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import self from '.';

test('valid', () => expect(self).toMatchSnapshot());
