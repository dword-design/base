"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _endent = _interopRequireDefault(require("@dword-design/functions/dist/endent"));

var _identity = _interopRequireDefault(require("@dword-design/functions/dist/identity"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _depcheck = _interopRequireDefault(require("depcheck"));

var _depcheckDetectorExeca = _interopRequireDefault(require("depcheck-detector-execa"));

var _depcheckDetectorPackageName = _interopRequireDefault(require("depcheck-detector-package-name"));

var _depcheckParserBabel = _interopRequireDefault(require("depcheck-parser-babel"));

var _importCwd = _interopRequireDefault(require("import-cwd"));

var _depcheckSpecialBaseConfig = _interopRequireDefault(require("./depcheck-special-base-config"));

var _packageConfig = _interopRequireDefault(require("./package-config"));

var _rawConfig = _interopRequireDefault(require("./raw-config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const inheritedConfig = (0, _importCwd.default)(_rawConfig.default.name);

var _default = _deepmerge.default.all([{
  allowedMatches: [],
  commands: {},
  coverageFileExtensions: [],
  depcheckConfig: {
    detectors: [_depcheck.default.detector.importDeclaration, _depcheck.default.detector.requireCallExpression, _depcheck.default.detector.requireResolveCallExpression, _depcheckDetectorExeca.default, _depcheckDetectorPackageName.default],
    ignorePath: '.gitignore',
    parsers: {
      '**/*.js': _depcheckParserBabel.default
    },
    specials: [_depcheckSpecialBaseConfig.default, _depcheck.default.special.bin]
  },
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
      $ npm install ${_rawConfig.default.global ? '-g ' : ''}${_packageConfig.default.name}

      # Yarn
      $ yarn ${_rawConfig.default.global ? 'global ' : ''}add ${_packageConfig.default.name}
      \`\`\`
    `,
  seeAlso: [],
  syncKeywords: true
}, inheritedConfig, _rawConfig.default]);

exports.default = _default;
module.exports = exports.default;