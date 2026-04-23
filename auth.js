// Project root shim for tests
// Expose utils/auth.js as auth.js for existing test files that require('../auth.js')
module.exports = require('./utils/auth.js');
