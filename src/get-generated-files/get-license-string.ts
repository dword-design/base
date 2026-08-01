import endent from 'endent';
import spdxParse from 'spdx-expression-parse';
import spdxList from 'spdx-license-list/full.js';

import type { Base } from '@/src';

export default (base: Base) => {
  const parsed = spdxParse(base.packageConfig.license) as spdxParse.LicenseInfo; // TODO: Is MIT
  const license = spdxList[parsed.license];
  return endent`
    # License

    Unless stated otherwise all works are:

    Copyright &copy; ${base.packageConfig.author}

    and licensed under:

    [${license.name}](${license.url})

    ## ${license.name}

    ${license.licenseText}
  `;
};
