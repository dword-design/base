import Ajv from 'ajv';
import endent from 'endent';

import type { Base } from '@/src';

import packageJsonSchema from './package-json-schema';

const ajv = new Ajv({ allowUnionTypes: true });
const validatePackageJson = ajv.compile(packageJsonSchema);

export default (base: Base) => {
  if (!validatePackageJson(base.packageConfig)) {
    throw new Error(endent`
      package.json invalid
      ${ajv.errorsText(validatePackageJson.errors)}
    `);
  }
};
