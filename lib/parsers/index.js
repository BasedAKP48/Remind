const Parser = require('./parser');
/**
 * @type {Parser[]}
 */
const parsers = [];
add(require('./top'));
add(require('./at'));
add(require('./super'));
add(require('./korobi'));
add(require('./math'));
add(require('./moment'));
add(require('./named'));

module.exports = (string, now) => new Promise((res) => {
  const resolved = parsers.some((parser) => {
    if (parser.test(string)) {
      const value = parser.parse(string, now);
      if (value || value === 0) { // Let 0 go through
        res(value);
        return true;
      }
    }
    return false;
  });
  if (resolved) return;
  throw new Error(`Unknown input: ${string}`);
});

function add(parser) {
  if (parser instanceof Parser) {
    parsers.push(parser);
  }
}
