import Ajv from 'ajv';
import endent from 'endent';

import packageJsonSchema from './package-json-schema';

const ajv = new Ajv({ allowUnionTypes: true });
const validatePackageJson = ajv.compile(packageJsonSchema);

export default function () {
  if (!validatePackageJson(this.packageConfig)) {
    throw new Error(endent`
      package.json invalid
      ${ajv.errorsText(validatePackageJson.errors)}
    `);
  }
}
