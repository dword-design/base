import { expect, test } from '@playwright/test';

import self from '.';

test('valid', () => expect(self).toMatchSnapshot());
