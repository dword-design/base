"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _compact = _interopRequireDefault(require("@dword-design/functions/dist/compact"));

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _join = _interopRequireDefault(require("@dword-design/functions/dist/join"));

var _spdxExpressionParse = _interopRequireDefault(require("spdx-expression-parse"));

var _full = _interopRequireDefault(require("spdx-license-list/full"));

var _config = _interopRequireDefault(require("../../config"));

var _packageConfig = _interopRequireDefault(require("../package-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  badges: () => {
    var _ref;

    return (0, _endent.default)`
      <p>
        ${(_ref = [...(_config.default.npmPublish ? [(0, _endent.default)`
                <a href="https://npmjs.org/package/${_packageConfig.default.name}">
                  <img
                    src="https://img.shields.io/npm/v/${_packageConfig.default.name}.svg"
                    alt="npm version"
                  >
                </a>
              `] : []), '<img src="https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue" alt="Linux macOS Windows compatible">', (0, _endent.default)`
            <a href="https://github.com/${_packageConfig.default.repository}/actions">
              <img
                src="https://github.com/${_packageConfig.default.repository}/workflows/build/badge.svg"
                alt="Build status"
              >
            </a>
          `, (0, _endent.default)`
            <a href="https://codecov.io/gh/${_packageConfig.default.repository}">
              <img
                src="https://codecov.io/gh/${_packageConfig.default.repository}/branch/master/graph/badge.svg${_config.default.codecovGraphToken ? `?token=${_config.default.codecovGraphToken}` : ''}"
                alt="Coverage status"
              >
            </a>
          `, (0, _endent.default)`
            <a href="https://david-dm.org/${_packageConfig.default.repository}">
              <img src="https://img.shields.io/david/${_packageConfig.default.repository}" alt="Dependency status">
            </a>
          `, '<img src="https://img.shields.io/badge/renovate-enabled-brightgreen" alt="Renovate enabled">', '<br/>', (0, _endent.default)`
            <a href="https://gitpod.io/#https://github.com/${_packageConfig.default.repository}">
              <img
                src="https://gitpod.io/button/open-in-gitpod.svg"
                alt="Open in Gitpod"
                height="32"
              >
            </a>
          `, (0, _endent.default)`
            <a href="https://www.buymeacoffee.com/dword">
              <img
                src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
                alt="Buy Me a Coffee"
                height="32"
              >
            </a>
          `, (0, _endent.default)`
            <a href="https://paypal.me/SebastianLandwehr">
              <img
                src="https://sebastianlandwehr.com/images/paypal.svg"
                alt="PayPal"
                height="32"
              >
            </a>
          `, (0, _endent.default)`
            <a href="https://www.patreon.com/dworddesign">
              <img
                src="https://sebastianlandwehr.com/images/patreon.svg"
                alt="Patreon"
                height="32"
              >
            </a>
          `], (0, _join.default)('')(_ref))}
    </p>
  `;
  },
  description: () => _packageConfig.default.description || '',
  install: () => _config.default.readmeInstallString,
  license: () => {
    var _ref2, _ref3;

    return _ref2 = (_ref3 = [(0, _endent.default)`
      ## Contribute

      Are you missing something or want to contribute? Feel free to file an [issue](https://github.com/${_packageConfig.default.repository}/issues) or a [pull request](https://github.com/${_packageConfig.default.repository}/pulls)! ⚙️

      ## Support

      Hey, I am Sebastian Landwehr, a freelance web developer, and I love developing web apps and open source packages. If you want to support me so that I can keep packages up to date and build more helpful tools, you can donate here:

      <p>
        <a href="https://www.buymeacoffee.com/dword">
          <img
            src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
            alt="Buy Me a Coffee"
            height="32"
          >
        </a>&nbsp;If you want to send me a one time donation. The coffee is pretty good 😊.<br/>
        <a href="https://paypal.me/SebastianLandwehr">
          <img
            src="https://sebastianlandwehr.com/images/paypal.svg"
            alt="PayPal"
            height="32"
          >
        </a>&nbsp;Also for one time donations if you like PayPal.<br/>
        <a href="https://www.patreon.com/dworddesign">
          <img
            src="https://sebastianlandwehr.com/images/patreon.svg"
            alt="Patreon"
            height="32"
          >
        </a>&nbsp;Here you can support me regularly, which is great so I can steadily work on projects.
      </p>

      Thanks a lot for your support! ❤️
    `, (() => {
      if (_packageConfig.default.license) {
        const parsed = (0, _spdxExpressionParse.default)(_packageConfig.default.license);
        const license = _full.default[parsed.license];
        return (0, _endent.default)`
          ## License
      
          [${license.name}](${license.url}) © [Sebastian Landwehr](https://sebastianlandwehr.com)
        `;
      }

      return '';
    })()], (0, _compact.default)(_ref3)), (0, _join.default)('\n\n')(_ref2);
  },
  title: () => `# ${_packageConfig.default.name}`
};
exports.default = _default;
module.exports = exports.default;