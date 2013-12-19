/**
 * Tap formatter.
 *
 * @constructor
 */

function Tap() {}

/**
 * Setup.
 *
 * @param {Hydro} hydro
 * @api public
 */

Tap.prototype.use = function(hydro) {
  var i = 0;
  var self = this;
  var pass = 0;
  var fail = 0;

  hydro.on('pre:all', function(suite) {
    console.log('1..%d', hydro.tests().length);
  });

  hydro.on('post:test', function(test) {
    i++;
    switch (test.status) {
      case 'skipped':
        return console.log('ok %d %s # SKIP -', i, self.title(test));
      case 'pending':
        return console.log('ok %d %s # TODO -', i, self.title(test));
      case 'passed':
        pass++;
        return console.log('ok %d %s', i, self.title(test));
      case 'failed':
        fail++;
        console.log('not ok %d %s', i, self.title(test));
        console.log('  ', test.error.message);
        return;
    }
  });

  hydro.on('post:all', function() {
    console.log('# tests ' + (pass + fail));
    console.log('# pass ' + pass);
    console.log('# fail ' + fail);
  });
};

/**
 * Replace `#` with ` ` so the tap consumer
 * can't be confused.
 *
 * @param {Test} test
 * @returns {String}
 * @api private
 */

Tap.prototype.title = function(test) {
  return test.title.replace(/#/g, ' ');
};

/**
 * Primary export.
 */

module.exports = Tap;
