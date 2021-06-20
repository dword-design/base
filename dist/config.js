"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _identity = _interopRequireDefault(require("@dword-design/functions/dist/identity"));

var _depcheck = _interopRequireDefault(require("depcheck"));

var _depcheckDetectorExeca = _interopRequireDefault(require("depcheck-detector-execa"));

var _depcheckDetectorPackageName = _interopRequireDefault(require("depcheck-detector-package-name"));

var _depcheckParserBabel = _interopRequireDefault(require("depcheck-parser-babel"));

var _importCwd = _interopRequireDefault(require("import-cwd"));

var _depcheckSpecialBaseConfig = _interopRequireDefault(require("./depcheck-special-base-config"));

var _packageBaseConfig = _interopRequireDefault(require("./package-base-config"));

var _packageConfig = _interopRequireDefault(require("./package-config"));

var _baseConfig$depcheckC, _baseConfig$depcheckC2, _baseConfig$depcheckC3;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const baseConfig = (0, _importCwd.default)(_packageBaseConfig.default.name);
var _default = {
  allowedMatches: [],
  commands: {},
  coverageFileExtensions: [],
  deployAssets: [],
  deployEnv: {},
  deployPlugins: [],
  editorIgnore: [],
  gitignore: [],
  lint: _identity.default,
  nodeVersion: 14,
  preDeploySteps: [],
  prepare: _identity.default,
  readmeInstallString: (0, _endent.default)`
    ## Install

    \`\`\`bash
    # npm
    $ npm install ${_packageBaseConfig.default.global ? '-g ' : ''}${_packageConfig.default.name}

    # Yarn
    $ yarn ${_packageBaseConfig.default.global ? 'global ' : ''}add ${_packageConfig.default.name}
    \`\`\`
  `,
  ...baseConfig,
  ..._packageBaseConfig.default,
  depcheckConfig: {
    ignorePath: '.gitignore',
    ...baseConfig.depcheckConfig,
    ..._packageBaseConfig.default.depcheckConfig,
    detectors: [_depcheck.default.detector.importDeclaration, _depcheck.default.detector.requireCallExpression, _depcheck.default.detector.requireResolveCallExpression, _depcheckDetectorExeca.default, _depcheckDetectorPackageName.default, ...(((_baseConfig$depcheckC = baseConfig.depcheckConfig) === null || _baseConfig$depcheckC === void 0 ? void 0 : _baseConfig$depcheckC.detectors) || [])],
    parsers: {
      '**/*.js': _depcheckParserBabel.default,
      ...((_baseConfig$depcheckC2 = baseConfig.depcheckConfig) === null || _baseConfig$depcheckC2 === void 0 ? void 0 : _baseConfig$depcheckC2.parsers)
    },
    specials: [_depcheckSpecialBaseConfig.default, _depcheck.default.special.bin, ...(((_baseConfig$depcheckC3 = baseConfig.depcheckConfig) === null || _baseConfig$depcheckC3 === void 0 ? void 0 : _baseConfig$depcheckC3.specials) || [])]
  }
};
exports.default = _default;
module.exports = exports.default;