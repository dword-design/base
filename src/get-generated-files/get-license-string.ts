import endent from 'endent';
import spdxParse from 'spdx-expression-parse';
import spdxList from 'spdx-license-list/full.js';

export default function () {
  const parsed = spdxParse(this.packageConfig.license);
  const license = spdxList[parsed.license];
  return endent`
    # License

    Unless stated otherwise all works are:

    Copyright &copy; ${this.packageConfig.author}

    and licensed under:

    [${license.name}](${license.url})

    ## ${license.name}

    ${license.licenseText}
  `;
}
