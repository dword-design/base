"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _filter = _interopRequireDefault(require("@dword-design/functions/dist/filter"));

var _fromPairs = _interopRequireDefault(require("@dword-design/functions/dist/from-pairs"));

var _keys = _interopRequireDefault(require("@dword-design/functions/dist/keys"));

var _map = _interopRequireDefault(require("@dword-design/functions/dist/map"));

var _globby2 = _interopRequireDefault(require("globby"));

var _ignore = _interopRequireDefault(require("ignore"));

var _config = _interopRequireDefault(require("../../config"));

var _generatedFiles = _interopRequireDefault(require("../../generated-files"));

var _gitignore = _interopRequireDefault(require("../../generated-files/gitignore"));

var _commonAllowedMatches = _interopRequireDefault(require("./common-allowed-matches.json"));

var _unknownFilesError = _interopRequireDefault(require("./unknown-files-error"));

var _configFiles;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const allowedMatches = [...(_configFiles = _generatedFiles.default, (0, _keys.default)(_configFiles)), ..._commonAllowedMatches.default, ..._config.default.allowedMatches];

var _default = async () => {
  var _ref, _globby;

  const unknownFiles = (_ref = (_globby = (0, _globby2.default)('**', {
    dot: true,
    gitignore: true,
    ignore: allowedMatches
  }), await _globby), (0, _filter.default)((0, _ignore.default)().add(_gitignore.default).createFilter())(_ref));

  if (unknownFiles.length > 0) {
    var _ref2, _unknownFiles;

    throw new _unknownFilesError.default((_ref2 = (_unknownFiles = unknownFiles, (0, _map.default)(file => [file, true])(_unknownFiles)), (0, _fromPairs.default)(_ref2)));
  }
};

exports.default = _default;
module.exports = exports.default;