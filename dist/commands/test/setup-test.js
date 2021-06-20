"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = { ...(process.platform === 'win32' ? {
    before: () => {
      process.removeAllListeners('uncaughtException');
      process.on('uncaughtException', err => {
        if (err.code !== 'ECONNRESET') {
          throw err;
        }
      });
    }
  } : {})
};
exports.default = _default;
module.exports = exports.default;