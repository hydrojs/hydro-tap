;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("hydro-tap/index.js", function(exports, require, module){
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

  hydro.on('pre:all', function() {
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
    console.log();
    console.log(fail ? 'not ok' : 'ok');
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

});
require.alias("hydro-tap/index.js", "hydro-tap/index.js");if (typeof exports == "object") {
  module.exports = require("hydro-tap");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("hydro-tap"); });
} else {
  this["hydro-tap"] = require("hydro-tap");
}})();