(function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { const a = typeof require === "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); const f = new Error(`Cannot find module '${o}'`); throw f.code = "MODULE_NOT_FOUND", f; } const l = n[o] = { exports: {} }; t[o][0].call(l.exports, (e) => { const n = t[o][1][e]; return s(n || e); }, l, l.exports, e, t, n, r); } return n[o].exports; } var i = typeof require === "function" && require; for (let o = 0; o < r.length; o++)s(r[o]); return s; }({ "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\events\\events.js": [function(require, module, exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

  function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;
  }
  module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!isNumber(n) || n < 0 || isNaN(n)) { throw TypeError("n must be a positive number"); }
    this._maxListeners = n;
    return this;
  };

  EventEmitter.prototype.emit = function(type) {
    let er,
      handler,
      len,
      args,
      i,
      listeners;

    if (!this._events) { this._events = {}; }

  // If there is no 'error' event listener then throw.
    if (type === "error") {
      if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
        er = arguments[1];
        if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
        // At least give some kind of context to the user
          const err = new Error(`Uncaught, unspecified "error" event. (${er})`);
          err.context = er;
          throw err;
        }
      }
    }

    handler = this._events[type];

    if (isUndefined(handler)) { return false; }

    if (isFunction(handler)) {
      switch (arguments.length) {
      // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
      // slower
        default:
          args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
    } else if (isObject(handler)) {
      args = Array.prototype.slice.call(arguments, 1);
      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++) { listeners[i].apply(this, args); }
    }

    return true;
  };

  EventEmitter.prototype.addListener = function(type, listener) {
    let m;

    if (!isFunction(listener)) { throw TypeError("listener must be a function"); }

    if (!this._events) { this._events = {}; }

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
    if (this._events.newListener) {
      this.emit("newListener", type,
              isFunction(listener.listener) ?
              listener.listener : listener);
    }

    if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    { this._events[type] = listener; } else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    { this._events[type].push(listener); } else
    // Adding the second element, need to change to array.
    { this._events[type] = [this._events[type], listener]; }

  // Check for listener leak
    if (isObject(this._events[type]) && !this._events[type].warned) {
      if (!isUndefined(this._maxListeners)) {
        m = this._maxListeners;
      } else {
        m = EventEmitter.defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error("(node) warning: possible EventEmitter memory " +
                    "leak detected. %d listeners added. " +
                    "Use emitter.setMaxListeners() to increase limit.",
                    this._events[type].length);
        if (typeof console.trace === "function") {
        // not supported in IE 10
          console.trace();
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.once = function(type, listener) {
    if (!isFunction(listener)) { throw TypeError("listener must be a function"); }

    let fired = false;

    function g() {
      this.removeListener(type, g);

      if (!fired) {
        fired = true;
        listener.apply(this, arguments);
      }
    }

    g.listener = listener;
    this.on(type, g);

    return this;
  };

// emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener = function(type, listener) {
    let list,
      position,
      length,
      i;

    if (!isFunction(listener)) { throw TypeError("listener must be a function"); }

    if (!this._events || !this._events[type]) { return this; }

    list = this._events[type];
    length = list.length;
    position = -1;

    if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
      delete this._events[type];
      if (this._events.removeListener) { this.emit("removeListener", type, listener); }
    } else if (isObject(list)) {
      for (i = length; i-- > 0;) {
        if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }

      if (position < 0) { return this; }

      if (list.length === 1) {
        list.length = 0;
        delete this._events[type];
      } else {
        list.splice(position, 1);
      }

      if (this._events.removeListener) { this.emit("removeListener", type, listener); }
    }

    return this;
  };

  EventEmitter.prototype.removeAllListeners = function(type) {
    let key,
      listeners;

    if (!this._events) { return this; }

  // not listening for removeListener, no need to emit
    if (!this._events.removeListener) {
      if (arguments.length === 0) { this._events = {}; } else if (this._events[type]) { delete this._events[type]; }
      return this;
    }

  // emit removeListener for all listeners on all events
    if (arguments.length === 0) {
      for (key in this._events) {
        if (key === "removeListener") continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners("removeListener");
      this._events = {};
      return this;
    }

    listeners = this._events[type];

    if (isFunction(listeners)) {
      this.removeListener(type, listeners);
    } else if (listeners) {
    // LIFO order
      while (listeners.length) { this.removeListener(type, listeners[listeners.length - 1]); }
    }
    delete this._events[type];

    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    let ret;
    if (!this._events || !this._events[type]) { ret = []; } else if (isFunction(this._events[type])) { ret = [this._events[type]]; } else { ret = this._events[type].slice(); }
    return ret;
  };

  EventEmitter.prototype.listenerCount = function(type) {
    if (this._events) {
      const evlistener = this._events[type];

      if (isFunction(evlistener)) { return 1; } else if (evlistener) { return evlistener.length; }
    }
    return 0;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    return emitter.listenerCount(type);
  };

  function isFunction(arg) {
    return typeof arg === "function";
  }

  function isNumber(arg) {
    return typeof arg === "number";
  }

  function isObject(arg) {
    return typeof arg === "object" && arg !== null;
  }

  function isUndefined(arg) {
    return arg === void 0;
  }
}, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\EventListener.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @typechecks
 */

      const emptyFunction = require("./emptyFunction");

/**
 * Upstream version of event listener. Does not take into account specific
 * nature of platform.
 */
      const EventListener = {
  /**
   * Listen to DOM events during the bubble phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
        listen: function listen(target, eventType, callback) {
          if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
            return {
              remove: function remove() {
              target.removeEventListener(eventType, callback, false);
            },
            };
          } else if (target.attachEvent) {
            target.attachEvent(`on${eventType}`, callback);
            return {
            remove: function remove() {
              target.detachEvent(`on${eventType}`, callback);
            },
          };
          }
        },

  /**
   * Listen to DOM events during the capture phase.
   *
   * @param {DOMEventTarget} target DOM element to register listener on.
   * @param {string} eventType Event type, e.g. 'click' or 'mouseover'.
   * @param {function} callback Callback function.
   * @return {object} Object with a `remove` method.
   */
        capture: function capture(target, eventType, callback) {
          if (target.addEventListener) {
            target.addEventListener(eventType, callback, true);
            return {
              remove: function remove() {
              target.removeEventListener(eventType, callback, true);
            },
            };
          }
          if (process.env.NODE_ENV !== "production") {
            console.error("Attempted to listen to events during the capture phase on a " + "browser that does not support the capture phase. Your application " + "will not receive some events.");
          }
          return {
            remove: emptyFunction,
          };
        },

        registerDefault: function registerDefault() {},
      };

      module.exports = EventListener;
    }).call(this, require("_process"));
  }, { "./emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
    const ExecutionEnvironment = {

      canUseDOM,

      canUseWorkers: typeof Worker !== "undefined",

      canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

      canUseViewport: canUseDOM && !!window.screen,

      isInWorker: !canUseDOM, // For now, this is true - might change in the future.

    };

    module.exports = ExecutionEnvironment;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\camelize.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

    const _hyphenPattern = /-(.)/g;

/**
 * Camelcases a hyphenated string, for example:
 *
 *   > camelize('background-color')
 *   < "backgroundColor"
 *
 * @param {string} string
 * @return {string}
 */
    function camelize(string) {
      return string.replace(_hyphenPattern, (_, character) => {
        return character.toUpperCase();
      });
    }

    module.exports = camelize;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\camelizeStyleName.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */


    const camelize = require("./camelize");

    const msPattern = /^-ms-/;

/**
 * Camelcases a hyphenated CSS property name, for example:
 *
 *   > camelizeStyleName('background-color')
 *   < "backgroundColor"
 *   > camelizeStyleName('-moz-transition')
 *   < "MozTransition"
 *   > camelizeStyleName('-ms-transition')
 *   < "msTransition"
 *
 * As Andi Smith suggests
 * (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
 * is converted to lowercase `ms`.
 *
 * @param {string} string
 * @return {string}
 */
    function camelizeStyleName(string) {
      return camelize(string.replace(msPattern, "ms-"));
    }

    module.exports = camelizeStyleName;
  }, { "./camelize": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\camelize.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\containsNode.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */

    const isTextNode = require("./isTextNode");

/* eslint-disable no-bitwise */

/**
 * Checks if a given DOM node contains or is another DOM node.
 */
    function containsNode(outerNode, innerNode) {
      if (!outerNode || !innerNode) {
        return false;
      } else if (outerNode === innerNode) {
        return true;
      } else if (isTextNode(outerNode)) {
        return false;
      } else if (isTextNode(innerNode)) {
        return containsNode(outerNode, innerNode.parentNode);
      } else if ("contains" in outerNode) {
        return outerNode.contains(innerNode);
      } else if (outerNode.compareDocumentPosition) {
      return !!(outerNode.compareDocumentPosition(innerNode) & 16);
    }
      return false;
    }

    module.exports = containsNode;
  }, { "./isTextNode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\isTextNode.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\createArrayFromMixed.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

      const invariant = require("./invariant");

/**
 * Convert array-like objects to arrays.
 *
 * This API assumes the caller knows the contents of the data type. For less
 * well defined inputs use createArrayFromMixed.
 *
 * @param {object|function|filelist} obj
 * @return {array}
 */
      function toArray(obj) {
        const length = obj.length;

  // Some browsers builtin objects can report typeof 'function' (e.g. NodeList
  // in old versions of Safari).
        !(!Array.isArray(obj) && (typeof obj === "object" || typeof obj === "function")) ? process.env.NODE_ENV !== "production" ? invariant(false, "toArray: Array-like object expected") : invariant(false) : void 0;

        !(typeof length === "number") ? process.env.NODE_ENV !== "production" ? invariant(false, "toArray: Object needs a length property") : invariant(false) : void 0;

        !(length === 0 || length - 1 in obj) ? process.env.NODE_ENV !== "production" ? invariant(false, "toArray: Object should have keys for indices") : invariant(false) : void 0;

        !(typeof obj.callee !== "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "toArray: Object can't be `arguments`. Use rest params " + "(function(...args) {}) or Array.from() instead.") : invariant(false) : void 0;

  // Old IE doesn't give collections access to hasOwnProperty. Assume inputs
  // without method will throw during the slice call and skip straight to the
  // fallback.
        if (obj.hasOwnProperty) {
          try {
            return Array.prototype.slice.call(obj);
          } catch (e) {
      // IE < 9 does not support Array#slice on collections objects
          }
        }

  // Fall back to copying key by key. This assumes all keys have a value,
  // so will not preserve sparsely populated inputs.
        const ret = Array(length);
        for (let ii = 0; ii < length; ii++) {
          ret[ii] = obj[ii];
        }
        return ret;
      }

/**
 * Perform a heuristic test to determine if an object is "array-like".
 *
 *   A monk asked Joshu, a Zen master, "Has a dog Buddha nature?"
 *   Joshu replied: "Mu."
 *
 * This function determines if its argument has "array nature": it returns
 * true if the argument is an actual array, an `arguments' object, or an
 * HTMLCollection (e.g. node.childNodes or node.getElementsByTagName()).
 *
 * It will return false for other array-like objects like Filelist.
 *
 * @param {*} obj
 * @return {boolean}
 */
      function hasArrayNature(obj) {
        return (
    // not null/false
    !!obj && (
    // arrays are objects, NodeLists are functions in Safari
    typeof obj === "object" || typeof obj === "function") &&
    // quacks like an array
    "length" in obj &&
    // not window
    !("setInterval" in obj) &&
    // no DOM node should be considered an array-like
    // a 'select' element has 'length' and 'item' properties on IE8
    typeof obj.nodeType !== "number" && (
    // a real array
    Array.isArray(obj) ||
    // arguments
    "callee" in obj ||
    // HTMLCollection/NodeList
    "item" in obj)
  );
      }

/**
 * Ensure that the argument is an array by wrapping it in an array if it is not.
 * Creates a copy of the argument if it is already an array.
 *
 * This is mostly useful idiomatically:
 *
 *   var createArrayFromMixed = require('createArrayFromMixed');
 *
 *   function takesOneOrMoreThings(things) {
 *     things = createArrayFromMixed(things);
 *     ...
 *   }
 *
 * This allows you to treat `things' as an array, but accept scalars in the API.
 *
 * If you need to convert an array-like object, like `arguments`, into an array
 * use toArray instead.
 *
 * @param {*} obj
 * @return {array}
 */
      function createArrayFromMixed(obj) {
        if (!hasArrayNature(obj)) {
          return [obj];
        } else if (Array.isArray(obj)) {
          return obj.slice();
        }
        return toArray(obj);
      }

      module.exports = createArrayFromMixed;
    }).call(this, require("_process"));
  }, { "./invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\createNodesFromMarkup.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

/* eslint-disable fb-www/unsafe-html*/

      const ExecutionEnvironment = require("./ExecutionEnvironment");

      const createArrayFromMixed = require("./createArrayFromMixed");
      const getMarkupWrap = require("./getMarkupWrap");
      const invariant = require("./invariant");

/**
 * Dummy container used to render all markup.
 */
      const dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement("div") : null;

/**
 * Pattern used by `getNodeName`.
 */
      const nodeNamePattern = /^\s*<(\w+)/;

/**
 * Extracts the `nodeName` of the first element in a string of markup.
 *
 * @param {string} markup String of markup.
 * @return {?string} Node name of the supplied markup.
 */
      function getNodeName(markup) {
        const nodeNameMatch = markup.match(nodeNamePattern);
        return nodeNameMatch && nodeNameMatch[1].toLowerCase();
      }

/**
 * Creates an array containing the nodes rendered from the supplied markup. The
 * optionally supplied `handleScript` function will be invoked once for each
 * <script> element that is rendered. If no `handleScript` function is supplied,
 * an exception is thrown if any <script> elements are rendered.
 *
 * @param {string} markup A string of valid HTML markup.
 * @param {?function} handleScript Invoked once for each rendered <script>.
 * @return {array<DOMElement|DOMTextNode>} An array of rendered nodes.
 */
      function createNodesFromMarkup(markup, handleScript) {
        let node = dummyNode;
        !dummyNode ? process.env.NODE_ENV !== "production" ? invariant(false, "createNodesFromMarkup dummy not initialized") : invariant(false) : void 0;
        const nodeName = getNodeName(markup);

        const wrap = nodeName && getMarkupWrap(nodeName);
        if (wrap) {
          node.innerHTML = wrap[1] + markup + wrap[2];

          let wrapDepth = wrap[0];
          while (wrapDepth--) {
            node = node.lastChild;
          }
        } else {
          node.innerHTML = markup;
        }

        const scripts = node.getElementsByTagName("script");
        if (scripts.length) {
          !handleScript ? process.env.NODE_ENV !== "production" ? invariant(false, "createNodesFromMarkup(...): Unexpected <script> element rendered.") : invariant(false) : void 0;
          createArrayFromMixed(scripts).forEach(handleScript);
        }

        const nodes = Array.from(node.childNodes);
        while (node.lastChild) {
          node.removeChild(node.lastChild);
        }
        return nodes;
      }

      module.exports = createNodesFromMarkup;
    }).call(this, require("_process"));
  }, { "./ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "./createArrayFromMixed": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\createArrayFromMixed.js", "./getMarkupWrap": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getMarkupWrap.js", "./invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */

    function makeEmptyFunction(arg) {
      return function() {
        return arg;
      };
    }

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
    const emptyFunction = function emptyFunction() {};

    emptyFunction.thatReturns = makeEmptyFunction;
    emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
    emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
    emptyFunction.thatReturnsNull = makeEmptyFunction(null);
    emptyFunction.thatReturnsThis = function() {
      return this;
    };
    emptyFunction.thatReturnsArgument = function(arg) {
      return arg;
    };

    module.exports = emptyFunction;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyObject.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const emptyObject = {};

      if (process.env.NODE_ENV !== "production") {
        Object.freeze(emptyObject);
      }

      module.exports = emptyObject;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\focusNode.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * @param {DOMElement} node input/textarea to focus
 */

    function focusNode(node) {
  // IE8 can throw "Can't move focus to the control because it is invisible,
  // not enabled, or of a type that does not accept the focus." for all kinds of
  // reasons that are too expensive and fragile to test.
      try {
        node.focus();
      } catch (e) {}
    }

    module.exports = focusNode;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getActiveElement.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

/* eslint-disable fb-www/typeof-undefined */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document or document body is not
 * yet defined.
 */
    function getActiveElement() /* ?DOMElement*/{
      if (typeof document === "undefined") {
        return null;
      }
      try {
        return document.activeElement || document.body;
      } catch (e) {
        return document.body;
      }
    }

    module.exports = getActiveElement;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getMarkupWrap.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/* eslint-disable fb-www/unsafe-html */

      const ExecutionEnvironment = require("./ExecutionEnvironment");

      const invariant = require("./invariant");

/**
 * Dummy container used to detect which wraps are necessary.
 */
      const dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement("div") : null;

/**
 * Some browsers cannot use `innerHTML` to render certain elements standalone,
 * so we wrap them, render the wrapped nodes, then extract the desired node.
 *
 * In IE8, certain elements cannot render alone, so wrap all elements ('*').
 */

      const shouldWrap = {};

      const selectWrap = [1, "<select multiple=\"true\">", "</select>"];
      const tableWrap = [1, "<table>", "</table>"];
      const trWrap = [3, "<table><tbody><tr>", "</tr></tbody></table>"];

      const svgWrap = [1, "<svg xmlns=\"http://www.w3.org/2000/svg\">", "</svg>"];

      const markupWrap = {
        "*": [1, "?<div>", "</div>"],

        "area": [1, "<map>", "</map>"],
        "col": [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        "legend": [1, "<fieldset>", "</fieldset>"],
        "param": [1, "<object>", "</object>"],
        "tr": [2, "<table><tbody>", "</tbody></table>"],

        "optgroup": selectWrap,
        "option": selectWrap,

        "caption": tableWrap,
        "colgroup": tableWrap,
        "tbody": tableWrap,
        "tfoot": tableWrap,
        "thead": tableWrap,

        "td": trWrap,
        "th": trWrap,
      };

// Initialize the SVG elements since we know they'll always need to be wrapped
// consistently. If they are created inside a <div> they will be initialized in
// the wrong namespace (and will not display).
      const svgElements = ["circle", "clipPath", "defs", "ellipse", "g", "image", "line", "linearGradient", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "text", "tspan"];
      svgElements.forEach((nodeName) => {
        markupWrap[nodeName] = svgWrap;
        shouldWrap[nodeName] = true;
      });

/**
 * Gets the markup wrap configuration for the supplied `nodeName`.
 *
 * NOTE: This lazily detects which wraps are necessary for the current browser.
 *
 * @param {string} nodeName Lowercase `nodeName`.
 * @return {?array} Markup wrap configuration, if applicable.
 */
      function getMarkupWrap(nodeName) {
        !dummyNode ? process.env.NODE_ENV !== "production" ? invariant(false, "Markup wrapping node not initialized") : invariant(false) : void 0;
        if (!markupWrap.hasOwnProperty(nodeName)) {
          nodeName = "*";
        }
        if (!shouldWrap.hasOwnProperty(nodeName)) {
          if (nodeName === "*") {
            dummyNode.innerHTML = "<link />";
          } else {
            dummyNode.innerHTML = `<${nodeName}></${nodeName}>`;
          }
          shouldWrap[nodeName] = !dummyNode.firstChild;
        }
        return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
      }

      module.exports = getMarkupWrap;
    }).call(this, require("_process"));
  }, { "./ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "./invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getUnboundedScrollPosition.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */


/**
 * Gets the scroll position of the supplied element or window.
 *
 * The return values are unbounded, unlike `getScrollPosition`. This means they
 * may be negative or exceed the element boundaries (which is possible using
 * inertial scrolling).
 *
 * @param {DOMWindow|DOMElement} scrollable
 * @return {object} Map with `x` and `y` keys.
 */

    function getUnboundedScrollPosition(scrollable) {
      if (scrollable === window) {
        return {
          x: window.pageXOffset || document.documentElement.scrollLeft,
          y: window.pageYOffset || document.documentElement.scrollTop,
        };
      }
      return {
        x: scrollable.scrollLeft,
        y: scrollable.scrollTop,
      };
    }

    module.exports = getUnboundedScrollPosition;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\hyphenate.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

    const _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
    function hyphenate(string) {
      return string.replace(_uppercasePattern, "-$1").toLowerCase();
    }

    module.exports = hyphenate;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\hyphenateStyleName.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */


    const hyphenate = require("./hyphenate");

    const msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
    function hyphenateStyleName(string) {
      return hyphenate(string).replace(msPattern, "-ms-");
    }

    module.exports = hyphenateStyleName;
  }, { "./hyphenate": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\hyphenate.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

      let validateFormat = function validateFormat(format) {};

      if (process.env.NODE_ENV !== "production") {
        validateFormat = function validateFormat(format) {
          if (format === undefined) {
            throw new Error("invariant requires an error message argument");
          }
        };
      }

      function invariant(condition, format, a, b, c, d, e, f) {
        validateFormat(format);

        if (!condition) {
          let error;
          if (format === undefined) {
            error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");
          } else {
            const args = [a, b, c, d, e, f];
            let argIndex = 0;
            error = new Error(format.replace(/%s/g, () => {
              return args[argIndex++];
            }));
            error.name = "Invariant Violation";
          }

          error.framesToPop = 1; // we don't care about invariant's own frame
          throw error;
        }
      }

      module.exports = invariant;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\isNode.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
    function isNode(object) {
      return !!(object && (typeof Node === "function" ? object instanceof Node : typeof object === "object" && typeof object.nodeType === "number" && typeof object.nodeName === "string"));
    }

    module.exports = isNode;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\isTextNode.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

    const isNode = require("./isNode");

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
    function isTextNode(object) {
      return isNode(object) && object.nodeType == 3;
    }

    module.exports = isTextNode;
  }, { "./isNode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\isNode.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\memoizeStringOnly.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 * @typechecks static-only
 */


/**
 * Memoizes the return value of a function that accepts one string argument.
 */

    function memoizeStringOnly(callback) {
      const cache = {};
      return function(string) {
        if (!cache.hasOwnProperty(string)) {
          cache[string] = callback.call(this, string);
        }
        return cache[string];
      };
    }

    module.exports = memoizeStringOnly;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\performance.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */


    const ExecutionEnvironment = require("./ExecutionEnvironment");

    let performance;

    if (ExecutionEnvironment.canUseDOM) {
      performance = window.performance || window.msPerformance || window.webkitPerformance;
    }

    module.exports = performance || {};
  }, { "./ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\performanceNow.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

    const performance = require("./performance");

    let performanceNow;

/**
 * Detect if we can use `window.performance.now()` and gracefully fallback to
 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
 * because of Facebook's testing infrastructure.
 */
    if (performance.now) {
      performanceNow = function performanceNow() {
        return performance.now();
      };
    } else {
      performanceNow = function performanceNow() {
        return Date.now();
      };
    }

    module.exports = performanceNow;
  }, { "./performance": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\performance.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\shallowEqual.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 *
 */

/* eslint-disable no-self-compare */


    const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
    function is(x, y) {
  // SameValue algorithm
      if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
      }
    // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
    function shallowEqual(objA, objB) {
      if (is(objA, objB)) {
        return true;
      }

      if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
        return false;
      }

      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) {
        return false;
      }

  // Test for A's keys different from B.
      for (let i = 0; i < keysA.length; i++) {
        if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
          return false;
        }
      }

      return true;
    }

    module.exports = shallowEqual;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

      let warning = emptyFunction;

      if (process.env.NODE_ENV !== "production") {
        (function() {
          const printWarning = function printWarning(format) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }

            let argIndex = 0;
            const message = `Warning: ${format.replace(/%s/g, () => {
              return args[argIndex++];
            })}`;
            if (typeof console !== "undefined") {
              console.error(message);
            }
            try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
              throw new Error(message);
            } catch (x) {}
          };

          warning = function warning(condition, format) {
            if (format === undefined) {
              throw new Error("`warning(condition, format, ...args)` requires a warning " + "message argument");
            }

            if (format.indexOf("Failed Composite propType: ") === 0) {
              return; // Ignore CompositeComponent proptype check.
            }

            if (!condition) {
              for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
              args[_key2 - 2] = arguments[_key2];
            }

              printWarning(...[format].concat(args));
            }
          };
        }());
      }

      module.exports = warning;
    }).call(this, require("_process"));
  }, { "./emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\flux\\index.js": [function(require, module, exports) {
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

    module.exports.Dispatcher = require("./lib/Dispatcher");
  }, { "./lib/Dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\flux\\lib\\Dispatcher.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\flux\\lib\\Dispatcher.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 *
 * @preventMunge
 */


      exports.__esModule = true;

      function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      const invariant = require("fbjs/lib/invariant");

      const _prefix = "ID_";

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

      const Dispatcher = (function() {
        function Dispatcher() {
          _classCallCheck(this, Dispatcher);

          this._callbacks = {};
          this._isDispatching = false;
          this._isHandled = {};
          this._isPending = {};
          this._lastID = 1;
        }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

        Dispatcher.prototype.register = function register(callback) {
          const id = _prefix + this._lastID++;
          this._callbacks[id] = callback;
          return id;
        };

  /**
   * Removes a callback based on its token.
   */

        Dispatcher.prototype.unregister = function unregister(id) {
          !this._callbacks[id] ? process.env.NODE_ENV !== "production" ? invariant(false, "Dispatcher.unregister(...): `%s` does not map to a registered callback.", id) : invariant(false) : undefined;
          delete this._callbacks[id];
        };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

        Dispatcher.prototype.waitFor = function waitFor(ids) {
          !this._isDispatching ? process.env.NODE_ENV !== "production" ? invariant(false, "Dispatcher.waitFor(...): Must be invoked while dispatching.") : invariant(false) : undefined;
          for (let ii = 0; ii < ids.length; ii++) {
            const id = ids[ii];
            if (this._isPending[id]) {
              !this._isHandled[id] ? process.env.NODE_ENV !== "production" ? invariant(false, "Dispatcher.waitFor(...): Circular dependency detected while " + "waiting for `%s`.", id) : invariant(false) : undefined;
              continue;
            }
            !this._callbacks[id] ? process.env.NODE_ENV !== "production" ? invariant(false, "Dispatcher.waitFor(...): `%s` does not map to a registered callback.", id) : invariant(false) : undefined;
            this._invokeCallback(id);
          }
        };

  /**
   * Dispatches a payload to all registered callbacks.
   */

        Dispatcher.prototype.dispatch = function dispatch(payload) {
          this._isDispatching ? process.env.NODE_ENV !== "production" ? invariant(false, "Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.") : invariant(false) : undefined;
          this._startDispatching(payload);
          try {
            for (const id in this._callbacks) {
              if (this._isPending[id]) {
              continue;
            }
              this._invokeCallback(id);
            }
          } finally {
            this._stopDispatching();
          }
        };

  /**
   * Is this Dispatcher currently dispatching.
   */

        Dispatcher.prototype.isDispatching = function isDispatching() {
          return this._isDispatching;
        };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

        Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
          this._isPending[id] = true;
          this._callbacks[id](this._pendingPayload);
          this._isHandled[id] = true;
        };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

        Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
          for (const id in this._callbacks) {
            this._isPending[id] = false;
            this._isHandled[id] = false;
          }
          this._pendingPayload = payload;
          this._isDispatching = true;
        };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

        Dispatcher.prototype._stopDispatching = function _stopDispatching() {
          delete this._pendingPayload;
          this._isDispatching = false;
        };

        return Dispatcher;
      }());

      module.exports = Dispatcher;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js": [function(require, module, exports) {
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
    const getOwnPropertySymbols = Object.getOwnPropertySymbols;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
      if (val === null || val === undefined) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }

      return Object(val);
    }

    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
        const test1 = new String("abc");  // eslint-disable-line no-new-wrappers
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
        const test2 = {};
        for (let i = 0; i < 10; i++) {
          test2[`_${String.fromCharCode(i)}`] = i;
        }
        const order2 = Object.getOwnPropertyNames(test2).map((n) => {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
        const test3 = {};
        "abcdefghijklmnopqrst".split("").forEach((letter) => {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !==
				"abcdefghijklmnopqrst") {
          return false;
        }

        return true;
      } catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
        return false;
      }
    }

    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      let from;
      const to = toObject(target);
      let symbols;

      for (let s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);

        for (const key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }

        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (let i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }

      return to;
    };
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js": [function(require, module, exports) {
// shim for using process in browser
    const process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

    let cachedSetTimeout;
    let cachedClearTimeout;

    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function() {
      try {
        if (typeof setTimeout === "function") {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === "function") {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    }());
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        // normal enviroments in sane situations
        return setTimeout(fun, 0);
      }
    // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        // normal enviroments in sane situations
        return clearTimeout(marker);
      }
    // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    let queue = [];
    let draining = false;
    let currentQueue;
    let queueIndex = -1;

    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }

    function drainQueue() {
      if (draining) {
        return;
      }
      const timeout = runTimeout(cleanUpNextTick);
      draining = true;

      let len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }

    process.nextTick = function(fun) {
      const args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };

// v8 likes predictible objects
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ""; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;

    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };

    process.cwd = function() { return "/"; };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
    process.umask = function() { return 0; };
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\index.js": [function(require, module, exports) {
    module.exports = require("./lib/ReactDOM");
  }, { "./lib/ReactDOM": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOM.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ARIADOMPropertyConfig.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ARIADOMPropertyConfig = {
      Properties: {
    // Global States and Properties
        "aria-current": 0, // state
        "aria-details": 0,
        "aria-disabled": 0, // state
        "aria-hidden": 0, // state
        "aria-invalid": 0, // state
        "aria-keyshortcuts": 0,
        "aria-label": 0,
        "aria-roledescription": 0,
    // Widget Attributes
        "aria-autocomplete": 0,
        "aria-checked": 0,
        "aria-expanded": 0,
        "aria-haspopup": 0,
        "aria-level": 0,
        "aria-modal": 0,
        "aria-multiline": 0,
        "aria-multiselectable": 0,
        "aria-orientation": 0,
        "aria-placeholder": 0,
        "aria-pressed": 0,
        "aria-readonly": 0,
        "aria-required": 0,
        "aria-selected": 0,
        "aria-sort": 0,
        "aria-valuemax": 0,
        "aria-valuemin": 0,
        "aria-valuenow": 0,
        "aria-valuetext": 0,
    // Live Region Attributes
        "aria-atomic": 0,
        "aria-busy": 0,
        "aria-live": 0,
        "aria-relevant": 0,
    // Drag-and-Drop Attributes
        "aria-dropeffect": 0,
        "aria-grabbed": 0,
    // Relationship Attributes
        "aria-activedescendant": 0,
        "aria-colcount": 0,
        "aria-colindex": 0,
        "aria-colspan": 0,
        "aria-controls": 0,
        "aria-describedby": 0,
        "aria-errormessage": 0,
        "aria-flowto": 0,
        "aria-labelledby": 0,
        "aria-owns": 0,
        "aria-posinset": 0,
        "aria-rowcount": 0,
        "aria-rowindex": 0,
        "aria-rowspan": 0,
        "aria-setsize": 0,
      },
      DOMAttributeNames: {},
      DOMPropertyNames: {},
    };

    module.exports = ARIADOMPropertyConfig;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\AutoFocusUtils.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ReactDOMComponentTree = require("./ReactDOMComponentTree");

    const focusNode = require("fbjs/lib/focusNode");

    const AutoFocusUtils = {
      focusDOMComponent() {
        focusNode(ReactDOMComponentTree.getNodeFromInstance(this));
      },
    };

    module.exports = AutoFocusUtils;
  }, { "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "fbjs/lib/focusNode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\focusNode.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\BeforeInputEventPlugin.js": [function(require, module, exports) {
/**
 * Copyright 2013-present Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const EventPropagators = require("./EventPropagators");
    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
    const FallbackCompositionState = require("./FallbackCompositionState");
    const SyntheticCompositionEvent = require("./SyntheticCompositionEvent");
    const SyntheticInputEvent = require("./SyntheticInputEvent");

    const END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
    const START_KEYCODE = 229;

    const canUseCompositionEvent = ExecutionEnvironment.canUseDOM && "CompositionEvent" in window;

    let documentMode = null;
    if (ExecutionEnvironment.canUseDOM && "documentMode" in document) {
      documentMode = document.documentMode;
    }

// Webkit offers a very useful `textInput` event that can be used to
// directly represent `beforeInput`. The IE `textinput` event is not as
// useful, so we don't use it.
    const canUseTextInputEvent = ExecutionEnvironment.canUseDOM && "TextEvent" in window && !documentMode && !isPresto();

// In IE9+, we have access to composition events, but the data supplied
// by the native compositionend event may be incorrect. Japanese ideographic
// spaces, for instance (\u3000) are not recorded correctly.
    const useFallbackCompositionData = ExecutionEnvironment.canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);

/**
 * Opera <= 12 includes TextEvent in window, but does not fire
 * text input events. Rely on keypress instead.
 */
    function isPresto() {
      const opera = window.opera;
      return typeof opera === "object" && typeof opera.version === "function" && parseInt(opera.version(), 10) <= 12;
    }

    const SPACEBAR_CODE = 32;
    const SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

// Events and their corresponding property names.
    const eventTypes = {
      beforeInput: {
        phasedRegistrationNames: {
          bubbled: "onBeforeInput",
          captured: "onBeforeInputCapture",
        },
        dependencies: ["topCompositionEnd", "topKeyPress", "topTextInput", "topPaste"],
      },
      compositionEnd: {
        phasedRegistrationNames: {
          bubbled: "onCompositionEnd",
          captured: "onCompositionEndCapture",
        },
        dependencies: ["topBlur", "topCompositionEnd", "topKeyDown", "topKeyPress", "topKeyUp", "topMouseDown"],
      },
      compositionStart: {
        phasedRegistrationNames: {
          bubbled: "onCompositionStart",
          captured: "onCompositionStartCapture",
        },
        dependencies: ["topBlur", "topCompositionStart", "topKeyDown", "topKeyPress", "topKeyUp", "topMouseDown"],
      },
      compositionUpdate: {
        phasedRegistrationNames: {
          bubbled: "onCompositionUpdate",
          captured: "onCompositionUpdateCapture",
        },
        dependencies: ["topBlur", "topCompositionUpdate", "topKeyDown", "topKeyPress", "topKeyUp", "topMouseDown"],
      },
    };

// Track whether we've ever handled a keypress on the space key.
    let hasSpaceKeypress = false;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
    function isKeypressCommand(nativeEvent) {
      return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
  // ctrlKey && altKey is equivalent to AltGr, and is not a command.
  !(nativeEvent.ctrlKey && nativeEvent.altKey);
    }

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
    function getCompositionEventType(topLevelType) {
      switch (topLevelType) {
        case "topCompositionStart":
          return eventTypes.compositionStart;
        case "topCompositionEnd":
          return eventTypes.compositionEnd;
        case "topCompositionUpdate":
          return eventTypes.compositionUpdate;
      }
    }

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
    function isFallbackCompositionStart(topLevelType, nativeEvent) {
      return topLevelType === "topKeyDown" && nativeEvent.keyCode === START_KEYCODE;
    }

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
    function isFallbackCompositionEnd(topLevelType, nativeEvent) {
      switch (topLevelType) {
        case "topKeyUp":
      // Command keys insert or clear IME input.
          return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
        case "topKeyDown":
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
          return nativeEvent.keyCode !== START_KEYCODE;
        case "topKeyPress":
        case "topMouseDown":
        case "topBlur":
      // Events are not possible without cancelling IME.
          return true;
        default:
          return false;
      }
    }

/**
 * Google Input Tools provides composition data via a CustomEvent,
 * with the `data` property populated in the `detail` object. If this
 * is available on the event object, use it. If not, this is a plain
 * composition event and we have nothing special to extract.
 *
 * @param {object} nativeEvent
 * @return {?string}
 */
    function getDataFromCustomEvent(nativeEvent) {
      const detail = nativeEvent.detail;
      if (typeof detail === "object" && "data" in detail) {
        return detail.data;
      }
      return null;
    }

// Track the current IME composition fallback object, if any.
    let currentComposition = null;

/**
 * @return {?object} A SyntheticCompositionEvent.
 */
    function extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
      let eventType;
      let fallbackData;

      if (canUseCompositionEvent) {
        eventType = getCompositionEventType(topLevelType);
      } else if (!currentComposition) {
        if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
          eventType = eventTypes.compositionStart;
        }
      } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
        eventType = eventTypes.compositionEnd;
      }

      if (!eventType) {
        return null;
      }

      if (useFallbackCompositionData) {
    // The current composition is stored statically and must not be
    // overwritten while composition continues.
        if (!currentComposition && eventType === eventTypes.compositionStart) {
          currentComposition = FallbackCompositionState.getPooled(nativeEventTarget);
        } else if (eventType === eventTypes.compositionEnd) {
          if (currentComposition) {
            fallbackData = currentComposition.getData();
          }
        }
      }

      const event = SyntheticCompositionEvent.getPooled(eventType, targetInst, nativeEvent, nativeEventTarget);

      if (fallbackData) {
    // Inject data generated from fallback path into the synthetic event.
    // This matches the property of native CompositionEventInterface.
        event.data = fallbackData;
      } else {
        const customData = getDataFromCustomEvent(nativeEvent);
        if (customData !== null) {
          event.data = customData;
        }
      }

      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    }

/**
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The string corresponding to this `beforeInput` event.
 */
    function getNativeBeforeInputChars(topLevelType, nativeEvent) {
      switch (topLevelType) {
        case "topCompositionEnd":
          return getDataFromCustomEvent(nativeEvent);
        case "topKeyPress":
      /**
       * If native `textInput` events are available, our goal is to make
       * use of them. However, there is a special case: the spacebar key.
       * In Webkit, preventing default on a spacebar `textInput` event
       * cancels character insertion, but it *also* causes the browser
       * to fall back to its default spacebar behavior of scrolling the
       * page.
       *
       * Tracking at:
       * https://code.google.com/p/chromium/issues/detail?id=355103
       *
       * To avoid this issue, use the keypress event as if no `textInput`
       * event is available.
       */
          var which = nativeEvent.which;
          if (which !== SPACEBAR_CODE) {
            return null;
          }

          hasSpaceKeypress = true;
          return SPACEBAR_CHAR;

        case "topTextInput":
      // Record the characters to be added to the DOM.
          var chars = nativeEvent.data;

      // If it's a spacebar character, assume that we have already handled
      // it at the keypress level and bail immediately. Android Chrome
      // doesn't give us keycodes, so we need to blacklist it.
          if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
            return null;
          }

          return chars;

        default:
      // For other native event types, do nothing.
          return null;
      }
    }

/**
 * For browsers that do not provide the `textInput` event, extract the
 * appropriate string to use for SyntheticInputEvent.
 *
 * @param {string} topLevelType Record from `EventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The fallback string for this `beforeInput` event.
 */
    function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
  // If we are currently composing (IME) and using a fallback to do so,
  // try to extract the composed characters from the fallback object.
  // If composition event is available, we extract a string only at
  // compositionevent, otherwise extract it at fallback events.
      if (currentComposition) {
        if (topLevelType === "topCompositionEnd" || !canUseCompositionEvent && isFallbackCompositionEnd(topLevelType, nativeEvent)) {
          const chars = currentComposition.getData();
          FallbackCompositionState.release(currentComposition);
          currentComposition = null;
          return chars;
        }
        return null;
      }

      switch (topLevelType) {
        case "topPaste":
      // If a paste event occurs after a keypress, throw out the input
      // chars. Paste events should not lead to BeforeInput events.
          return null;
        case "topKeyPress":
      /**
       * As of v27, Firefox may fire keypress events even when no character
       * will be inserted. A few possibilities:
       *
       * - `which` is `0`. Arrow keys, Esc key, etc.
       *
       * - `which` is the pressed key code, but no char is available.
       *   Ex: 'AltGr + d` in Polish. There is no modified character for
       *   this key combination and no character is inserted into the
       *   document, but FF fires the keypress for char code `100` anyway.
       *   No `input` event will occur.
       *
       * - `which` is the pressed key code, but a command combination is
       *   being used. Ex: `Cmd+C`. No character is inserted, and no
       *   `input` event will occur.
       */
          if (nativeEvent.which && !isKeypressCommand(nativeEvent)) {
            return String.fromCharCode(nativeEvent.which);
          }
          return null;
        case "topCompositionEnd":
          return useFallbackCompositionData ? null : nativeEvent.data;
        default:
          return null;
      }
    }

/**
 * Extract a SyntheticInputEvent for `beforeInput`, based on either native
 * `textInput` or fallback behavior.
 *
 * @return {?object} A SyntheticInputEvent.
 */
    function extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
      let chars;

      if (canUseTextInputEvent) {
        chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
      } else {
        chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
      }

  // If no characters are being inserted, no BeforeInput event should
  // be fired.
      if (!chars) {
        return null;
      }

      const event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, targetInst, nativeEvent, nativeEventTarget);

      event.data = chars;
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    }

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 *
 * This plugin is also responsible for emitting `composition` events, thus
 * allowing us to share composition fallback code for both `beforeInput` and
 * `composition` event types.
 */
    const BeforeInputEventPlugin = {

      eventTypes,

      extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        return [extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget), extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget)];
      },
    };

    module.exports = BeforeInputEventPlugin;
  }, { "./EventPropagators": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPropagators.js", "./FallbackCompositionState": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\FallbackCompositionState.js", "./SyntheticCompositionEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticCompositionEvent.js", "./SyntheticInputEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticInputEvent.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CSSProperty.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * CSS properties which accept numbers but are not in units of "px".
 */

    const isUnitlessNumber = {
      animationIterationCount: true,
      borderImageOutset: true,
      borderImageSlice: true,
      borderImageWidth: true,
      boxFlex: true,
      boxFlexGroup: true,
      boxOrdinalGroup: true,
      columnCount: true,
      flex: true,
      flexGrow: true,
      flexPositive: true,
      flexShrink: true,
      flexNegative: true,
      flexOrder: true,
      gridRow: true,
      gridColumn: true,
      fontWeight: true,
      lineClamp: true,
      lineHeight: true,
      opacity: true,
      order: true,
      orphans: true,
      tabSize: true,
      widows: true,
      zIndex: true,
      zoom: true,

  // SVG-related properties
      fillOpacity: true,
      floodOpacity: true,
      stopOpacity: true,
      strokeDasharray: true,
      strokeDashoffset: true,
      strokeMiterlimit: true,
      strokeOpacity: true,
      strokeWidth: true,
    };

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
    function prefixKey(prefix, key) {
      return prefix + key.charAt(0).toUpperCase() + key.substring(1);
    }

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
    const prefixes = ["Webkit", "ms", "Moz", "O"];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
    Object.keys(isUnitlessNumber).forEach((prop) => {
      prefixes.forEach((prefix) => {
        isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
      });
    });

/**
 * Most style properties can be unset by doing .style[prop] = '' but IE8
 * doesn't like doing that with shorthand properties so for the properties that
 * IE8 breaks on, which are listed here, we instead unset each of the
 * individual properties. See http://bugs.jquery.com/ticket/12385.
 * The 4-value 'clock' properties like margin, padding, border-width seem to
 * behave without any problems. Curiously, list-style works too without any
 * special prodding.
 */
    const shorthandPropertyExpansions = {
      background: {
        backgroundAttachment: true,
        backgroundColor: true,
        backgroundImage: true,
        backgroundPositionX: true,
        backgroundPositionY: true,
        backgroundRepeat: true,
      },
      backgroundPosition: {
        backgroundPositionX: true,
        backgroundPositionY: true,
      },
      border: {
        borderWidth: true,
        borderStyle: true,
        borderColor: true,
      },
      borderBottom: {
        borderBottomWidth: true,
        borderBottomStyle: true,
        borderBottomColor: true,
      },
      borderLeft: {
        borderLeftWidth: true,
        borderLeftStyle: true,
        borderLeftColor: true,
      },
      borderRight: {
        borderRightWidth: true,
        borderRightStyle: true,
        borderRightColor: true,
      },
      borderTop: {
        borderTopWidth: true,
        borderTopStyle: true,
        borderTopColor: true,
      },
      font: {
        fontStyle: true,
        fontVariant: true,
        fontWeight: true,
        fontSize: true,
        lineHeight: true,
        fontFamily: true,
      },
      outline: {
        outlineWidth: true,
        outlineStyle: true,
        outlineColor: true,
      },
    };

    const CSSProperty = {
      isUnitlessNumber,
      shorthandPropertyExpansions,
    };

    module.exports = CSSProperty;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CSSPropertyOperations.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const CSSProperty = require("./CSSProperty");
      const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
      const ReactInstrumentation = require("./ReactInstrumentation");

      const camelizeStyleName = require("fbjs/lib/camelizeStyleName");
      const dangerousStyleValue = require("./dangerousStyleValue");
      const hyphenateStyleName = require("fbjs/lib/hyphenateStyleName");
      const memoizeStringOnly = require("fbjs/lib/memoizeStringOnly");
      const warning = require("fbjs/lib/warning");

      const processStyleName = memoizeStringOnly((styleName) => {
        return hyphenateStyleName(styleName);
      });

      let hasShorthandPropertyBug = false;
      let styleFloatAccessor = "cssFloat";
      if (ExecutionEnvironment.canUseDOM) {
        const tempStyle = document.createElement("div").style;
        try {
    // IE8 throws "Invalid argument." if resetting shorthand style properties.
          tempStyle.font = "";
        } catch (e) {
          hasShorthandPropertyBug = true;
        }
  // IE8 only supports accessing cssFloat (standard) as styleFloat
        if (document.documentElement.style.cssFloat === undefined) {
          styleFloatAccessor = "styleFloat";
        }
      }

      if (process.env.NODE_ENV !== "production") {
  // 'msTransform' is correct, but the other prefixes should be capitalized
        const badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;

  // style values shouldn't contain a semicolon
        const badStyleValueWithSemicolonPattern = /;\s*$/;

        const warnedStyleNames = {};
        const warnedStyleValues = {};
        let warnedForNaNValue = false;

        const warnHyphenatedStyleName = function(name, owner) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }

          warnedStyleNames[name] = true;
          process.env.NODE_ENV !== "production" ? warning(false, "Unsupported style property %s. Did you mean %s?%s", name, camelizeStyleName(name), checkRenderMessage(owner)) : void 0;
        };

        const warnBadVendoredStyleName = function(name, owner) {
          if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
            return;
          }

          warnedStyleNames[name] = true;
          process.env.NODE_ENV !== "production" ? warning(false, "Unsupported vendor-prefixed style property %s. Did you mean %s?%s", name, name.charAt(0).toUpperCase() + name.slice(1), checkRenderMessage(owner)) : void 0;
        };

        const warnStyleValueWithSemicolon = function(name, value, owner) {
          if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
            return;
          }

          warnedStyleValues[value] = true;
          process.env.NODE_ENV !== "production" ? warning(false, "Style property values shouldn't contain a semicolon.%s " + "Try \"%s: %s\" instead.", checkRenderMessage(owner), name, value.replace(badStyleValueWithSemicolonPattern, "")) : void 0;
        };

        const warnStyleValueIsNaN = function(name, value, owner) {
          if (warnedForNaNValue) {
            return;
          }

          warnedForNaNValue = true;
          process.env.NODE_ENV !== "production" ? warning(false, "`NaN` is an invalid value for the `%s` css style property.%s", name, checkRenderMessage(owner)) : void 0;
        };

        var checkRenderMessage = function(owner) {
          if (owner) {
            const name = owner.getName();
            if (name) {
              return ` Check the render method of \`${name}\`.`;
            }
          }
          return "";
        };

  /**
   * @param {string} name
   * @param {*} value
   * @param {ReactDOMComponent} component
   */
        var warnValidStyle = function(name, value, component) {
          let owner;
          if (component) {
            owner = component._currentElement._owner;
          }
          if (name.indexOf("-") > -1) {
            warnHyphenatedStyleName(name, owner);
          } else if (badVendoredStyleNamePattern.test(name)) {
            warnBadVendoredStyleName(name, owner);
          } else if (badStyleValueWithSemicolonPattern.test(value)) {
            warnStyleValueWithSemicolon(name, value, owner);
          }

          if (typeof value === "number" && isNaN(value)) {
            warnStyleValueIsNaN(name, value, owner);
          }
        };
      }

/**
 * Operations for dealing with CSS properties.
 */
      const CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   * The result should be HTML-escaped before insertion into the DOM.
   *
   * @param {object} styles
   * @param {ReactDOMComponent} component
   * @return {?string}
   */
        createMarkupForStyles(styles, component) {
          let serialized = "";
          for (const styleName in styles) {
            if (!styles.hasOwnProperty(styleName)) {
              continue;
            }
            const styleValue = styles[styleName];
            if (process.env.NODE_ENV !== "production") {
              warnValidStyle(styleName, styleValue, component);
            }
            if (styleValue != null) {
              serialized += `${processStyleName(styleName)}:`;
              serialized += `${dangerousStyleValue(styleName, styleValue, component)};`;
            }
          }
          return serialized || null;
        },

  /**
   * Sets the value for multiple styles on a node.  If a value is specified as
   * '' (empty string), the corresponding style property will be unset.
   *
   * @param {DOMElement} node
   * @param {object} styles
   * @param {ReactDOMComponent} component
   */
        setValueForStyles(node, styles, component) {
          if (process.env.NODE_ENV !== "production") {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: component._debugID,
              type: "update styles",
              payload: styles,
            });
          }

          const style = node.style;
          for (let styleName in styles) {
            if (!styles.hasOwnProperty(styleName)) {
              continue;
            }
            if (process.env.NODE_ENV !== "production") {
              warnValidStyle(styleName, styles[styleName], component);
            }
            const styleValue = dangerousStyleValue(styleName, styles[styleName], component);
            if (styleName === "float" || styleName === "cssFloat") {
              styleName = styleFloatAccessor;
            }
            if (styleValue) {
              style[styleName] = styleValue;
            } else {
              const expansion = hasShorthandPropertyBug && CSSProperty.shorthandPropertyExpansions[styleName];
              if (expansion) {
          // Shorthand property that IE8 won't like unsetting, so unset each
          // component to placate it
                for (const individualStyleName in expansion) {
                style[individualStyleName] = "";
              }
              } else {
                style[styleName] = "";
              }
            }
          }
        },

      };

      module.exports = CSSPropertyOperations;
    }).call(this, require("_process"));
  }, { "./CSSProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CSSProperty.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./dangerousStyleValue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\dangerousStyleValue.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "fbjs/lib/camelizeStyleName": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\camelizeStyleName.js", "fbjs/lib/hyphenateStyleName": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\hyphenateStyleName.js", "fbjs/lib/memoizeStringOnly": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\memoizeStringOnly.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CallbackQueue.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      const PooledClass = require("./PooledClass");

      const invariant = require("fbjs/lib/invariant");

/**
 * A specialized pseudo-event module to help keep track of components waiting to
 * be notified when their DOM representations are available for use.
 *
 * This implements `PooledClass`, so you should never need to instantiate this.
 * Instead, use `CallbackQueue.getPooled()`.
 *
 * @class ReactMountReady
 * @implements PooledClass
 * @internal
 */

      const CallbackQueue = (function() {
        function CallbackQueue(arg) {
          _classCallCheck(this, CallbackQueue);

          this._callbacks = null;
          this._contexts = null;
          this._arg = arg;
        }

  /**
   * Enqueues a callback to be invoked when `notifyAll` is invoked.
   *
   * @param {function} callback Invoked when `notifyAll` is invoked.
   * @param {?object} context Context to call `callback` with.
   * @internal
   */


        CallbackQueue.prototype.enqueue = function enqueue(callback, context) {
          this._callbacks = this._callbacks || [];
          this._callbacks.push(callback);
          this._contexts = this._contexts || [];
          this._contexts.push(context);
        };

  /**
   * Invokes all enqueued callbacks and clears the queue. This is invoked after
   * the DOM representation of a component has been created or updated.
   *
   * @internal
   */


        CallbackQueue.prototype.notifyAll = function notifyAll() {
          const callbacks = this._callbacks;
          const contexts = this._contexts;
          const arg = this._arg;
          if (callbacks && contexts) {
            !(callbacks.length === contexts.length) ? process.env.NODE_ENV !== "production" ? invariant(false, "Mismatched list of contexts in callback queue") : _prodInvariant("24") : void 0;
            this._callbacks = null;
            this._contexts = null;
            for (let i = 0; i < callbacks.length; i++) {
              callbacks[i].call(contexts[i], arg);
            }
            callbacks.length = 0;
            contexts.length = 0;
          }
        };

        CallbackQueue.prototype.checkpoint = function checkpoint() {
          return this._callbacks ? this._callbacks.length : 0;
        };

        CallbackQueue.prototype.rollback = function rollback(len) {
          if (this._callbacks && this._contexts) {
            this._callbacks.length = len;
            this._contexts.length = len;
          }
        };

  /**
   * Resets the internal queue.
   *
   * @internal
   */


        CallbackQueue.prototype.reset = function reset() {
          this._callbacks = null;
          this._contexts = null;
        };

  /**
   * `PooledClass` looks for this.
   */


        CallbackQueue.prototype.destructor = function destructor() {
          this.reset();
        };

        return CallbackQueue;
      }());

      module.exports = PooledClass.addPoolingTo(CallbackQueue);
    }).call(this, require("_process"));
  }, { "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ChangeEventPlugin.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const EventPluginHub = require("./EventPluginHub");
    const EventPropagators = require("./EventPropagators");
    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");
    const ReactUpdates = require("./ReactUpdates");
    const SyntheticEvent = require("./SyntheticEvent");

    const getEventTarget = require("./getEventTarget");
    const isEventSupported = require("./isEventSupported");
    const isTextInputElement = require("./isTextInputElement");

    const eventTypes = {
      change: {
        phasedRegistrationNames: {
          bubbled: "onChange",
          captured: "onChangeCapture",
        },
        dependencies: ["topBlur", "topChange", "topClick", "topFocus", "topInput", "topKeyDown", "topKeyUp", "topSelectionChange"],
      },
    };

/**
 * For IE shims
 */
    let activeElement = null;
    let activeElementInst = null;
    let activeElementValue = null;
    let activeElementValueProp = null;

/**
 * SECTION: handle `change` event
 */
    function shouldUseChangeEvent(elem) {
      const nodeName = elem.nodeName && elem.nodeName.toLowerCase();
      return nodeName === "select" || nodeName === "input" && elem.type === "file";
    }

    let doesChangeEventBubble = false;
    if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
      doesChangeEventBubble = isEventSupported("change") && (!document.documentMode || document.documentMode > 8);
    }

    function manualDispatchChangeEvent(nativeEvent) {
      const event = SyntheticEvent.getPooled(eventTypes.change, activeElementInst, nativeEvent, getEventTarget(nativeEvent));
      EventPropagators.accumulateTwoPhaseDispatches(event);

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
      ReactUpdates.batchedUpdates(runEventInBatch, event);
    }

    function runEventInBatch(event) {
      EventPluginHub.enqueueEvents(event);
      EventPluginHub.processEventQueue(false);
    }

    function startWatchingForChangeEventIE8(target, targetInst) {
      activeElement = target;
      activeElementInst = targetInst;
      activeElement.attachEvent("onchange", manualDispatchChangeEvent);
    }

    function stopWatchingForChangeEventIE8() {
      if (!activeElement) {
        return;
      }
      activeElement.detachEvent("onchange", manualDispatchChangeEvent);
      activeElement = null;
      activeElementInst = null;
    }

    function getTargetInstForChangeEvent(topLevelType, targetInst) {
      if (topLevelType === "topChange") {
        return targetInst;
      }
    }
    function handleEventsForChangeEventIE8(topLevelType, target, targetInst) {
      if (topLevelType === "topFocus") {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
        stopWatchingForChangeEventIE8();
        startWatchingForChangeEventIE8(target, targetInst);
      } else if (topLevelType === "topBlur") {
        stopWatchingForChangeEventIE8();
      }
    }

/**
 * SECTION: handle `input` event
 */
    let isInputEventSupported = false;
    if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events.
  // IE10+ fire input events to often, such when a placeholder
  // changes or when an input with a placeholder is focused.
      isInputEventSupported = isEventSupported("input") && (!document.documentMode || document.documentMode > 11);
    }

/**
 * (For IE <=11) Replacement getter/setter for the `value` property that gets
 * set on the active element.
 */
    const newValueProp = {
      get() {
        return activeElementValueProp.get.call(this);
      },
      set(val) {
    // Cast to a string so we can do equality checks.
        activeElementValue = `${val}`;
        activeElementValueProp.set.call(this, val);
      },
    };

/**
 * (For IE <=11) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
    function startWatchingForValueChange(target, targetInst) {
      activeElement = target;
      activeElementInst = targetInst;
      activeElementValue = target.value;
      activeElementValueProp = Object.getOwnPropertyDescriptor(target.constructor.prototype, "value");

  // Not guarded in a canDefineProperty check: IE8 supports defineProperty only
  // on DOM elements
      Object.defineProperty(activeElement, "value", newValueProp);
      if (activeElement.attachEvent) {
        activeElement.attachEvent("onpropertychange", handlePropertyChange);
      } else {
        activeElement.addEventListener("propertychange", handlePropertyChange, false);
      }
    }

/**
 * (For IE <=11) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
    function stopWatchingForValueChange() {
      if (!activeElement) {
        return;
      }

  // delete restores the original property definition
      delete activeElement.value;

      if (activeElement.detachEvent) {
        activeElement.detachEvent("onpropertychange", handlePropertyChange);
      } else {
        activeElement.removeEventListener("propertychange", handlePropertyChange, false);
      }

      activeElement = null;
      activeElementInst = null;
      activeElementValue = null;
      activeElementValueProp = null;
    }

/**
 * (For IE <=11) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
    function handlePropertyChange(nativeEvent) {
      if (nativeEvent.propertyName !== "value") {
        return;
      }
      const value = nativeEvent.srcElement.value;
      if (value === activeElementValue) {
        return;
      }
      activeElementValue = value;

      manualDispatchChangeEvent(nativeEvent);
    }

/**
 * If a `change` event should be fired, returns the target's ID.
 */
    function getTargetInstForInputEvent(topLevelType, targetInst) {
      if (topLevelType === "topInput") {
    // In modern browsers (i.e., not IE8 or IE9), the input event is exactly
    // what we want so fall through here and trigger an abstract event
        return targetInst;
      }
    }

    function handleEventsForInputEventIE(topLevelType, target, targetInst) {
      if (topLevelType === "topFocus") {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9-11, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
        stopWatchingForValueChange();
        startWatchingForValueChange(target, targetInst);
      } else if (topLevelType === "topBlur") {
        stopWatchingForValueChange();
      }
    }

// For IE8 and IE9.
    function getTargetInstForInputEventIE(topLevelType, targetInst) {
      if (topLevelType === "topSelectionChange" || topLevelType === "topKeyUp" || topLevelType === "topKeyDown") {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
        if (activeElement && activeElement.value !== activeElementValue) {
          activeElementValue = activeElement.value;
          return activeElementInst;
        }
      }
    }

/**
 * SECTION: handle `click` event
 */
    function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
      return elem.nodeName && elem.nodeName.toLowerCase() === "input" && (elem.type === "checkbox" || elem.type === "radio");
    }

    function getTargetInstForClickEvent(topLevelType, targetInst) {
      if (topLevelType === "topClick") {
        return targetInst;
      }
    }

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
    const ChangeEventPlugin = {

      eventTypes,

      extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        const targetNode = targetInst ? ReactDOMComponentTree.getNodeFromInstance(targetInst) : window;

        let getTargetInstFunc,
          handleEventFunc;
        if (shouldUseChangeEvent(targetNode)) {
          if (doesChangeEventBubble) {
            getTargetInstFunc = getTargetInstForChangeEvent;
          } else {
            handleEventFunc = handleEventsForChangeEventIE8;
          }
        } else if (isTextInputElement(targetNode)) {
          if (isInputEventSupported) {
            getTargetInstFunc = getTargetInstForInputEvent;
          } else {
            getTargetInstFunc = getTargetInstForInputEventIE;
            handleEventFunc = handleEventsForInputEventIE;
          }
        } else if (shouldUseClickEvent(targetNode)) {
          getTargetInstFunc = getTargetInstForClickEvent;
        }

        if (getTargetInstFunc) {
          const inst = getTargetInstFunc(topLevelType, targetInst);
          if (inst) {
            const event = SyntheticEvent.getPooled(eventTypes.change, inst, nativeEvent, nativeEventTarget);
            event.type = "change";
            EventPropagators.accumulateTwoPhaseDispatches(event);
            return event;
          }
        }

        if (handleEventFunc) {
          handleEventFunc(topLevelType, targetNode, targetInst);
        }
      },

    };

    module.exports = ChangeEventPlugin;
  }, { "./EventPluginHub": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginHub.js", "./EventPropagators": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPropagators.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js", "./getEventTarget": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventTarget.js", "./isEventSupported": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isEventSupported.js", "./isTextInputElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isTextInputElement.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMChildrenOperations.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const DOMLazyTree = require("./DOMLazyTree");
      const Danger = require("./Danger");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactInstrumentation = require("./ReactInstrumentation");

      const createMicrosoftUnsafeLocalFunction = require("./createMicrosoftUnsafeLocalFunction");
      const setInnerHTML = require("./setInnerHTML");
      const setTextContent = require("./setTextContent");

      function getNodeAfter(parentNode, node) {
  // Special case for text components, which return [open, close] comments
  // from getHostNode.
        if (Array.isArray(node)) {
          node = node[1];
        }
        return node ? node.nextSibling : parentNode.firstChild;
      }

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
      const insertChildAt = createMicrosoftUnsafeLocalFunction((parentNode, childNode, referenceNode) => {
  // We rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. (Using `undefined` is not allowed by all browsers so
  // we are careful to use `null`.)
        parentNode.insertBefore(childNode, referenceNode);
      });

      function insertLazyTreeChildAt(parentNode, childTree, referenceNode) {
        DOMLazyTree.insertTreeBefore(parentNode, childTree, referenceNode);
      }

      function moveChild(parentNode, childNode, referenceNode) {
        if (Array.isArray(childNode)) {
          moveDelimitedText(parentNode, childNode[0], childNode[1], referenceNode);
        } else {
          insertChildAt(parentNode, childNode, referenceNode);
        }
      }

      function removeChild(parentNode, childNode) {
        if (Array.isArray(childNode)) {
          const closingComment = childNode[1];
          childNode = childNode[0];
          removeDelimitedText(parentNode, childNode, closingComment);
          parentNode.removeChild(closingComment);
        }
        parentNode.removeChild(childNode);
      }

      function moveDelimitedText(parentNode, openingComment, closingComment, referenceNode) {
        let node = openingComment;
        while (true) {
          const nextNode = node.nextSibling;
          insertChildAt(parentNode, node, referenceNode);
          if (node === closingComment) {
            break;
          }
          node = nextNode;
        }
      }

      function removeDelimitedText(parentNode, startNode, closingComment) {
        while (true) {
          const node = startNode.nextSibling;
          if (node === closingComment) {
      // The closing comment is removed by ReactMultiChild.
            break;
          } else {
            parentNode.removeChild(node);
          }
        }
      }

      function replaceDelimitedText(openingComment, closingComment, stringText) {
        const parentNode = openingComment.parentNode;
        const nodeAfterComment = openingComment.nextSibling;
        if (nodeAfterComment === closingComment) {
    // There are no text nodes between the opening and closing comments; insert
    // a new one if stringText isn't empty.
          if (stringText) {
            insertChildAt(parentNode, document.createTextNode(stringText), nodeAfterComment);
          }
        } else if (stringText) {
      // Set the text content of the first node after the opening comment, and
      // remove all following nodes up until the closing comment.
          setTextContent(nodeAfterComment, stringText);
          removeDelimitedText(parentNode, nodeAfterComment, closingComment);
        } else {
          removeDelimitedText(parentNode, openingComment, closingComment);
        }

        if (process.env.NODE_ENV !== "production") {
          ReactInstrumentation.debugTool.onHostOperation({
            instanceID: ReactDOMComponentTree.getInstanceFromNode(openingComment)._debugID,
            type: "replace text",
            payload: stringText,
          });
        }
      }

      let dangerouslyReplaceNodeWithMarkup = Danger.dangerouslyReplaceNodeWithMarkup;
      if (process.env.NODE_ENV !== "production") {
        dangerouslyReplaceNodeWithMarkup = function(oldChild, markup, prevInstance) {
          Danger.dangerouslyReplaceNodeWithMarkup(oldChild, markup);
          if (prevInstance._debugID !== 0) {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: prevInstance._debugID,
              type: "replace with",
              payload: markup.toString(),
            });
          } else {
            const nextInstance = ReactDOMComponentTree.getInstanceFromNode(markup.node);
            if (nextInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onHostOperation({
              instanceID: nextInstance._debugID,
              type: "mount",
              payload: markup.toString(),
            });
            }
          }
        };
      }

/**
 * Operations for updating with DOM children.
 */
      const DOMChildrenOperations = {

        dangerouslyReplaceNodeWithMarkup,

        replaceDelimitedText,

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @internal
   */
        processUpdates(parentNode, updates) {
          if (process.env.NODE_ENV !== "production") {
            var parentNodeDebugID = ReactDOMComponentTree.getInstanceFromNode(parentNode)._debugID;
          }

          for (let k = 0; k < updates.length; k++) {
            const update = updates[k];
            switch (update.type) {
              case "INSERT_MARKUP":
                insertLazyTreeChildAt(parentNode, update.content, getNodeAfter(parentNode, update.afterNode));
                if (process.env.NODE_ENV !== "production") {
                ReactInstrumentation.debugTool.onHostOperation({
                  instanceID: parentNodeDebugID,
                  type: "insert child",
                  payload: { toIndex: update.toIndex, content: update.content.toString() },
                });
              }
                break;
              case "MOVE_EXISTING":
                moveChild(parentNode, update.fromNode, getNodeAfter(parentNode, update.afterNode));
                if (process.env.NODE_ENV !== "production") {
                ReactInstrumentation.debugTool.onHostOperation({
                  instanceID: parentNodeDebugID,
                  type: "move child",
                  payload: { fromIndex: update.fromIndex, toIndex: update.toIndex },
                });
              }
                break;
              case "SET_MARKUP":
                setInnerHTML(parentNode, update.content);
                if (process.env.NODE_ENV !== "production") {
                ReactInstrumentation.debugTool.onHostOperation({
                  instanceID: parentNodeDebugID,
                  type: "replace children",
                  payload: update.content.toString(),
                });
              }
                break;
              case "TEXT_CONTENT":
                setTextContent(parentNode, update.content);
                if (process.env.NODE_ENV !== "production") {
                ReactInstrumentation.debugTool.onHostOperation({
                  instanceID: parentNodeDebugID,
                  type: "replace text",
                  payload: update.content.toString(),
                });
              }
                break;
              case "REMOVE_NODE":
                removeChild(parentNode, update.fromNode);
                if (process.env.NODE_ENV !== "production") {
                ReactInstrumentation.debugTool.onHostOperation({
                  instanceID: parentNodeDebugID,
                  type: "remove child",
                  payload: { fromIndex: update.fromIndex },
                });
              }
                break;
            }
          }
        },

      };

      module.exports = DOMChildrenOperations;
    }).call(this, require("_process"));
  }, { "./DOMLazyTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js", "./Danger": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Danger.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./createMicrosoftUnsafeLocalFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\createMicrosoftUnsafeLocalFunction.js", "./setInnerHTML": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setInnerHTML.js", "./setTextContent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setTextContent.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js": [function(require, module, exports) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const DOMNamespaces = require("./DOMNamespaces");
    const setInnerHTML = require("./setInnerHTML");

    const createMicrosoftUnsafeLocalFunction = require("./createMicrosoftUnsafeLocalFunction");
    const setTextContent = require("./setTextContent");

    const ELEMENT_NODE_TYPE = 1;
    const DOCUMENT_FRAGMENT_NODE_TYPE = 11;

/**
 * In IE (8-11) and Edge, appending nodes with no children is dramatically
 * faster than appending a full subtree, so we essentially queue up the
 * .appendChild calls here and apply them so each node is added to its parent
 * before any children are added.
 *
 * In other browsers, doing so is slower or neutral compared to the other order
 * (in Firefox, twice as slow) so we only do this inversion in IE.
 *
 * See https://github.com/spicyj/innerhtml-vs-createelement-vs-clonenode.
 */
    const enableLazy = typeof document !== "undefined" && typeof document.documentMode === "number" || typeof navigator !== "undefined" && typeof navigator.userAgent === "string" && /\bEdge\/\d/.test(navigator.userAgent);

    function insertTreeChildren(tree) {
      if (!enableLazy) {
        return;
      }
      const node = tree.node;
      const children = tree.children;
      if (children.length) {
        for (let i = 0; i < children.length; i++) {
          insertTreeBefore(node, children[i], null);
        }
      } else if (tree.html != null) {
        setInnerHTML(node, tree.html);
      } else if (tree.text != null) {
        setTextContent(node, tree.text);
      }
    }

    var insertTreeBefore = createMicrosoftUnsafeLocalFunction((parentNode, tree, referenceNode) => {
  // DocumentFragments aren't actually part of the DOM after insertion so
  // appending children won't update the DOM. We need to ensure the fragment
  // is properly populated first, breaking out of our lazy approach for just
  // this level. Also, some <object> plugins (like Flash Player) will read
  // <param> nodes immediately upon insertion into the DOM, so <object>
  // must also be populated prior to insertion into the DOM.
      if (tree.node.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE || tree.node.nodeType === ELEMENT_NODE_TYPE && tree.node.nodeName.toLowerCase() === "object" && (tree.node.namespaceURI == null || tree.node.namespaceURI === DOMNamespaces.html)) {
        insertTreeChildren(tree);
        parentNode.insertBefore(tree.node, referenceNode);
      } else {
        parentNode.insertBefore(tree.node, referenceNode);
        insertTreeChildren(tree);
      }
    });

    function replaceChildWithTree(oldNode, newTree) {
      oldNode.parentNode.replaceChild(newTree.node, oldNode);
      insertTreeChildren(newTree);
    }

    function queueChild(parentTree, childTree) {
      if (enableLazy) {
        parentTree.children.push(childTree);
      } else {
        parentTree.node.appendChild(childTree.node);
      }
    }

    function queueHTML(tree, html) {
      if (enableLazy) {
        tree.html = html;
      } else {
        setInnerHTML(tree.node, html);
      }
    }

    function queueText(tree, text) {
      if (enableLazy) {
        tree.text = text;
      } else {
        setTextContent(tree.node, text);
      }
    }

    function toString() {
      return this.node.nodeName;
    }

    function DOMLazyTree(node) {
      return {
        node,
        children: [],
        html: null,
        text: null,
        toString,
      };
    }

    DOMLazyTree.insertTreeBefore = insertTreeBefore;
    DOMLazyTree.replaceChildWithTree = replaceChildWithTree;
    DOMLazyTree.queueChild = queueChild;
    DOMLazyTree.queueHTML = queueHTML;
    DOMLazyTree.queueText = queueText;

    module.exports = DOMLazyTree;
  }, { "./DOMNamespaces": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMNamespaces.js", "./createMicrosoftUnsafeLocalFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\createMicrosoftUnsafeLocalFunction.js", "./setInnerHTML": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setInnerHTML.js", "./setTextContent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setTextContent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMNamespaces.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const DOMNamespaces = {
      html: "http://www.w3.org/1999/xhtml",
      mathml: "http://www.w3.org/1998/Math/MathML",
      svg: "http://www.w3.org/2000/svg",
    };

    module.exports = DOMNamespaces;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

      function checkMask(value, bitmask) {
        return (value & bitmask) === bitmask;
      }

      var DOMPropertyInjection = {
  /**
   * Mapping from normalized, camelcased property names to a configuration that
   * specifies how the associated DOM property should be accessed or rendered.
   */
        MUST_USE_PROPERTY: 0x1,
        HAS_BOOLEAN_VALUE: 0x4,
        HAS_NUMERIC_VALUE: 0x8,
        HAS_POSITIVE_NUMERIC_VALUE: 0x10 | 0x8,
        HAS_OVERLOADED_BOOLEAN_VALUE: 0x20,

  /**
   * Inject some specialized knowledge about the DOM. This takes a config object
   * with the following properties:
   *
   * isCustomAttribute: function that given an attribute name will return true
   * if it can be inserted into the DOM verbatim. Useful for data-* or aria-*
   * attributes where it's impossible to enumerate all of the possible
   * attribute names,
   *
   * Properties: object mapping DOM property name to one of the
   * DOMPropertyInjection constants or null. If your attribute isn't in here,
   * it won't get written to the DOM.
   *
   * DOMAttributeNames: object mapping React attribute name to the DOM
   * attribute name. Attribute names not specified use the **lowercase**
   * normalized name.
   *
   * DOMAttributeNamespaces: object mapping React attribute name to the DOM
   * attribute namespace URL. (Attribute names not specified use no namespace.)
   *
   * DOMPropertyNames: similar to DOMAttributeNames but for DOM properties.
   * Property names not specified use the normalized name.
   *
   * DOMMutationMethods: Properties that require special mutation methods. If
   * `value` is undefined, the mutation method should unset the property.
   *
   * @param {object} domPropertyConfig the config as described above.
   */
        injectDOMPropertyConfig(domPropertyConfig) {
          const Injection = DOMPropertyInjection;
          const Properties = domPropertyConfig.Properties || {};
          const DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
          const DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
          const DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
          const DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};

          if (domPropertyConfig.isCustomAttribute) {
            DOMProperty._isCustomAttributeFunctions.push(domPropertyConfig.isCustomAttribute);
          }

          for (const propName in Properties) {
            DOMProperty.properties.hasOwnProperty(propName) ? process.env.NODE_ENV !== "production" ? invariant(false, "injectDOMPropertyConfig(...): You're trying to inject DOM property '%s' which has already been injected. You may be accidentally injecting the same DOM property config twice, or you may be injecting two configs that have conflicting property names.", propName) : _prodInvariant("48", propName) : void 0;

            const lowerCased = propName.toLowerCase();
            const propConfig = Properties[propName];

            const propertyInfo = {
              attributeName: lowerCased,
              attributeNamespace: null,
              propertyName: propName,
              mutationMethod: null,

              mustUseProperty: checkMask(propConfig, Injection.MUST_USE_PROPERTY),
              hasBooleanValue: checkMask(propConfig, Injection.HAS_BOOLEAN_VALUE),
              hasNumericValue: checkMask(propConfig, Injection.HAS_NUMERIC_VALUE),
              hasPositiveNumericValue: checkMask(propConfig, Injection.HAS_POSITIVE_NUMERIC_VALUE),
              hasOverloadedBooleanValue: checkMask(propConfig, Injection.HAS_OVERLOADED_BOOLEAN_VALUE),
            };
            !(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1) ? process.env.NODE_ENV !== "production" ? invariant(false, "DOMProperty: Value can be one of boolean, overloaded boolean, or numeric value, but not a combination: %s", propName) : _prodInvariant("50", propName) : void 0;

            if (process.env.NODE_ENV !== "production") {
              DOMProperty.getPossibleStandardName[lowerCased] = propName;
            }

            if (DOMAttributeNames.hasOwnProperty(propName)) {
              const attributeName = DOMAttributeNames[propName];
              propertyInfo.attributeName = attributeName;
              if (process.env.NODE_ENV !== "production") {
                DOMProperty.getPossibleStandardName[attributeName] = propName;
              }
            }

            if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
              propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
            }

            if (DOMPropertyNames.hasOwnProperty(propName)) {
              propertyInfo.propertyName = DOMPropertyNames[propName];
            }

            if (DOMMutationMethods.hasOwnProperty(propName)) {
              propertyInfo.mutationMethod = DOMMutationMethods[propName];
            }

            DOMProperty.properties[propName] = propertyInfo;
          }
        },
      };

/* eslint-disable max-len */
      const ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
/* eslint-enable max-len */

/**
 * DOMProperty exports lookup objects that can be used like functions:
 *
 *   > DOMProperty.isValid['id']
 *   true
 *   > DOMProperty.isValid['foobar']
 *   undefined
 *
 * Although this may be confusing, it performs better in general.
 *
 * @see http://jsperf.com/key-exists
 * @see http://jsperf.com/key-missing
 */
      var DOMProperty = {

        ID_ATTRIBUTE_NAME: "data-reactid",
        ROOT_ATTRIBUTE_NAME: "data-reactroot",

        ATTRIBUTE_NAME_START_CHAR,
        ATTRIBUTE_NAME_CHAR: `${ATTRIBUTE_NAME_START_CHAR}\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040`,

  /**
   * Map from property "standard name" to an object with info about how to set
   * the property in the DOM. Each object contains:
   *
   * attributeName:
   *   Used when rendering markup or with `*Attribute()`.
   * attributeNamespace
   * propertyName:
   *   Used on DOM node instances. (This includes properties that mutate due to
   *   external factors.)
   * mutationMethod:
   *   If non-null, used instead of the property or `setAttribute()` after
   *   initial render.
   * mustUseProperty:
   *   Whether the property must be accessed and mutated as an object property.
   * hasBooleanValue:
   *   Whether the property should be removed when set to a falsey value.
   * hasNumericValue:
   *   Whether the property must be numeric or parse as a numeric and should be
   *   removed when set to a falsey value.
   * hasPositiveNumericValue:
   *   Whether the property must be positive numeric or parse as a positive
   *   numeric and should be removed when set to a falsey value.
   * hasOverloadedBooleanValue:
   *   Whether the property can be used as a flag as well as with a value.
   *   Removed when strictly equal to false; present without a value when
   *   strictly equal to true; present with a value otherwise.
   */
        properties: {},

  /**
   * Mapping from lowercase property names to the properly cased version, used
   * to warn in the case of missing properties. Available only in __DEV__.
   *
   * autofocus is predefined, because adding it to the property whitelist
   * causes unintended side effects.
   *
   * @type {Object}
   */
        getPossibleStandardName: process.env.NODE_ENV !== "production" ? { autofocus: "autoFocus" } : null,

  /**
   * All of the isCustomAttribute() functions that have been injected.
   */
        _isCustomAttributeFunctions: [],

  /**
   * Checks whether a property name is a custom attribute.
   * @method
   */
        isCustomAttribute(attributeName) {
          for (let i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
            const isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
            if (isCustomAttributeFn(attributeName)) {
              return true;
            }
          }
          return false;
        },

        injection: DOMPropertyInjection,
      };

      module.exports = DOMProperty;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMPropertyOperations.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const DOMProperty = require("./DOMProperty");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactInstrumentation = require("./ReactInstrumentation");

      const quoteAttributeValueForBrowser = require("./quoteAttributeValueForBrowser");
      const warning = require("fbjs/lib/warning");

      const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(`^[${DOMProperty.ATTRIBUTE_NAME_START_CHAR}][${DOMProperty.ATTRIBUTE_NAME_CHAR}]*$`);
      const illegalAttributeNameCache = {};
      const validatedAttributeNameCache = {};

      function isAttributeNameSafe(attributeName) {
        if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
          return true;
        }
        if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
          return false;
        }
        if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
          validatedAttributeNameCache[attributeName] = true;
          return true;
        }
        illegalAttributeNameCache[attributeName] = true;
        process.env.NODE_ENV !== "production" ? warning(false, "Invalid attribute name: `%s`", attributeName) : void 0;
        return false;
      }

      function shouldIgnoreValue(propertyInfo, value) {
        return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
      }

/**
 * Operations for dealing with DOM properties.
 */
      var DOMPropertyOperations = {

  /**
   * Creates markup for the ID property.
   *
   * @param {string} id Unescaped ID.
   * @return {string} Markup string.
   */
        createMarkupForID(id) {
          return `${DOMProperty.ID_ATTRIBUTE_NAME}=${quoteAttributeValueForBrowser(id)}`;
        },

        setAttributeForID(node, id) {
          node.setAttribute(DOMProperty.ID_ATTRIBUTE_NAME, id);
        },

        createMarkupForRoot() {
          return `${DOMProperty.ROOT_ATTRIBUTE_NAME}=""`;
        },

        setAttributeForRoot(node) {
          node.setAttribute(DOMProperty.ROOT_ATTRIBUTE_NAME, "");
        },

  /**
   * Creates markup for a property.
   *
   * @param {string} name
   * @param {*} value
   * @return {?string} Markup string, or null if the property was invalid.
   */
        createMarkupForProperty(name, value) {
          const propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
          if (propertyInfo) {
            if (shouldIgnoreValue(propertyInfo, value)) {
              return "";
            }
            const attributeName = propertyInfo.attributeName;
            if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
              return `${attributeName}=""`;
            }
            return `${attributeName}=${quoteAttributeValueForBrowser(value)}`;
          } else if (DOMProperty.isCustomAttribute(name)) {
            if (value == null) {
              return "";
            }
            return `${name}=${quoteAttributeValueForBrowser(value)}`;
          }
          return null;
        },

  /**
   * Creates markup for a custom property.
   *
   * @param {string} name
   * @param {*} value
   * @return {string} Markup string, or empty string if the property was invalid.
   */
        createMarkupForCustomAttribute(name, value) {
          if (!isAttributeNameSafe(name) || value == null) {
            return "";
          }
          return `${name}=${quoteAttributeValueForBrowser(value)}`;
        },

  /**
   * Sets the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   * @param {*} value
   */
        setValueForProperty(node, name, value) {
          const propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
          if (propertyInfo) {
            const mutationMethod = propertyInfo.mutationMethod;
            if (mutationMethod) {
              mutationMethod(node, value);
            } else if (shouldIgnoreValue(propertyInfo, value)) {
              this.deleteValueForProperty(node, name);
              return;
            } else if (propertyInfo.mustUseProperty) {
        // Contrary to `setAttribute`, object properties are properly
        // `toString`ed by IE8/9.
            node[propertyInfo.propertyName] = value;
          } else {
            const attributeName = propertyInfo.attributeName;
            const namespace = propertyInfo.attributeNamespace;
        // `setAttribute` with objects becomes only `[object]` in IE8/9,
        // ('' + value) makes it output the correct toString()-value.
            if (namespace) {
              node.setAttributeNS(namespace, attributeName, `${value}`);
            } else if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
            node.setAttribute(attributeName, "");
          } else {
            node.setAttribute(attributeName, `${value}`);
          }
          }
          } else if (DOMProperty.isCustomAttribute(name)) {
            DOMPropertyOperations.setValueForAttribute(node, name, value);
            return;
          }

          if (process.env.NODE_ENV !== "production") {
            const payload = {};
            payload[name] = value;
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: ReactDOMComponentTree.getInstanceFromNode(node)._debugID,
              type: "update attribute",
              payload,
            });
          }
        },

        setValueForAttribute(node, name, value) {
          if (!isAttributeNameSafe(name)) {
            return;
          }
          if (value == null) {
            node.removeAttribute(name);
          } else {
            node.setAttribute(name, `${value}`);
          }

          if (process.env.NODE_ENV !== "production") {
            const payload = {};
            payload[name] = value;
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: ReactDOMComponentTree.getInstanceFromNode(node)._debugID,
              type: "update attribute",
              payload,
            });
          }
        },

  /**
   * Deletes an attributes from a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
        deleteValueForAttribute(node, name) {
          node.removeAttribute(name);
          if (process.env.NODE_ENV !== "production") {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: ReactDOMComponentTree.getInstanceFromNode(node)._debugID,
              type: "remove attribute",
              payload: name,
            });
          }
        },

  /**
   * Deletes the value for a property on a node.
   *
   * @param {DOMElement} node
   * @param {string} name
   */
        deleteValueForProperty(node, name) {
          const propertyInfo = DOMProperty.properties.hasOwnProperty(name) ? DOMProperty.properties[name] : null;
          if (propertyInfo) {
            const mutationMethod = propertyInfo.mutationMethod;
            if (mutationMethod) {
              mutationMethod(node, undefined);
            } else if (propertyInfo.mustUseProperty) {
              const propName = propertyInfo.propertyName;
              if (propertyInfo.hasBooleanValue) {
              node[propName] = false;
            } else {
              node[propName] = "";
            }
            } else {
              node.removeAttribute(propertyInfo.attributeName);
            }
          } else if (DOMProperty.isCustomAttribute(name)) {
            node.removeAttribute(name);
          }

          if (process.env.NODE_ENV !== "production") {
            ReactInstrumentation.debugTool.onHostOperation({
              instanceID: ReactDOMComponentTree.getInstanceFromNode(node)._debugID,
              type: "remove attribute",
              payload: name,
            });
          }
        },

      };

      module.exports = DOMPropertyOperations;
    }).call(this, require("_process"));
  }, { "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./quoteAttributeValueForBrowser": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\quoteAttributeValueForBrowser.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Danger.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const DOMLazyTree = require("./DOMLazyTree");
      const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

      const createNodesFromMarkup = require("fbjs/lib/createNodesFromMarkup");
      const emptyFunction = require("fbjs/lib/emptyFunction");
      const invariant = require("fbjs/lib/invariant");

      const Danger = {

  /**
   * Replaces a node with a string of markup at its current position within its
   * parent. The markup must render into a single root node.
   *
   * @param {DOMElement} oldChild Child node to replace.
   * @param {string} markup Markup to render in place of the child node.
   * @internal
   */
        dangerouslyReplaceNodeWithMarkup(oldChild, markup) {
          !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, "dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a worker thread. Make sure `window` and `document` are available globally before requiring React when unit testing or use ReactDOMServer.renderToString() for server rendering.") : _prodInvariant("56") : void 0;
          !markup ? process.env.NODE_ENV !== "production" ? invariant(false, "dangerouslyReplaceNodeWithMarkup(...): Missing markup.") : _prodInvariant("57") : void 0;
          !(oldChild.nodeName !== "HTML") ? process.env.NODE_ENV !== "production" ? invariant(false, "dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the <html> node. This is because browser quirks make this unreliable and/or slow. If you want to render to the root you must use server rendering. See ReactDOMServer.renderToString().") : _prodInvariant("58") : void 0;

          if (typeof markup === "string") {
            const newChild = createNodesFromMarkup(markup, emptyFunction)[0];
            oldChild.parentNode.replaceChild(newChild, oldChild);
          } else {
            DOMLazyTree.replaceChildWithTree(oldChild, markup);
          }
        },

      };

      module.exports = Danger;
    }).call(this, require("_process"));
  }, { "./DOMLazyTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "fbjs/lib/createNodesFromMarkup": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\createNodesFromMarkup.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DefaultEventPluginOrder.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */

    const DefaultEventPluginOrder = ["ResponderEventPlugin", "SimpleEventPlugin", "TapEventPlugin", "EnterLeaveEventPlugin", "ChangeEventPlugin", "SelectEventPlugin", "BeforeInputEventPlugin"];

    module.exports = DefaultEventPluginOrder;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EnterLeaveEventPlugin.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const EventPropagators = require("./EventPropagators");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");
    const SyntheticMouseEvent = require("./SyntheticMouseEvent");

    const eventTypes = {
      mouseEnter: {
        registrationName: "onMouseEnter",
        dependencies: ["topMouseOut", "topMouseOver"],
      },
      mouseLeave: {
        registrationName: "onMouseLeave",
        dependencies: ["topMouseOut", "topMouseOver"],
      },
    };

    const EnterLeaveEventPlugin = {

      eventTypes,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   */
      extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        if (topLevelType === "topMouseOver" && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
          return null;
        }
        if (topLevelType !== "topMouseOut" && topLevelType !== "topMouseOver") {
      // Must not be a mouse in or mouse out - ignoring.
          return null;
        }

        let win;
        if (nativeEventTarget.window === nativeEventTarget) {
      // `nativeEventTarget` is probably a window object.
          win = nativeEventTarget;
        } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
          const doc = nativeEventTarget.ownerDocument;
          if (doc) {
            win = doc.defaultView || doc.parentWindow;
          } else {
            win = window;
          }
        }

        let from;
        let to;
        if (topLevelType === "topMouseOut") {
          from = targetInst;
          const related = nativeEvent.relatedTarget || nativeEvent.toElement;
          to = related ? ReactDOMComponentTree.getClosestInstanceFromNode(related) : null;
        } else {
      // Moving to a node from outside the window.
          from = null;
          to = targetInst;
        }

        if (from === to) {
      // Nothing pertains to our managed components.
          return null;
        }

        const fromNode = from == null ? win : ReactDOMComponentTree.getNodeFromInstance(from);
        const toNode = to == null ? win : ReactDOMComponentTree.getNodeFromInstance(to);

        const leave = SyntheticMouseEvent.getPooled(eventTypes.mouseLeave, from, nativeEvent, nativeEventTarget);
        leave.type = "mouseleave";
        leave.target = fromNode;
        leave.relatedTarget = toNode;

        const enter = SyntheticMouseEvent.getPooled(eventTypes.mouseEnter, to, nativeEvent, nativeEventTarget);
        enter.type = "mouseenter";
        enter.target = toNode;
        enter.relatedTarget = fromNode;

        EventPropagators.accumulateEnterLeaveDispatches(leave, enter, from, to);

        return [leave, enter];
      },

    };

    module.exports = EnterLeaveEventPlugin;
  }, { "./EventPropagators": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPropagators.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./SyntheticMouseEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticMouseEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginHub.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const EventPluginRegistry = require("./EventPluginRegistry");
      const EventPluginUtils = require("./EventPluginUtils");
      const ReactErrorUtils = require("./ReactErrorUtils");

      const accumulateInto = require("./accumulateInto");
      const forEachAccumulated = require("./forEachAccumulated");
      const invariant = require("fbjs/lib/invariant");

/**
 * Internal store for event listeners
 */
      let listenerBank = {};

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
      let eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @private
 */
      const executeDispatchesAndRelease = function(event, simulated) {
        if (event) {
          EventPluginUtils.executeDispatchesInOrder(event, simulated);

          if (!event.isPersistent()) {
            event.constructor.release(event);
          }
        }
      };
      const executeDispatchesAndReleaseSimulated = function(e) {
        return executeDispatchesAndRelease(e, true);
      };
      const executeDispatchesAndReleaseTopLevel = function(e) {
        return executeDispatchesAndRelease(e, false);
      };

      const getDictionaryKey = function(inst) {
  // Prevents V8 performance issue:
  // https://github.com/facebook/react/pull/7232
        return `.${inst._rootNodeID}`;
      };

      function isInteractive(tag) {
        return tag === "button" || tag === "input" || tag === "select" || tag === "textarea";
      }

      function shouldPreventMouseEvent(name, type, props) {
        switch (name) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
            return !!(props.disabled && isInteractive(type));
          default:
            return false;
        }
      }

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */
      const EventPluginHub = {

  /**
   * Methods for injecting dependencies.
   */
        injection: {

    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
          injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
          injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName,

        },

  /**
   * Stores `listener` at `listenerBank[registrationName][key]`. Is idempotent.
   *
   * @param {object} inst The instance, which is the source of events.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {function} listener The callback to store.
   */
        putListener(inst, registrationName, listener) {
          !(typeof listener === "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "Expected %s listener to be a function, instead got type %s", registrationName, typeof listener) : _prodInvariant("94", registrationName, typeof listener) : void 0;

          const key = getDictionaryKey(inst);
          const bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
          bankForRegistrationName[key] = listener;

          const PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
          if (PluginModule && PluginModule.didPutListener) {
            PluginModule.didPutListener(inst, registrationName, listener);
          }
        },

  /**
   * @param {object} inst The instance, which is the source of events.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @return {?function} The stored callback.
   */
        getListener(inst, registrationName) {
    // TODO: shouldPreventMouseEvent is DOM-specific and definitely should not
    // live here; needs to be moved to a better place soon
          const bankForRegistrationName = listenerBank[registrationName];
          if (shouldPreventMouseEvent(registrationName, inst._currentElement.type, inst._currentElement.props)) {
            return null;
          }
          const key = getDictionaryKey(inst);
          return bankForRegistrationName && bankForRegistrationName[key];
        },

  /**
   * Deletes a listener from the registration bank.
   *
   * @param {object} inst The instance, which is the source of events.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   */
        deleteListener(inst, registrationName) {
          const PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
          if (PluginModule && PluginModule.willDeleteListener) {
            PluginModule.willDeleteListener(inst, registrationName);
          }

          const bankForRegistrationName = listenerBank[registrationName];
    // TODO: This should never be null -- when is it?
          if (bankForRegistrationName) {
            const key = getDictionaryKey(inst);
            delete bankForRegistrationName[key];
          }
        },

  /**
   * Deletes all listeners for the DOM element with the supplied ID.
   *
   * @param {object} inst The instance, which is the source of events.
   */
        deleteAllListeners(inst) {
          const key = getDictionaryKey(inst);
          for (const registrationName in listenerBank) {
            if (!listenerBank.hasOwnProperty(registrationName)) {
              continue;
            }

            if (!listenerBank[registrationName][key]) {
              continue;
            }

            const PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
            if (PluginModule && PluginModule.willDeleteListener) {
              PluginModule.willDeleteListener(inst, registrationName);
            }

            delete listenerBank[registrationName][key];
          }
        },

  /**
   * Allows registered plugins an opportunity to extract events from top-level
   * native browser events.
   *
   * @return {*} An accumulation of synthetic events.
   * @internal
   */
        extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
          let events;
          const plugins = EventPluginRegistry.plugins;
          for (let i = 0; i < plugins.length; i++) {
      // Not every plugin in the ordering may be loaded at runtime.
            const possiblePlugin = plugins[i];
            if (possiblePlugin) {
              const extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
              if (extractedEvents) {
                events = accumulateInto(events, extractedEvents);
              }
            }
          }
          return events;
        },

  /**
   * Enqueues a synthetic event that should be dispatched when
   * `processEventQueue` is invoked.
   *
   * @param {*} events An accumulation of synthetic events.
   * @internal
   */
        enqueueEvents(events) {
          if (events) {
            eventQueue = accumulateInto(eventQueue, events);
          }
        },

  /**
   * Dispatches all synthetic events on the event queue.
   *
   * @internal
   */
        processEventQueue(simulated) {
    // Set `eventQueue` to null before processing it so that we can tell if more
    // events get enqueued while processing.
          const processingEventQueue = eventQueue;
          eventQueue = null;
          if (simulated) {
            forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
          } else {
            forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
          }
          eventQueue ? process.env.NODE_ENV !== "production" ? invariant(false, "processEventQueue(): Additional events were enqueued while processing an event queue. Support for this has not yet been implemented.") : _prodInvariant("95") : void 0;
    // This would be a good time to rethrow if any of the event handlers threw.
          ReactErrorUtils.rethrowCaughtError();
        },

  /**
   * These are needed for tests only. Do not use!
   */
        __purge() {
          listenerBank = {};
        },

        __getListenerBank() {
          return listenerBank;
        },

      };

      module.exports = EventPluginHub;
    }).call(this, require("_process"));
  }, { "./EventPluginRegistry": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginRegistry.js", "./EventPluginUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginUtils.js", "./ReactErrorUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactErrorUtils.js", "./accumulateInto": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\accumulateInto.js", "./forEachAccumulated": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\forEachAccumulated.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginRegistry.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

/**
 * Injectable ordering of event plugins.
 */
      let eventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
      const namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
      function recomputePluginOrdering() {
        if (!eventPluginOrder) {
    // Wait until an `eventPluginOrder` is injected.
          return;
        }
        for (const pluginName in namesToPlugins) {
          const pluginModule = namesToPlugins[pluginName];
          const pluginIndex = eventPluginOrder.indexOf(pluginName);
          !(pluginIndex > -1) ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginRegistry: Cannot inject event plugins that do not exist in the plugin ordering, `%s`.", pluginName) : _prodInvariant("96", pluginName) : void 0;
          if (EventPluginRegistry.plugins[pluginIndex]) {
            continue;
          }
          !pluginModule.extractEvents ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginRegistry: Event plugins must implement an `extractEvents` method, but `%s` does not.", pluginName) : _prodInvariant("97", pluginName) : void 0;
          EventPluginRegistry.plugins[pluginIndex] = pluginModule;
          const publishedEvents = pluginModule.eventTypes;
          for (const eventName in publishedEvents) {
            !publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName) ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.", eventName, pluginName) : _prodInvariant("98", eventName, pluginName) : void 0;
          }
        }
      }

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
      function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
        EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName) ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginHub: More than one plugin attempted to publish the same event name, `%s`.", eventName) : _prodInvariant("99", eventName) : void 0;
        EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;

        const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
        if (phasedRegistrationNames) {
          for (const phaseName in phasedRegistrationNames) {
            if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
              const phasedRegistrationName = phasedRegistrationNames[phaseName];
              publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
            }
          }
          return true;
        } else if (dispatchConfig.registrationName) {
          publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
          return true;
        }
        return false;
      }

/**
 * Publishes a registration name that is used to identify dispatched events and
 * can be used with `EventPluginHub.putListener` to register listeners.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
      function publishRegistrationName(registrationName, pluginModule, eventName) {
        EventPluginRegistry.registrationNameModules[registrationName] ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginHub: More than one plugin attempted to publish the same registration name, `%s`.", registrationName) : _prodInvariant("100", registrationName) : void 0;
        EventPluginRegistry.registrationNameModules[registrationName] = pluginModule;
        EventPluginRegistry.registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;

        if (process.env.NODE_ENV !== "production") {
          const lowerCasedName = registrationName.toLowerCase();
          EventPluginRegistry.possibleRegistrationNames[lowerCasedName] = registrationName;

          if (registrationName === "onDoubleClick") {
            EventPluginRegistry.possibleRegistrationNames.ondblclick = registrationName;
          }
        }
      }

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */
      var EventPluginRegistry = {

  /**
   * Ordered list of injected plugins.
   */
        plugins: [],

  /**
   * Mapping from event name to dispatch config
   */
        eventNameDispatchConfigs: {},

  /**
   * Mapping from registration name to plugin module
   */
        registrationNameModules: {},

  /**
   * Mapping from registration name to event name
   */
        registrationNameDependencies: {},

  /**
   * Mapping from lowercase registration names to the properly cased version,
   * used to warn in the case of missing event handlers. Available
   * only in __DEV__.
   * @type {Object}
   */
        possibleRegistrationNames: process.env.NODE_ENV !== "production" ? {} : null,
  // Trust the developer to only use possibleRegistrationNames in __DEV__

  /**
   * Injects an ordering of plugins (by plugin name). This allows the ordering
   * to be decoupled from injection of the actual plugins so that ordering is
   * always deterministic regardless of packaging, on-the-fly injection, etc.
   *
   * @param {array} InjectedEventPluginOrder
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginOrder}
   */
        injectEventPluginOrder(injectedEventPluginOrder) {
          eventPluginOrder ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginRegistry: Cannot inject event plugin ordering more than once. You are likely trying to load more than one copy of React.") : _prodInvariant("101") : void 0;
    // Clone the ordering so it cannot be dynamically mutated.
          eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
          recomputePluginOrdering();
        },

  /**
   * Injects plugins to be used by `EventPluginHub`. The plugin names must be
   * in the ordering injected by `injectEventPluginOrder`.
   *
   * Plugins can be injected as part of page initialization or on-the-fly.
   *
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   * @internal
   * @see {EventPluginHub.injection.injectEventPluginsByName}
   */
        injectEventPluginsByName(injectedNamesToPlugins) {
          let isOrderingDirty = false;
          for (const pluginName in injectedNamesToPlugins) {
            if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
              continue;
            }
            const pluginModule = injectedNamesToPlugins[pluginName];
            if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
              namesToPlugins[pluginName] ? process.env.NODE_ENV !== "production" ? invariant(false, "EventPluginRegistry: Cannot inject two different event plugins using the same name, `%s`.", pluginName) : _prodInvariant("102", pluginName) : void 0;
              namesToPlugins[pluginName] = pluginModule;
              isOrderingDirty = true;
            }
          }
          if (isOrderingDirty) {
            recomputePluginOrdering();
          }
        },

  /**
   * Looks up the plugin for the supplied event.
   *
   * @param {object} event A synthetic event.
   * @return {?object} The plugin that created the supplied event.
   * @internal
   */
        getPluginModuleForEvent(event) {
          const dispatchConfig = event.dispatchConfig;
          if (dispatchConfig.registrationName) {
            return EventPluginRegistry.registrationNameModules[dispatchConfig.registrationName] || null;
          }
          if (dispatchConfig.phasedRegistrationNames !== undefined) {
      // pulling phasedRegistrationNames out of dispatchConfig helps Flow see
      // that it is not undefined.
            const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;

            for (const phase in phasedRegistrationNames) {
              if (!phasedRegistrationNames.hasOwnProperty(phase)) {
                continue;
              }
              const pluginModule = EventPluginRegistry.registrationNameModules[phasedRegistrationNames[phase]];
              if (pluginModule) {
                return pluginModule;
              }
            }
          }
          return null;
        },

  /**
   * Exposed for unit testing.
   * @private
   */
        _resetEventPlugins() {
          eventPluginOrder = null;
          for (const pluginName in namesToPlugins) {
            if (namesToPlugins.hasOwnProperty(pluginName)) {
              delete namesToPlugins[pluginName];
            }
          }
          EventPluginRegistry.plugins.length = 0;

          const eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
          for (const eventName in eventNameDispatchConfigs) {
            if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
              delete eventNameDispatchConfigs[eventName];
            }
          }

          const registrationNameModules = EventPluginRegistry.registrationNameModules;
          for (const registrationName in registrationNameModules) {
            if (registrationNameModules.hasOwnProperty(registrationName)) {
              delete registrationNameModules[registrationName];
            }
          }

          if (process.env.NODE_ENV !== "production") {
            const possibleRegistrationNames = EventPluginRegistry.possibleRegistrationNames;
            for (const lowerCasedName in possibleRegistrationNames) {
              if (possibleRegistrationNames.hasOwnProperty(lowerCasedName)) {
                delete possibleRegistrationNames[lowerCasedName];
              }
            }
          }
        },

      };

      module.exports = EventPluginRegistry;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginUtils.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactErrorUtils = require("./ReactErrorUtils");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

/**
 * Injected dependencies:
 */

/**
 * - `ComponentTree`: [required] Module that can convert between React instances
 *   and actual node references.
 */
      let ComponentTree;
      let TreeTraversal;
      const injection = {
        injectComponentTree(Injected) {
          ComponentTree = Injected;
          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(Injected && Injected.getNodeFromInstance && Injected.getInstanceFromNode, "EventPluginUtils.injection.injectComponentTree(...): Injected " + "module is missing getNodeFromInstance or getInstanceFromNode.") : void 0;
          }
        },
        injectTreeTraversal(Injected) {
          TreeTraversal = Injected;
          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(Injected && Injected.isAncestor && Injected.getLowestCommonAncestor, "EventPluginUtils.injection.injectTreeTraversal(...): Injected " + "module is missing isAncestor or getLowestCommonAncestor.") : void 0;
          }
        },
      };

      function isEndish(topLevelType) {
        return topLevelType === "topMouseUp" || topLevelType === "topTouchEnd" || topLevelType === "topTouchCancel";
      }

      function isMoveish(topLevelType) {
        return topLevelType === "topMouseMove" || topLevelType === "topTouchMove";
      }
      function isStartish(topLevelType) {
        return topLevelType === "topMouseDown" || topLevelType === "topTouchStart";
      }

      let validateEventDispatches;
      if (process.env.NODE_ENV !== "production") {
        validateEventDispatches = function(event) {
          const dispatchListeners = event._dispatchListeners;
          const dispatchInstances = event._dispatchInstances;

          const listenersIsArr = Array.isArray(dispatchListeners);
          const listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;

          const instancesIsArr = Array.isArray(dispatchInstances);
          const instancesLen = instancesIsArr ? dispatchInstances.length : dispatchInstances ? 1 : 0;

          process.env.NODE_ENV !== "production" ? warning(instancesIsArr === listenersIsArr && instancesLen === listenersLen, "EventPluginUtils: Invalid `event`.") : void 0;
        };
      }

/**
 * Dispatch the event to the listener.
 * @param {SyntheticEvent} event SyntheticEvent to handle
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @param {function} listener Application-level callback
 * @param {*} inst Internal component instance
 */
      function executeDispatch(event, simulated, listener, inst) {
        const type = event.type || "unknown-event";
        event.currentTarget = EventPluginUtils.getNodeFromInstance(inst);
        if (simulated) {
          ReactErrorUtils.invokeGuardedCallbackWithCatch(type, listener, event);
        } else {
          ReactErrorUtils.invokeGuardedCallback(type, listener, event);
        }
        event.currentTarget = null;
      }

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
      function executeDispatchesInOrder(event, simulated) {
        const dispatchListeners = event._dispatchListeners;
        const dispatchInstances = event._dispatchInstances;
        if (process.env.NODE_ENV !== "production") {
          validateEventDispatches(event);
        }
        if (Array.isArray(dispatchListeners)) {
          for (let i = 0; i < dispatchListeners.length; i++) {
            if (event.isPropagationStopped()) {
              break;
            }
      // Listeners and Instances are two parallel arrays that are always in sync.
            executeDispatch(event, simulated, dispatchListeners[i], dispatchInstances[i]);
          }
        } else if (dispatchListeners) {
          executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
        }
        event._dispatchListeners = null;
        event._dispatchInstances = null;
      }

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return {?string} id of the first dispatch execution who's listener returns
 * true, or null if no listener returned true.
 */
      function executeDispatchesInOrderStopAtTrueImpl(event) {
        const dispatchListeners = event._dispatchListeners;
        const dispatchInstances = event._dispatchInstances;
        if (process.env.NODE_ENV !== "production") {
          validateEventDispatches(event);
        }
        if (Array.isArray(dispatchListeners)) {
          for (let i = 0; i < dispatchListeners.length; i++) {
            if (event.isPropagationStopped()) {
              break;
            }
      // Listeners and Instances are two parallel arrays that are always in sync.
            if (dispatchListeners[i](event, dispatchInstances[i])) {
              return dispatchInstances[i];
            }
          }
        } else if (dispatchListeners) {
          if (dispatchListeners(event, dispatchInstances)) {
            return dispatchInstances;
          }
        }
        return null;
      }

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */
      function executeDispatchesInOrderStopAtTrue(event) {
        const ret = executeDispatchesInOrderStopAtTrueImpl(event);
        event._dispatchInstances = null;
        event._dispatchListeners = null;
        return ret;
      }

/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return {*} The return value of executing the single dispatch.
 */
      function executeDirectDispatch(event) {
        if (process.env.NODE_ENV !== "production") {
          validateEventDispatches(event);
        }
        const dispatchListener = event._dispatchListeners;
        const dispatchInstance = event._dispatchInstances;
        Array.isArray(dispatchListener) ? process.env.NODE_ENV !== "production" ? invariant(false, "executeDirectDispatch(...): Invalid `event`.") : _prodInvariant("103") : void 0;
        event.currentTarget = dispatchListener ? EventPluginUtils.getNodeFromInstance(dispatchInstance) : null;
        const res = dispatchListener ? dispatchListener(event) : null;
        event.currentTarget = null;
        event._dispatchListeners = null;
        event._dispatchInstances = null;
        return res;
      }

/**
 * @param {SyntheticEvent} event
 * @return {boolean} True iff number of dispatches accumulated is greater than 0.
 */
      function hasDispatches(event) {
        return !!event._dispatchListeners;
      }

/**
 * General utilities that are useful in creating custom Event Plugins.
 */
      var EventPluginUtils = {
        isEndish,
        isMoveish,
        isStartish,

        executeDirectDispatch,
        executeDispatchesInOrder,
        executeDispatchesInOrderStopAtTrue,
        hasDispatches,

        getInstanceFromNode(node) {
          return ComponentTree.getInstanceFromNode(node);
        },
        getNodeFromInstance(node) {
          return ComponentTree.getNodeFromInstance(node);
        },
        isAncestor(a, b) {
          return TreeTraversal.isAncestor(a, b);
        },
        getLowestCommonAncestor(a, b) {
          return TreeTraversal.getLowestCommonAncestor(a, b);
        },
        getParentInstance(inst) {
          return TreeTraversal.getParentInstance(inst);
        },
        traverseTwoPhase(target, fn, arg) {
          return TreeTraversal.traverseTwoPhase(target, fn, arg);
        },
        traverseEnterLeave(from, to, fn, argFrom, argTo) {
          return TreeTraversal.traverseEnterLeave(from, to, fn, argFrom, argTo);
        },

        injection,
      };

      module.exports = EventPluginUtils;
    }).call(this, require("_process"));
  }, { "./ReactErrorUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactErrorUtils.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPropagators.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const EventPluginHub = require("./EventPluginHub");
      const EventPluginUtils = require("./EventPluginUtils");

      const accumulateInto = require("./accumulateInto");
      const forEachAccumulated = require("./forEachAccumulated");
      const warning = require("fbjs/lib/warning");

      const getListener = EventPluginHub.getListener;

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
      function listenerAtPhase(inst, event, propagationPhase) {
        const registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
        return getListener(inst, registrationName);
      }

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
      function accumulateDirectionalDispatches(inst, phase, event) {
        if (process.env.NODE_ENV !== "production") {
          process.env.NODE_ENV !== "production" ? warning(inst, "Dispatching inst must not be null") : void 0;
        }
        const listener = listenerAtPhase(inst, event, phase);
        if (listener) {
          event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
          event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
        }
      }

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We cannot perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
      function accumulateTwoPhaseDispatchesSingle(event) {
        if (event && event.dispatchConfig.phasedRegistrationNames) {
          EventPluginUtils.traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
        }
      }

/**
 * Same as `accumulateTwoPhaseDispatchesSingle`, but skips over the targetID.
 */
      function accumulateTwoPhaseDispatchesSingleSkipTarget(event) {
        if (event && event.dispatchConfig.phasedRegistrationNames) {
          const targetInst = event._targetInst;
          const parentInst = targetInst ? EventPluginUtils.getParentInstance(targetInst) : null;
          EventPluginUtils.traverseTwoPhase(parentInst, accumulateDirectionalDispatches, event);
        }
      }

/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
      function accumulateDispatches(inst, ignoredDirection, event) {
        if (event && event.dispatchConfig.registrationName) {
          const registrationName = event.dispatchConfig.registrationName;
          const listener = getListener(inst, registrationName);
          if (listener) {
            event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
            event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
          }
        }
      }

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
      function accumulateDirectDispatchesSingle(event) {
        if (event && event.dispatchConfig.registrationName) {
          accumulateDispatches(event._targetInst, null, event);
        }
      }

      function accumulateTwoPhaseDispatches(events) {
        forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
      }

      function accumulateTwoPhaseDispatchesSkipTarget(events) {
        forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget);
      }

      function accumulateEnterLeaveDispatches(leave, enter, from, to) {
        EventPluginUtils.traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
      }

      function accumulateDirectDispatches(events) {
        forEachAccumulated(events, accumulateDirectDispatchesSingle);
      }

/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
      const EventPropagators = {
        accumulateTwoPhaseDispatches,
        accumulateTwoPhaseDispatchesSkipTarget,
        accumulateDirectDispatches,
        accumulateEnterLeaveDispatches,
      };

      module.exports = EventPropagators;
    }).call(this, require("_process"));
  }, { "./EventPluginHub": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginHub.js", "./EventPluginUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginUtils.js", "./accumulateInto": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\accumulateInto.js", "./forEachAccumulated": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\forEachAccumulated.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\FallbackCompositionState.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const _assign = require("object-assign");

    const PooledClass = require("./PooledClass");

    const getTextContentAccessor = require("./getTextContentAccessor");

/**
 * This helper class stores information about text content of a target node,
 * allowing comparison of content before and after a given event.
 *
 * Identify the node where selection currently begins, then observe
 * both its text content and its current position in the DOM. Since the
 * browser may natively replace the target node during composition, we can
 * use its position to find its replacement.
 *
 * @param {DOMEventTarget} root
 */
    function FallbackCompositionState(root) {
      this._root = root;
      this._startText = this.getText();
      this._fallbackText = null;
    }

    _assign(FallbackCompositionState.prototype, {
      destructor() {
        this._root = null;
        this._startText = null;
        this._fallbackText = null;
      },

  /**
   * Get current text of input.
   *
   * @return {string}
   */
      getText() {
        if ("value" in this._root) {
          return this._root.value;
        }
        return this._root[getTextContentAccessor()];
      },

  /**
   * Determine the differing substring between the initially stored
   * text content and the current content.
   *
   * @return {string}
   */
      getData() {
        if (this._fallbackText) {
          return this._fallbackText;
        }

        let start;
        const startValue = this._startText;
        const startLength = startValue.length;
        let end;
        const endValue = this.getText();
        const endLength = endValue.length;

        for (start = 0; start < startLength; start++) {
          if (startValue[start] !== endValue[start]) {
            break;
          }
        }

        const minEnd = startLength - start;
        for (end = 1; end <= minEnd; end++) {
          if (startValue[startLength - end] !== endValue[endLength - end]) {
            break;
          }
        }

        const sliceTail = end > 1 ? 1 - end : undefined;
        this._fallbackText = endValue.slice(start, sliceTail);
        return this._fallbackText;
      },
    });

    PooledClass.addPoolingTo(FallbackCompositionState);

    module.exports = FallbackCompositionState;
  }, { "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "./getTextContentAccessor": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getTextContentAccessor.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\HTMLDOMPropertyConfig.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const DOMProperty = require("./DOMProperty");

    const MUST_USE_PROPERTY = DOMProperty.injection.MUST_USE_PROPERTY;
    const HAS_BOOLEAN_VALUE = DOMProperty.injection.HAS_BOOLEAN_VALUE;
    const HAS_NUMERIC_VALUE = DOMProperty.injection.HAS_NUMERIC_VALUE;
    const HAS_POSITIVE_NUMERIC_VALUE = DOMProperty.injection.HAS_POSITIVE_NUMERIC_VALUE;
    const HAS_OVERLOADED_BOOLEAN_VALUE = DOMProperty.injection.HAS_OVERLOADED_BOOLEAN_VALUE;

    const HTMLDOMPropertyConfig = {
      isCustomAttribute: RegExp.prototype.test.bind(new RegExp(`^(data|aria)-[${DOMProperty.ATTRIBUTE_NAME_CHAR}]*$`)),
      Properties: {
    /**
     * Standard Properties
     */
        "accept": 0,
        "acceptCharset": 0,
        "accessKey": 0,
        "action": 0,
        "allowFullScreen": HAS_BOOLEAN_VALUE,
        "allowTransparency": 0,
        "alt": 0,
    // specifies target context for links with `preload` type
        "as": 0,
        "async": HAS_BOOLEAN_VALUE,
        "autoComplete": 0,
    // autoFocus is polyfilled/normalized by AutoFocusUtils
    // autoFocus: HAS_BOOLEAN_VALUE,
        "autoPlay": HAS_BOOLEAN_VALUE,
        "capture": HAS_BOOLEAN_VALUE,
        "cellPadding": 0,
        "cellSpacing": 0,
        "charSet": 0,
        "challenge": 0,
        "checked": MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        "cite": 0,
        "classID": 0,
        "className": 0,
        "cols": HAS_POSITIVE_NUMERIC_VALUE,
        "colSpan": 0,
        "content": 0,
        "contentEditable": 0,
        "contextMenu": 0,
        "controls": HAS_BOOLEAN_VALUE,
        "coords": 0,
        "crossOrigin": 0,
        "data": 0, // For `<object />` acts as `src`.
        "dateTime": 0,
        "default": HAS_BOOLEAN_VALUE,
        "defer": HAS_BOOLEAN_VALUE,
        "dir": 0,
        "disabled": HAS_BOOLEAN_VALUE,
        "download": HAS_OVERLOADED_BOOLEAN_VALUE,
        "draggable": 0,
        "encType": 0,
        "form": 0,
        "formAction": 0,
        "formEncType": 0,
        "formMethod": 0,
        "formNoValidate": HAS_BOOLEAN_VALUE,
        "formTarget": 0,
        "frameBorder": 0,
        "headers": 0,
        "height": 0,
        "hidden": HAS_BOOLEAN_VALUE,
        "high": 0,
        "href": 0,
        "hrefLang": 0,
        "htmlFor": 0,
        "httpEquiv": 0,
        "icon": 0,
        "id": 0,
        "inputMode": 0,
        "integrity": 0,
        "is": 0,
        "keyParams": 0,
        "keyType": 0,
        "kind": 0,
        "label": 0,
        "lang": 0,
        "list": 0,
        "loop": HAS_BOOLEAN_VALUE,
        "low": 0,
        "manifest": 0,
        "marginHeight": 0,
        "marginWidth": 0,
        "max": 0,
        "maxLength": 0,
        "media": 0,
        "mediaGroup": 0,
        "method": 0,
        "min": 0,
        "minLength": 0,
    // Caution; `option.selected` is not updated if `select.multiple` is
    // disabled with `removeAttribute`.
        "multiple": MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        "muted": MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        "name": 0,
        "nonce": 0,
        "noValidate": HAS_BOOLEAN_VALUE,
        "open": HAS_BOOLEAN_VALUE,
        "optimum": 0,
        "pattern": 0,
        "placeholder": 0,
        "playsInline": HAS_BOOLEAN_VALUE,
        "poster": 0,
        "preload": 0,
        "profile": 0,
        "radioGroup": 0,
        "readOnly": HAS_BOOLEAN_VALUE,
        "referrerPolicy": 0,
        "rel": 0,
        "required": HAS_BOOLEAN_VALUE,
        "reversed": HAS_BOOLEAN_VALUE,
        "role": 0,
        "rows": HAS_POSITIVE_NUMERIC_VALUE,
        "rowSpan": HAS_NUMERIC_VALUE,
        "sandbox": 0,
        "scope": 0,
        "scoped": HAS_BOOLEAN_VALUE,
        "scrolling": 0,
        "seamless": HAS_BOOLEAN_VALUE,
        "selected": MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
        "shape": 0,
        "size": HAS_POSITIVE_NUMERIC_VALUE,
        "sizes": 0,
        "span": HAS_POSITIVE_NUMERIC_VALUE,
        "spellCheck": 0,
        "src": 0,
        "srcDoc": 0,
        "srcLang": 0,
        "srcSet": 0,
        "start": HAS_NUMERIC_VALUE,
        "step": 0,
        "style": 0,
        "summary": 0,
        "tabIndex": 0,
        "target": 0,
        "title": 0,
    // Setting .type throws on non-<input> tags
        "type": 0,
        "useMap": 0,
        "value": 0,
        "width": 0,
        "wmode": 0,
        "wrap": 0,

    /**
     * RDFa Properties
     */
        "about": 0,
        "datatype": 0,
        "inlist": 0,
        "prefix": 0,
    // property is also supported for OpenGraph in meta tags.
        "property": 0,
        "resource": 0,
        "typeof": 0,
        "vocab": 0,

    /**
     * Non-standard Properties
     */
    // autoCapitalize and autoCorrect are supported in Mobile Safari for
    // keyboard hints.
        "autoCapitalize": 0,
        "autoCorrect": 0,
    // autoSave allows WebKit/Blink to persist values of input fields on page reloads
        "autoSave": 0,
    // color is for Safari mask-icon link
        "color": 0,
    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
        "itemProp": 0,
        "itemScope": HAS_BOOLEAN_VALUE,
        "itemType": 0,
    // itemID and itemRef are for Microdata support as well but
    // only specified in the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
        "itemID": 0,
        "itemRef": 0,
    // results show looking glass icon and recent searches on input
    // search fields in WebKit/Blink
        "results": 0,
    // IE-only attribute that specifies security restrictions on an iframe
    // as an alternative to the sandbox attribute on IE<10
        "security": 0,
    // IE-only attribute that controls focus behavior
        "unselectable": 0,
      },
      DOMAttributeNames: {
        acceptCharset: "accept-charset",
        className: "class",
        htmlFor: "for",
        httpEquiv: "http-equiv",
      },
      DOMPropertyNames: {},
    };

    module.exports = HTMLDOMPropertyConfig;
  }, { "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\KeyEscapeUtils.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */

    function escape(key) {
      const escapeRegex = /[=:]/g;
      const escaperLookup = {
        "=": "=0",
        ":": "=2",
      };
      const escapedString = (`${key}`).replace(escapeRegex, (match) => {
        return escaperLookup[match];
      });

      return `$${escapedString}`;
    }

/**
 * Unescape and unwrap key for human-readable display
 *
 * @param {string} key to unescape.
 * @return {string} the unescaped key.
 */
    function unescape(key) {
      const unescapeRegex = /(=0|=2)/g;
      const unescaperLookup = {
        "=0": "=",
        "=2": ":",
      };
      const keySubstring = key[0] === "." && key[1] === "$" ? key.substring(2) : key.substring(1);

      return (`${keySubstring}`).replace(unescapeRegex, (match) => {
        return unescaperLookup[match];
      });
    }

    const KeyEscapeUtils = {
      escape,
      unescape,
    };

    module.exports = KeyEscapeUtils;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\LinkedValueUtils.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const React = require("react/lib/React");
      const ReactPropTypesSecret = require("./ReactPropTypesSecret");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      const hasReadOnlyValue = {
        "button": true,
        "checkbox": true,
        "image": true,
        "hidden": true,
        "radio": true,
        "reset": true,
        "submit": true,
      };

      function _assertSingleLink(inputProps) {
        !(inputProps.checkedLink == null || inputProps.valueLink == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Cannot provide a checkedLink and a valueLink. If you want to use checkedLink, you probably don't want to use valueLink and vice versa.") : _prodInvariant("87") : void 0;
      }
      function _assertValueLink(inputProps) {
        _assertSingleLink(inputProps);
        !(inputProps.value == null && inputProps.onChange == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Cannot provide a valueLink and a value or onChange event. If you want to use value or onChange, you probably don't want to use valueLink.") : _prodInvariant("88") : void 0;
      }

      function _assertCheckedLink(inputProps) {
        _assertSingleLink(inputProps);
        !(inputProps.checked == null && inputProps.onChange == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Cannot provide a checkedLink and a checked property or onChange event. If you want to use checked or onChange, you probably don't want to use checkedLink") : _prodInvariant("89") : void 0;
      }

      const propTypes = {
        value(props, propName, componentName) {
          if (!props[propName] || hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled) {
            return null;
          }
          return new Error("You provided a `value` prop to a form field without an " + "`onChange` handler. This will render a read-only field. If " + "the field should be mutable use `defaultValue`. Otherwise, " + "set either `onChange` or `readOnly`.");
        },
        checked(props, propName, componentName) {
          if (!props[propName] || props.onChange || props.readOnly || props.disabled) {
            return null;
          }
          return new Error("You provided a `checked` prop to a form field without an " + "`onChange` handler. This will render a read-only field. If " + "the field should be mutable use `defaultChecked`. Otherwise, " + "set either `onChange` or `readOnly`.");
        },
        onChange: React.PropTypes.func,
      };

      const loggedTypeFailures = {};
      function getDeclarationErrorAddendum(owner) {
        if (owner) {
          const name = owner.getName();
          if (name) {
            return ` Check the render method of \`${name}\`.`;
          }
        }
        return "";
      }

/**
 * Provide a linked `value` attribute for controlled forms. You should not use
 * this outside of the ReactDOM controlled form components.
 */
      const LinkedValueUtils = {
        checkPropTypes(tagName, props, owner) {
          for (const propName in propTypes) {
            if (propTypes.hasOwnProperty(propName)) {
              var error = propTypes[propName](props, propName, tagName, "prop", null, ReactPropTypesSecret);
            }
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
              loggedTypeFailures[error.message] = true;

              const addendum = getDeclarationErrorAddendum(owner);
              process.env.NODE_ENV !== "production" ? warning(false, "Failed form propType: %s%s", error.message, addendum) : void 0;
            }
          }
        },

  /**
   * @param {object} inputProps Props for form component
   * @return {*} current value of the input either from value prop or link.
   */
        getValue(inputProps) {
          if (inputProps.valueLink) {
            _assertValueLink(inputProps);
            return inputProps.valueLink.value;
          }
          return inputProps.value;
        },

  /**
   * @param {object} inputProps Props for form component
   * @return {*} current checked status of the input either from checked prop
   *             or link.
   */
        getChecked(inputProps) {
          if (inputProps.checkedLink) {
            _assertCheckedLink(inputProps);
            return inputProps.checkedLink.value;
          }
          return inputProps.checked;
        },

  /**
   * @param {object} inputProps Props for form component
   * @param {SyntheticEvent} event change event to handle
   */
        executeOnChange(inputProps, event) {
          if (inputProps.valueLink) {
            _assertValueLink(inputProps);
            return inputProps.valueLink.requestChange(event.target.value);
          } else if (inputProps.checkedLink) {
            _assertCheckedLink(inputProps);
            return inputProps.checkedLink.requestChange(event.target.checked);
          } else if (inputProps.onChange) {
          return inputProps.onChange.call(undefined, event);
        }
        },
      };

      module.exports = LinkedValueUtils;
    }).call(this, require("_process"));
  }, { "./ReactPropTypesSecret": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactPropTypesSecret.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/React": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
      const oneArgumentPooler = function(copyFieldsFrom) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, copyFieldsFrom);
          return instance;
        }
        return new Klass(copyFieldsFrom);
      };

      const twoArgumentPooler = function(a1, a2) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, a1, a2);
          return instance;
        }
        return new Klass(a1, a2);
      };

      const threeArgumentPooler = function(a1, a2, a3) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, a1, a2, a3);
          return instance;
        }
        return new Klass(a1, a2, a3);
      };

      const fourArgumentPooler = function(a1, a2, a3, a4) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, a1, a2, a3, a4);
          return instance;
        }
        return new Klass(a1, a2, a3, a4);
      };

      const standardReleaser = function(instance) {
        const Klass = this;
        !(instance instanceof Klass) ? process.env.NODE_ENV !== "production" ? invariant(false, "Trying to release an instance into a pool of a different type.") : _prodInvariant("25") : void 0;
        instance.destructor();
        if (Klass.instancePool.length < Klass.poolSize) {
          Klass.instancePool.push(instance);
        }
      };

      const DEFAULT_POOL_SIZE = 10;
      const DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances.
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
      const addPoolingTo = function(CopyConstructor, pooler) {
  // Casting as any so that flow ignores the actual implementation and trusts
  // it to match the type we declared
        const NewKlass = CopyConstructor;
        NewKlass.instancePool = [];
        NewKlass.getPooled = pooler || DEFAULT_POOLER;
        if (!NewKlass.poolSize) {
          NewKlass.poolSize = DEFAULT_POOL_SIZE;
        }
        NewKlass.release = standardReleaser;
        return NewKlass;
      };

      const PooledClass = {
        addPoolingTo,
        oneArgumentPooler,
        twoArgumentPooler,
        threeArgumentPooler,
        fourArgumentPooler,
      };

      module.exports = PooledClass;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactBrowserEventEmitter.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const _assign = require("object-assign");

    const EventPluginRegistry = require("./EventPluginRegistry");
    const ReactEventEmitterMixin = require("./ReactEventEmitterMixin");
    const ViewportMetrics = require("./ViewportMetrics");

    const getVendorPrefixedEventName = require("./getVendorPrefixedEventName");
    const isEventSupported = require("./isEventSupported");

/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactEventListener, which is injected and can therefore support pluggable
 *    event sources. This is the only work that occurs in the main thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

    let hasEventPageXY;
    const alreadyListeningTo = {};
    let isMonitoringScrollValue = false;
    let reactTopListenersCounter = 0;

// For events like 'submit' which don't consistently bubble (which we trap at a
// lower node than `document`), binding at `document` would cause duplicate
// events so we don't include them here
    const topEventMapping = {
      topAbort: "abort",
      topAnimationEnd: getVendorPrefixedEventName("animationend") || "animationend",
      topAnimationIteration: getVendorPrefixedEventName("animationiteration") || "animationiteration",
      topAnimationStart: getVendorPrefixedEventName("animationstart") || "animationstart",
      topBlur: "blur",
      topCanPlay: "canplay",
      topCanPlayThrough: "canplaythrough",
      topChange: "change",
      topClick: "click",
      topCompositionEnd: "compositionend",
      topCompositionStart: "compositionstart",
      topCompositionUpdate: "compositionupdate",
      topContextMenu: "contextmenu",
      topCopy: "copy",
      topCut: "cut",
      topDoubleClick: "dblclick",
      topDrag: "drag",
      topDragEnd: "dragend",
      topDragEnter: "dragenter",
      topDragExit: "dragexit",
      topDragLeave: "dragleave",
      topDragOver: "dragover",
      topDragStart: "dragstart",
      topDrop: "drop",
      topDurationChange: "durationchange",
      topEmptied: "emptied",
      topEncrypted: "encrypted",
      topEnded: "ended",
      topError: "error",
      topFocus: "focus",
      topInput: "input",
      topKeyDown: "keydown",
      topKeyPress: "keypress",
      topKeyUp: "keyup",
      topLoadedData: "loadeddata",
      topLoadedMetadata: "loadedmetadata",
      topLoadStart: "loadstart",
      topMouseDown: "mousedown",
      topMouseMove: "mousemove",
      topMouseOut: "mouseout",
      topMouseOver: "mouseover",
      topMouseUp: "mouseup",
      topPaste: "paste",
      topPause: "pause",
      topPlay: "play",
      topPlaying: "playing",
      topProgress: "progress",
      topRateChange: "ratechange",
      topScroll: "scroll",
      topSeeked: "seeked",
      topSeeking: "seeking",
      topSelectionChange: "selectionchange",
      topStalled: "stalled",
      topSuspend: "suspend",
      topTextInput: "textInput",
      topTimeUpdate: "timeupdate",
      topTouchCancel: "touchcancel",
      topTouchEnd: "touchend",
      topTouchMove: "touchmove",
      topTouchStart: "touchstart",
      topTransitionEnd: getVendorPrefixedEventName("transitionend") || "transitionend",
      topVolumeChange: "volumechange",
      topWaiting: "waiting",
      topWheel: "wheel",
    };

/**
 * To ensure no conflicts with other potential React instances on the page
 */
    const topListenersIDKey = `_reactListenersID${String(Math.random()).slice(2)}`;

    function getListeningForDocument(mountAt) {
  // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
  // directly.
      if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
        mountAt[topListenersIDKey] = reactTopListenersCounter++;
        alreadyListeningTo[mountAt[topListenersIDKey]] = {};
      }
      return alreadyListeningTo[mountAt[topListenersIDKey]];
    }

/**
 * `ReactBrowserEventEmitter` is used to attach top-level event listeners. For
 * example:
 *
 *   EventPluginHub.putListener('myID', 'onClick', myFunction);
 *
 * This would allocate a "registration" of `('onClick', myFunction)` on 'myID'.
 *
 * @internal
 */
    var ReactBrowserEventEmitter = _assign({}, ReactEventEmitterMixin, {

  /**
   * Injectable event backend
   */
      ReactEventListener: null,

      injection: {
    /**
     * @param {object} ReactEventListener
     */
        injectReactEventListener(ReactEventListener) {
          ReactEventListener.setHandleTopLevel(ReactBrowserEventEmitter.handleTopLevel);
          ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
        },
      },

  /**
   * Sets whether or not any created callbacks should be enabled.
   *
   * @param {boolean} enabled True if callbacks should be enabled.
   */
      setEnabled(enabled) {
        if (ReactBrowserEventEmitter.ReactEventListener) {
          ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
        }
      },

  /**
   * @return {boolean} True if callbacks are enabled.
   */
      isEnabled() {
        return !!(ReactBrowserEventEmitter.ReactEventListener && ReactBrowserEventEmitter.ReactEventListener.isEnabled());
      },

  /**
   * We listen for bubbled touch events on the document object.
   *
   * Firefox v8.01 (and possibly others) exhibited strange behavior when
   * mounting `onmousemove` events at some node that was not the document
   * element. The symptoms were that if your mouse is not moving over something
   * contained within that mount point (for example on the background) the
   * top-level listeners for `onmousemove` won't be called. However, if you
   * register the `mousemove` on the document object, then it will of course
   * catch all `mousemove`s. This along with iOS quirks, justifies restricting
   * top-level listeners to the document object only, at least for these
   * movement types of events and possibly all events.
   *
   * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
   *
   * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
   * they bubble to document.
   *
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {object} contentDocumentHandle Document which owns the container
   */
      listenTo(registrationName, contentDocumentHandle) {
        const mountAt = contentDocumentHandle;
        const isListening = getListeningForDocument(mountAt);
        const dependencies = EventPluginRegistry.registrationNameDependencies[registrationName];

        for (let i = 0; i < dependencies.length; i++) {
          const dependency = dependencies[i];
          if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
            if (dependency === "topWheel") {
              if (isEventSupported("wheel")) {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent("topWheel", "wheel", mountAt);
            } else if (isEventSupported("mousewheel")) {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent("topWheel", "mousewheel", mountAt);
            } else {
            // Firefox needs to capture a different mouse scroll event.
            // @see http://www.quirksmode.org/dom/events/tests/scroll.html
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent("topWheel", "DOMMouseScroll", mountAt);
            }
            } else if (dependency === "topScroll") {
            if (isEventSupported("scroll", true)) {
              ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent("topScroll", "scroll", mountAt);
            } else {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent("topScroll", "scroll", ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE);
            }
          } else if (dependency === "topFocus" || dependency === "topBlur") {
            if (isEventSupported("focus", true)) {
              ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent("topFocus", "focus", mountAt);
              ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent("topBlur", "blur", mountAt);
            } else if (isEventSupported("focusin")) {
            // IE has `focusin` and `focusout` events which bubble.
            // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent("topFocus", "focusin", mountAt);
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent("topBlur", "focusout", mountAt);
          }

          // to make sure blur and focus event listeners are only attached once
            isListening.topBlur = true;
            isListening.topFocus = true;
          } else if (topEventMapping.hasOwnProperty(dependency)) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(dependency, topEventMapping[dependency], mountAt);
          }

            isListening[dependency] = true;
          }
        }
      },

      trapBubbledEvent(topLevelType, handlerBaseName, handle) {
        return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelType, handlerBaseName, handle);
      },

      trapCapturedEvent(topLevelType, handlerBaseName, handle) {
        return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelType, handlerBaseName, handle);
      },

  /**
   * Protect against document.createEvent() returning null
   * Some popup blocker extensions appear to do this:
   * https://github.com/facebook/react/issues/6887
   */
      supportsEventPageXY() {
        if (!document.createEvent) {
          return false;
        }
        const ev = document.createEvent("MouseEvent");
        return ev != null && "pageX" in ev;
      },

  /**
   * Listens to window scroll and resize events. We cache scroll values so that
   * application code can access them without triggering reflows.
   *
   * ViewportMetrics is only used by SyntheticMouse/TouchEvent and only when
   * pageX/pageY isn't supported (legacy browsers).
   *
   * NOTE: Scroll events do not bubble.
   *
   * @see http://www.quirksmode.org/dom/events/scroll.html
   */
      ensureScrollValueMonitoring() {
        if (hasEventPageXY === undefined) {
          hasEventPageXY = ReactBrowserEventEmitter.supportsEventPageXY();
        }
        if (!hasEventPageXY && !isMonitoringScrollValue) {
          const refresh = ViewportMetrics.refreshScrollValues;
          ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
          isMonitoringScrollValue = true;
        }
      },

    });

    module.exports = ReactBrowserEventEmitter;
  }, { "./EventPluginRegistry": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginRegistry.js", "./ReactEventEmitterMixin": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEventEmitterMixin.js", "./ViewportMetrics": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ViewportMetrics.js", "./getVendorPrefixedEventName": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getVendorPrefixedEventName.js", "./isEventSupported": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isEventSupported.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactChildReconciler.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const ReactReconciler = require("./ReactReconciler");

      const instantiateReactComponent = require("./instantiateReactComponent");
      const KeyEscapeUtils = require("./KeyEscapeUtils");
      const shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
      const traverseAllChildren = require("./traverseAllChildren");
      const warning = require("fbjs/lib/warning");

      let ReactComponentTreeHook;

      if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") {
  // Temporary hack.
  // Inline requires don't work well with Jest:
  // https://github.com/facebook/react/issues/7240
  // Remove the inline requires when we don't need them anymore:
  // https://github.com/facebook/react/pull/7178
        ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
      }

      function instantiateChild(childInstances, child, name, selfDebugID) {
  // We found a component instance.
        const keyUnique = childInstances[name] === undefined;
        if (process.env.NODE_ENV !== "production") {
          if (!ReactComponentTreeHook) {
            ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
          }
          if (!keyUnique) {
            process.env.NODE_ENV !== "production" ? warning(false, "flattenChildren(...): Encountered two children with the same key, " + "`%s`. Child keys must be unique; when two children share a key, only " + "the first child will be used.%s", KeyEscapeUtils.unescape(name), ReactComponentTreeHook.getStackAddendumByID(selfDebugID)) : void 0;
          }
        }
        if (child != null && keyUnique) {
          childInstances[name] = instantiateReactComponent(child, true);
        }
      }

/**
 * ReactChildReconciler provides helpers for initializing or updating a set of
 * children. Its output is suitable for passing it onto ReactMultiChild which
 * does diffed reordering and insertion.
 */
      const ReactChildReconciler = {
  /**
   * Generates a "mount image" for each of the supplied children. In the case
   * of `ReactDOMComponent`, a mount image is a string of markup.
   *
   * @param {?object} nestedChildNodes Nested child maps.
   * @return {?object} A set of child instances.
   * @internal
   */
        instantiateChildren(nestedChildNodes, transaction, context, selfDebugID // 0 in production and for roots
  ) {
          if (nestedChildNodes == null) {
            return null;
          }
          const childInstances = {};

          if (process.env.NODE_ENV !== "production") {
            traverseAllChildren(nestedChildNodes, (childInsts, child, name) => {
              return instantiateChild(childInsts, child, name, selfDebugID);
            }, childInstances);
          } else {
            traverseAllChildren(nestedChildNodes, instantiateChild, childInstances);
          }
          return childInstances;
        },

  /**
   * Updates the rendered children and returns a new set of children.
   *
   * @param {?object} prevChildren Previously initialized set of children.
   * @param {?object} nextChildren Flat child element maps.
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   * @return {?object} A new set of child instances.
   * @internal
   */
        updateChildren(prevChildren, nextChildren, mountImages, removedNodes, transaction, hostParent, hostContainerInfo, context, selfDebugID // 0 in production and for roots
  ) {
    // We currently don't have a way to track moves here but if we use iterators
    // instead of for..in we can zip the iterators and check if an item has
    // moved.
    // TODO: If nothing has changed, return the prevChildren object so that we
    // can quickly bailout if nothing has changed.
          if (!nextChildren && !prevChildren) {
            return;
          }
          let name;
          let prevChild;
          for (name in nextChildren) {
            if (!nextChildren.hasOwnProperty(name)) {
              continue;
            }
            prevChild = prevChildren && prevChildren[name];
            const prevElement = prevChild && prevChild._currentElement;
            const nextElement = nextChildren[name];
            if (prevChild != null && shouldUpdateReactComponent(prevElement, nextElement)) {
              ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
              nextChildren[name] = prevChild;
            } else {
              if (prevChild) {
                removedNodes[name] = ReactReconciler.getHostNode(prevChild);
                ReactReconciler.unmountComponent(prevChild, false);
              }
        // The child must be instantiated before it's mounted.
              const nextChildInstance = instantiateReactComponent(nextElement, true);
              nextChildren[name] = nextChildInstance;
        // Creating mount image now ensures refs are resolved in right order
        // (see https://github.com/facebook/react/pull/7101 for explanation).
              const nextChildMountImage = ReactReconciler.mountComponent(nextChildInstance, transaction, hostParent, hostContainerInfo, context, selfDebugID);
              mountImages.push(nextChildMountImage);
            }
          }
    // Unmount children that are no longer present.
          for (name in prevChildren) {
            if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
              prevChild = prevChildren[name];
              removedNodes[name] = ReactReconciler.getHostNode(prevChild);
              ReactReconciler.unmountComponent(prevChild, false);
            }
          }
        },

  /**
   * Unmounts all rendered children. This should be used to clean up children
   * when this component is unmounted.
   *
   * @param {?object} renderedChildren Previously initialized set of children.
   * @internal
   */
        unmountChildren(renderedChildren, safely) {
          for (const name in renderedChildren) {
            if (renderedChildren.hasOwnProperty(name)) {
              const renderedChild = renderedChildren[name];
              ReactReconciler.unmountComponent(renderedChild, safely);
            }
          }
        },

      };

      module.exports = ReactChildReconciler;
    }).call(this, require("_process"));
  }, { "./KeyEscapeUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\KeyEscapeUtils.js", "./ReactReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js", "./instantiateReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\instantiateReactComponent.js", "./shouldUpdateReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\shouldUpdateReactComponent.js", "./traverseAllChildren": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\traverseAllChildren.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactComponentBrowserEnvironment.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const DOMChildrenOperations = require("./DOMChildrenOperations");
    const ReactDOMIDOperations = require("./ReactDOMIDOperations");

/**
 * Abstracts away all functionality of the reconciler that requires knowledge of
 * the browser context. TODO: These callers should be refactored to avoid the
 * need for this injection.
 */
    const ReactComponentBrowserEnvironment = {

      processChildrenUpdates: ReactDOMIDOperations.dangerouslyProcessChildrenUpdates,

      replaceNodeWithMarkup: DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup,

    };

    module.exports = ReactComponentBrowserEnvironment;
  }, { "./DOMChildrenOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMChildrenOperations.js", "./ReactDOMIDOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMIDOperations.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactComponentEnvironment.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

      let injected = false;

      var ReactComponentEnvironment = {

  /**
   * Optionally injectable hook for swapping out mount images in the middle of
   * the tree.
   */
        replaceNodeWithMarkup: null,

  /**
   * Optionally injectable hook for processing a queue of child updates. Will
   * later move into MultiChildComponents.
   */
        processChildrenUpdates: null,

        injection: {
          injectEnvironment(environment) {
            injected ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactCompositeComponent: injectEnvironment() can only be called once.") : _prodInvariant("104") : void 0;
            ReactComponentEnvironment.replaceNodeWithMarkup = environment.replaceNodeWithMarkup;
            ReactComponentEnvironment.processChildrenUpdates = environment.processChildrenUpdates;
            injected = true;
          },
        },

      };

      module.exports = ReactComponentEnvironment;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactCompositeComponent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const React = require("react/lib/React");
      const ReactComponentEnvironment = require("./ReactComponentEnvironment");
      const ReactCurrentOwner = require("react/lib/ReactCurrentOwner");
      const ReactErrorUtils = require("./ReactErrorUtils");
      const ReactInstanceMap = require("./ReactInstanceMap");
      const ReactInstrumentation = require("./ReactInstrumentation");
      const ReactNodeTypes = require("./ReactNodeTypes");
      const ReactReconciler = require("./ReactReconciler");

      if (process.env.NODE_ENV !== "production") {
        var checkReactTypeSpec = require("./checkReactTypeSpec");
      }

      const emptyObject = require("fbjs/lib/emptyObject");
      const invariant = require("fbjs/lib/invariant");
      const shallowEqual = require("fbjs/lib/shallowEqual");
      const shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
      const warning = require("fbjs/lib/warning");

      const CompositeTypes = {
        ImpureClass: 0,
        PureClass: 1,
        StatelessFunctional: 2,
      };

      function StatelessComponent(Component) {}
      StatelessComponent.prototype.render = function() {
        const Component = ReactInstanceMap.get(this)._currentElement.type;
        const element = Component(this.props, this.context, this.updater);
        warnIfInvalidElement(Component, element);
        return element;
      };

      function warnIfInvalidElement(Component, element) {
        if (process.env.NODE_ENV !== "production") {
          process.env.NODE_ENV !== "production" ? warning(element === null || element === false || React.isValidElement(element), "%s(...): A valid React element (or null) must be returned. You may have " + "returned undefined, an array or some other invalid object.", Component.displayName || Component.name || "Component") : void 0;
          process.env.NODE_ENV !== "production" ? warning(!Component.childContextTypes, "%s(...): childContextTypes cannot be defined on a functional component.", Component.displayName || Component.name || "Component") : void 0;
        }
      }

      function shouldConstruct(Component) {
        return !!(Component.prototype && Component.prototype.isReactComponent);
      }

      function isPureComponent(Component) {
        return !!(Component.prototype && Component.prototype.isPureReactComponent);
      }

// Separated into a function to contain deoptimizations caused by try/finally.
      function measureLifeCyclePerf(fn, debugID, timerType) {
        if (debugID === 0) {
    // Top-level wrappers (see ReactMount) and empty components (see
    // ReactDOMEmptyComponent) are invisible to hooks and devtools.
    // Both are implementation details that should go away in the future.
          return fn();
        }

        ReactInstrumentation.debugTool.onBeginLifeCycleTimer(debugID, timerType);
        try {
          return fn();
        } finally {
          ReactInstrumentation.debugTool.onEndLifeCycleTimer(debugID, timerType);
        }
      }

/**
 * ------------------ The Life-Cycle of a Composite Component ------------------
 *
 * - constructor: Initialization of state. The instance is now retained.
 *   - componentWillMount
 *   - render
 *   - [children's constructors]
 *     - [children's componentWillMount and render]
 *     - [children's componentDidMount]
 *     - componentDidMount
 *
 *       Update Phases:
 *       - componentWillReceiveProps (only called if parent updated)
 *       - shouldComponentUpdate
 *         - componentWillUpdate
 *           - render
 *           - [children's constructors or receive props phases]
 *         - componentDidUpdate
 *
 *     - componentWillUnmount
 *     - [children's componentWillUnmount]
 *   - [children destroyed]
 * - (destroyed): The instance is now blank, released by React and ready for GC.
 *
 * -----------------------------------------------------------------------------
 */

/**
 * An incrementing ID assigned to each component when it is mounted. This is
 * used to enforce the order in which `ReactUpdates` updates dirty components.
 *
 * @private
 */
      let nextMountID = 1;

/**
 * @lends {ReactCompositeComponent.prototype}
 */
      const ReactCompositeComponent = {

  /**
   * Base constructor for all composite component.
   *
   * @param {ReactElement} element
   * @final
   * @internal
   */
        construct(element) {
          this._currentElement = element;
          this._rootNodeID = 0;
          this._compositeType = null;
          this._instance = null;
          this._hostParent = null;
          this._hostContainerInfo = null;

    // See ReactUpdateQueue
          this._updateBatchNumber = null;
          this._pendingElement = null;
          this._pendingStateQueue = null;
          this._pendingReplaceState = false;
          this._pendingForceUpdate = false;

          this._renderedNodeType = null;
          this._renderedComponent = null;
          this._context = null;
          this._mountOrder = 0;
          this._topLevelWrapper = null;

    // See ReactUpdates and ReactUpdateQueue.
          this._pendingCallbacks = null;

    // ComponentWillUnmount shall only be called once
          this._calledComponentWillUnmount = false;

          if (process.env.NODE_ENV !== "production") {
            this._warnedAboutRefsInRender = false;
          }
        },

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {?object} hostParent
   * @param {?object} hostContainerInfo
   * @param {?object} context
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
        mountComponent(transaction, hostParent, hostContainerInfo, context) {
          const _this = this;

          this._context = context;
          this._mountOrder = nextMountID++;
          this._hostParent = hostParent;
          this._hostContainerInfo = hostContainerInfo;

          const publicProps = this._currentElement.props;
          const publicContext = this._processContext(context);

          const Component = this._currentElement.type;

          const updateQueue = transaction.getUpdateQueue();

    // Initialize the public class
          const doConstruct = shouldConstruct(Component);
          let inst = this._constructComponent(doConstruct, publicProps, publicContext, updateQueue);
          let renderedElement;

    // Support functional components
          if (!doConstruct && (inst == null || inst.render == null)) {
            renderedElement = inst;
            warnIfInvalidElement(Component, renderedElement);
            !(inst === null || inst === false || React.isValidElement(inst)) ? process.env.NODE_ENV !== "production" ? invariant(false, "%s(...): A valid React element (or null) must be returned. You may have returned undefined, an array or some other invalid object.", Component.displayName || Component.name || "Component") : _prodInvariant("105", Component.displayName || Component.name || "Component") : void 0;
            inst = new StatelessComponent(Component);
            this._compositeType = CompositeTypes.StatelessFunctional;
          } else if (isPureComponent(Component)) {
            this._compositeType = CompositeTypes.PureClass;
          } else {
            this._compositeType = CompositeTypes.ImpureClass;
          }

          if (process.env.NODE_ENV !== "production") {
      // This will throw later in _renderValidatedComponent, but add an early
      // warning now to help debugging
            if (inst.render == null) {
              process.env.NODE_ENV !== "production" ? warning(false, "%s(...): No `render` method found on the returned component " + "instance: you may have forgotten to define `render`.", Component.displayName || Component.name || "Component") : void 0;
            }

            const propsMutated = inst.props !== publicProps;
            const componentName = Component.displayName || Component.name || "Component";

            process.env.NODE_ENV !== "production" ? warning(inst.props === undefined || !propsMutated, "%s(...): When calling super() in `%s`, make sure to pass " + "up the same props that your component's constructor was passed.", componentName, componentName) : void 0;
          }

    // These should be set up in the constructor, but as a convenience for
    // simpler class abstractions, we set them up after the fact.
          inst.props = publicProps;
          inst.context = publicContext;
          inst.refs = emptyObject;
          inst.updater = updateQueue;

          this._instance = inst;

    // Store a reference from the instance back to the internal representation
          ReactInstanceMap.set(inst, this);

          if (process.env.NODE_ENV !== "production") {
      // Since plain JS classes are defined without any special initialization
      // logic, we can not catch common errors early. Therefore, we have to
      // catch them here, at initialization time, instead.
            process.env.NODE_ENV !== "production" ? warning(!inst.getInitialState || inst.getInitialState.isReactClassApproved || inst.state, "getInitialState was defined on %s, a plain JavaScript class. " + "This is only supported for classes created using React.createClass. " + "Did you mean to define a state property instead?", this.getName() || "a component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(!inst.getDefaultProps || inst.getDefaultProps.isReactClassApproved, "getDefaultProps was defined on %s, a plain JavaScript class. " + "This is only supported for classes created using React.createClass. " + "Use a static property to define defaultProps instead.", this.getName() || "a component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(!inst.propTypes, "propTypes was defined as an instance property on %s. Use a static " + "property to define propTypes instead.", this.getName() || "a component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(!inst.contextTypes, "contextTypes was defined as an instance property on %s. Use a " + "static property to define contextTypes instead.", this.getName() || "a component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(typeof inst.componentShouldUpdate !== "function", "%s has a method called " + "componentShouldUpdate(). Did you mean shouldComponentUpdate()? " + "The name is phrased as a question because the function is " + "expected to return a value.", this.getName() || "A component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(typeof inst.componentDidUnmount !== "function", "%s has a method called " + "componentDidUnmount(). But there is no such lifecycle method. " + "Did you mean componentWillUnmount()?", this.getName() || "A component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(typeof inst.componentWillRecieveProps !== "function", "%s has a method called " + "componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", this.getName() || "A component") : void 0;
          }

          let initialState = inst.state;
          if (initialState === undefined) {
            inst.state = initialState = null;
          }
          !(typeof initialState === "object" && !Array.isArray(initialState)) ? process.env.NODE_ENV !== "production" ? invariant(false, "%s.state: must be set to an object or null", this.getName() || "ReactCompositeComponent") : _prodInvariant("106", this.getName() || "ReactCompositeComponent") : void 0;

          this._pendingStateQueue = null;
          this._pendingReplaceState = false;
          this._pendingForceUpdate = false;

          let markup;
          if (inst.unstable_handleError) {
            markup = this.performInitialMountWithErrorHandling(renderedElement, hostParent, hostContainerInfo, transaction, context);
          } else {
            markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
          }

          if (inst.componentDidMount) {
            if (process.env.NODE_ENV !== "production") {
              transaction.getReactMountReady().enqueue(() => {
                measureLifeCyclePerf(() => {
                return inst.componentDidMount();
              }, _this._debugID, "componentDidMount");
              });
            } else {
              transaction.getReactMountReady().enqueue(inst.componentDidMount, inst);
            }
          }

          return markup;
        },

        _constructComponent(doConstruct, publicProps, publicContext, updateQueue) {
          if (process.env.NODE_ENV !== "production") {
            ReactCurrentOwner.current = this;
            try {
              return this._constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue);
            } finally {
              ReactCurrentOwner.current = null;
            }
          } else {
            return this._constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue);
          }
        },

        _constructComponentWithoutOwner(doConstruct, publicProps, publicContext, updateQueue) {
          const Component = this._currentElement.type;

          if (doConstruct) {
            if (process.env.NODE_ENV !== "production") {
              return measureLifeCyclePerf(() => {
                return new Component(publicProps, publicContext, updateQueue);
              }, this._debugID, "ctor");
            }
            return new Component(publicProps, publicContext, updateQueue);
          }

    // This can still be an instance in case of factory components
    // but we'll count this as time spent rendering as the more common case.
          if (process.env.NODE_ENV !== "production") {
            return measureLifeCyclePerf(() => {
              return Component(publicProps, publicContext, updateQueue);
            }, this._debugID, "render");
          }
          return Component(publicProps, publicContext, updateQueue);
        },

        performInitialMountWithErrorHandling(renderedElement, hostParent, hostContainerInfo, transaction, context) {
          let markup;
          let checkpoint = transaction.checkpoint();
          try {
            markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
          } catch (e) {
      // Roll back to checkpoint, handle error (which may add items to the transaction), and take a new checkpoint
            transaction.rollback(checkpoint);
            this._instance.unstable_handleError(e);
            if (this._pendingStateQueue) {
              this._instance.state = this._processPendingState(this._instance.props, this._instance.context);
            }
            checkpoint = transaction.checkpoint();

            this._renderedComponent.unmountComponent(true);
            transaction.rollback(checkpoint);

      // Try again - we've informed the component about the error, so they can render an error message this time.
      // If this throws again, the error will bubble up (and can be caught by a higher error boundary).
            markup = this.performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context);
          }
          return markup;
        },

        performInitialMount(renderedElement, hostParent, hostContainerInfo, transaction, context) {
          const inst = this._instance;

          let debugID = 0;
          if (process.env.NODE_ENV !== "production") {
            debugID = this._debugID;
          }

          if (inst.componentWillMount) {
            if (process.env.NODE_ENV !== "production") {
              measureLifeCyclePerf(() => {
                return inst.componentWillMount();
              }, debugID, "componentWillMount");
            } else {
              inst.componentWillMount();
            }
      // When mounting, calls to `setState` by `componentWillMount` will set
      // `this._pendingStateQueue` without triggering a re-render.
            if (this._pendingStateQueue) {
              inst.state = this._processPendingState(inst.props, inst.context);
            }
          }

    // If not a stateless component, we now render
          if (renderedElement === undefined) {
            renderedElement = this._renderValidatedComponent();
          }

          const nodeType = ReactNodeTypes.getType(renderedElement);
          this._renderedNodeType = nodeType;
          const child = this._instantiateReactComponent(renderedElement, nodeType !== ReactNodeTypes.EMPTY /* shouldHaveDebugID */
    );
          this._renderedComponent = child;

          const markup = ReactReconciler.mountComponent(child, transaction, hostParent, hostContainerInfo, this._processChildContext(context), debugID);

          if (process.env.NODE_ENV !== "production") {
            if (debugID !== 0) {
              const childDebugIDs = child._debugID !== 0 ? [child._debugID] : [];
              ReactInstrumentation.debugTool.onSetChildren(debugID, childDebugIDs);
            }
          }

          return markup;
        },

        getHostNode() {
          return ReactReconciler.getHostNode(this._renderedComponent);
        },

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
        unmountComponent(safely) {
          if (!this._renderedComponent) {
            return;
          }

          const inst = this._instance;

          if (inst.componentWillUnmount && !inst._calledComponentWillUnmount) {
            inst._calledComponentWillUnmount = true;

            if (safely) {
              const name = `${this.getName()}.componentWillUnmount()`;
              ReactErrorUtils.invokeGuardedCallback(name, inst.componentWillUnmount.bind(inst));
            } else if (process.env.NODE_ENV !== "production") {
              measureLifeCyclePerf(() => {
              return inst.componentWillUnmount();
            }, this._debugID, "componentWillUnmount");
            } else {
              inst.componentWillUnmount();
            }
          }

          if (this._renderedComponent) {
            ReactReconciler.unmountComponent(this._renderedComponent, safely);
            this._renderedNodeType = null;
            this._renderedComponent = null;
            this._instance = null;
          }

    // Reset pending fields
    // Even if this component is scheduled for another update in ReactUpdates,
    // it would still be ignored because these fields are reset.
          this._pendingStateQueue = null;
          this._pendingReplaceState = false;
          this._pendingForceUpdate = false;
          this._pendingCallbacks = null;
          this._pendingElement = null;

    // These fields do not really need to be reset since this object is no
    // longer accessible.
          this._context = null;
          this._rootNodeID = 0;
          this._topLevelWrapper = null;

    // Delete the reference from the instance to this internal representation
    // which allow the internals to be properly cleaned up even if the user
    // leaks a reference to the public instance.
          ReactInstanceMap.remove(inst);

    // Some existing components rely on inst.props even after they've been
    // destroyed (in event handlers).
    // TODO: inst.props = null;
    // TODO: inst.state = null;
    // TODO: inst.context = null;
        },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
        _maskContext(context) {
          const Component = this._currentElement.type;
          const contextTypes = Component.contextTypes;
          if (!contextTypes) {
            return emptyObject;
          }
          const maskedContext = {};
          for (const contextName in contextTypes) {
            maskedContext[contextName] = context[contextName];
          }
          return maskedContext;
        },

  /**
   * Filters the context object to only contain keys specified in
   * `contextTypes`, and asserts that they are valid.
   *
   * @param {object} context
   * @return {?object}
   * @private
   */
        _processContext(context) {
          const maskedContext = this._maskContext(context);
          if (process.env.NODE_ENV !== "production") {
            const Component = this._currentElement.type;
            if (Component.contextTypes) {
              this._checkContextTypes(Component.contextTypes, maskedContext, "context");
            }
          }
          return maskedContext;
        },

  /**
   * @param {object} currentContext
   * @return {object}
   * @private
   */
        _processChildContext(currentContext) {
          const Component = this._currentElement.type;
          const inst = this._instance;
          let childContext;

          if (inst.getChildContext) {
            if (process.env.NODE_ENV !== "production") {
              ReactInstrumentation.debugTool.onBeginProcessingChildContext();
              try {
                childContext = inst.getChildContext();
              } finally {
                ReactInstrumentation.debugTool.onEndProcessingChildContext();
              }
            } else {
              childContext = inst.getChildContext();
            }
          }

          if (childContext) {
            !(typeof Component.childContextTypes === "object") ? process.env.NODE_ENV !== "production" ? invariant(false, "%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", this.getName() || "ReactCompositeComponent") : _prodInvariant("107", this.getName() || "ReactCompositeComponent") : void 0;
            if (process.env.NODE_ENV !== "production") {
              this._checkContextTypes(Component.childContextTypes, childContext, "childContext");
            }
            for (const name in childContext) {
              !(name in Component.childContextTypes) ? process.env.NODE_ENV !== "production" ? invariant(false, "%s.getChildContext(): key \"%s\" is not defined in childContextTypes.", this.getName() || "ReactCompositeComponent", name) : _prodInvariant("108", this.getName() || "ReactCompositeComponent", name) : void 0;
            }
            return _assign({}, currentContext, childContext);
          }
          return currentContext;
        },

  /**
   * Assert that the context types are valid
   *
   * @param {object} typeSpecs Map of context field to a ReactPropType
   * @param {object} values Runtime values that need to be type-checked
   * @param {string} location e.g. "prop", "context", "child context"
   * @private
   */
        _checkContextTypes(typeSpecs, values, location) {
          if (process.env.NODE_ENV !== "production") {
            checkReactTypeSpec(typeSpecs, values, location, this.getName(), null, this._debugID);
          }
        },

        receiveComponent(nextElement, transaction, nextContext) {
          const prevElement = this._currentElement;
          const prevContext = this._context;

          this._pendingElement = null;

          this.updateComponent(transaction, prevElement, nextElement, prevContext, nextContext);
        },

  /**
   * If any of `_pendingElement`, `_pendingStateQueue`, or `_pendingForceUpdate`
   * is set, update the component.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
        performUpdateIfNecessary(transaction) {
          if (this._pendingElement != null) {
            ReactReconciler.receiveComponent(this, this._pendingElement, transaction, this._context);
          } else if (this._pendingStateQueue !== null || this._pendingForceUpdate) {
            this.updateComponent(transaction, this._currentElement, this._currentElement, this._context, this._context);
          } else {
            this._updateBatchNumber = null;
          }
        },

  /**
   * Perform an update to a mounted component. The componentWillReceiveProps and
   * shouldComponentUpdate methods are called, then (assuming the update isn't
   * skipped) the remaining update lifecycle methods are called and the DOM
   * representation is updated.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevParentElement
   * @param {ReactElement} nextParentElement
   * @internal
   * @overridable
   */
        updateComponent(transaction, prevParentElement, nextParentElement, prevUnmaskedContext, nextUnmaskedContext) {
          const inst = this._instance;
          !(inst != null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Attempted to update component `%s` that has already been unmounted (or failed to mount).", this.getName() || "ReactCompositeComponent") : _prodInvariant("136", this.getName() || "ReactCompositeComponent") : void 0;

          let willReceive = false;
          let nextContext;

    // Determine if the context has changed or not
          if (this._context === nextUnmaskedContext) {
            nextContext = inst.context;
          } else {
            nextContext = this._processContext(nextUnmaskedContext);
            willReceive = true;
          }

          const prevProps = prevParentElement.props;
          const nextProps = nextParentElement.props;

    // Not a simple state update but a props update
          if (prevParentElement !== nextParentElement) {
            willReceive = true;
          }

    // An update here will schedule an update but immediately set
    // _pendingStateQueue which will ensure that any state updates gets
    // immediately reconciled instead of waiting for the next batch.
          if (willReceive && inst.componentWillReceiveProps) {
            if (process.env.NODE_ENV !== "production") {
              measureLifeCyclePerf(() => {
                return inst.componentWillReceiveProps(nextProps, nextContext);
              }, this._debugID, "componentWillReceiveProps");
            } else {
              inst.componentWillReceiveProps(nextProps, nextContext);
            }
          }

          const nextState = this._processPendingState(nextProps, nextContext);
          let shouldUpdate = true;

          if (!this._pendingForceUpdate) {
            if (inst.shouldComponentUpdate) {
              if (process.env.NODE_ENV !== "production") {
                shouldUpdate = measureLifeCyclePerf(() => {
                return inst.shouldComponentUpdate(nextProps, nextState, nextContext);
              }, this._debugID, "shouldComponentUpdate");
              } else {
                shouldUpdate = inst.shouldComponentUpdate(nextProps, nextState, nextContext);
              }
            } else if (this._compositeType === CompositeTypes.PureClass) {
              shouldUpdate = !shallowEqual(prevProps, nextProps) || !shallowEqual(inst.state, nextState);
            }
          }

          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(shouldUpdate !== undefined, "%s.shouldComponentUpdate(): Returned undefined instead of a " + "boolean value. Make sure to return true or false.", this.getName() || "ReactCompositeComponent") : void 0;
          }

          this._updateBatchNumber = null;
          if (shouldUpdate) {
            this._pendingForceUpdate = false;
      // Will set `this.props`, `this.state` and `this.context`.
            this._performComponentUpdate(nextParentElement, nextProps, nextState, nextContext, transaction, nextUnmaskedContext);
          } else {
      // If it's determined that a component should not update, we still want
      // to set props and state but we shortcut the rest of the update.
            this._currentElement = nextParentElement;
            this._context = nextUnmaskedContext;
            inst.props = nextProps;
            inst.state = nextState;
            inst.context = nextContext;
          }
        },

        _processPendingState(props, context) {
          const inst = this._instance;
          const queue = this._pendingStateQueue;
          const replace = this._pendingReplaceState;
          this._pendingReplaceState = false;
          this._pendingStateQueue = null;

          if (!queue) {
            return inst.state;
          }

          if (replace && queue.length === 1) {
            return queue[0];
          }

          const nextState = _assign({}, replace ? queue[0] : inst.state);
          for (let i = replace ? 1 : 0; i < queue.length; i++) {
            const partial = queue[i];
            _assign(nextState, typeof partial === "function" ? partial.call(inst, nextState, props, context) : partial);
          }

          return nextState;
        },

  /**
   * Merges new props and state, notifies delegate methods of update and
   * performs update.
   *
   * @param {ReactElement} nextElement Next element
   * @param {object} nextProps Next public object to set as properties.
   * @param {?object} nextState Next object to set as state.
   * @param {?object} nextContext Next public object to set as context.
   * @param {ReactReconcileTransaction} transaction
   * @param {?object} unmaskedContext
   * @private
   */
        _performComponentUpdate(nextElement, nextProps, nextState, nextContext, transaction, unmaskedContext) {
          const _this2 = this;

          const inst = this._instance;

          const hasComponentDidUpdate = Boolean(inst.componentDidUpdate);
          let prevProps;
          let prevState;
          let prevContext;
          if (hasComponentDidUpdate) {
            prevProps = inst.props;
            prevState = inst.state;
            prevContext = inst.context;
          }

          if (inst.componentWillUpdate) {
            if (process.env.NODE_ENV !== "production") {
              measureLifeCyclePerf(() => {
                return inst.componentWillUpdate(nextProps, nextState, nextContext);
              }, this._debugID, "componentWillUpdate");
            } else {
              inst.componentWillUpdate(nextProps, nextState, nextContext);
            }
          }

          this._currentElement = nextElement;
          this._context = unmaskedContext;
          inst.props = nextProps;
          inst.state = nextState;
          inst.context = nextContext;

          this._updateRenderedComponent(transaction, unmaskedContext);

          if (hasComponentDidUpdate) {
            if (process.env.NODE_ENV !== "production") {
              transaction.getReactMountReady().enqueue(() => {
                measureLifeCyclePerf(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), _this2._debugID, "componentDidUpdate");
              });
            } else {
              transaction.getReactMountReady().enqueue(inst.componentDidUpdate.bind(inst, prevProps, prevState, prevContext), inst);
            }
          }
        },

  /**
   * Call the component's `render` method and update the DOM accordingly.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
        _updateRenderedComponent(transaction, context) {
          const prevComponentInstance = this._renderedComponent;
          const prevRenderedElement = prevComponentInstance._currentElement;
          const nextRenderedElement = this._renderValidatedComponent();

          let debugID = 0;
          if (process.env.NODE_ENV !== "production") {
            debugID = this._debugID;
          }

          if (shouldUpdateReactComponent(prevRenderedElement, nextRenderedElement)) {
            ReactReconciler.receiveComponent(prevComponentInstance, nextRenderedElement, transaction, this._processChildContext(context));
          } else {
            const oldHostNode = ReactReconciler.getHostNode(prevComponentInstance);
            ReactReconciler.unmountComponent(prevComponentInstance, false);

            const nodeType = ReactNodeTypes.getType(nextRenderedElement);
            this._renderedNodeType = nodeType;
            const child = this._instantiateReactComponent(nextRenderedElement, nodeType !== ReactNodeTypes.EMPTY /* shouldHaveDebugID */
      );
            this._renderedComponent = child;

            const nextMarkup = ReactReconciler.mountComponent(child, transaction, this._hostParent, this._hostContainerInfo, this._processChildContext(context), debugID);

            if (process.env.NODE_ENV !== "production") {
              if (debugID !== 0) {
                const childDebugIDs = child._debugID !== 0 ? [child._debugID] : [];
                ReactInstrumentation.debugTool.onSetChildren(debugID, childDebugIDs);
              }
            }

            this._replaceNodeWithMarkup(oldHostNode, nextMarkup, prevComponentInstance);
          }
        },

  /**
   * Overridden in shallow rendering.
   *
   * @protected
   */
        _replaceNodeWithMarkup(oldHostNode, nextMarkup, prevInstance) {
          ReactComponentEnvironment.replaceNodeWithMarkup(oldHostNode, nextMarkup, prevInstance);
        },

  /**
   * @protected
   */
        _renderValidatedComponentWithoutOwnerOrContext() {
          const inst = this._instance;
          let renderedElement;

          if (process.env.NODE_ENV !== "production") {
            renderedElement = measureLifeCyclePerf(() => {
              return inst.render();
            }, this._debugID, "render");
          } else {
            renderedElement = inst.render();
          }

          if (process.env.NODE_ENV !== "production") {
      // We allow auto-mocks to proceed as if they're returning null.
            if (renderedElement === undefined && inst.render._isMockFunction) {
        // This is probably bad practice. Consider warning here and
        // deprecating this convenience.
              renderedElement = null;
            }
          }

          return renderedElement;
        },

  /**
   * @private
   */
        _renderValidatedComponent() {
          let renderedElement;
          if (process.env.NODE_ENV !== "production" || this._compositeType !== CompositeTypes.StatelessFunctional) {
            ReactCurrentOwner.current = this;
            try {
              renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();
            } finally {
              ReactCurrentOwner.current = null;
            }
          } else {
            renderedElement = this._renderValidatedComponentWithoutOwnerOrContext();
          }
          !(
    // TODO: An `isValidNode` function would probably be more appropriate
    renderedElement === null || renderedElement === false || React.isValidElement(renderedElement)) ? process.env.NODE_ENV !== "production" ? invariant(false, "%s.render(): A valid React element (or null) must be returned. You may have returned undefined, an array or some other invalid object.", this.getName() || "ReactCompositeComponent") : _prodInvariant("109", this.getName() || "ReactCompositeComponent") : void 0;

          return renderedElement;
        },

  /**
   * Lazily allocates the refs object and stores `component` as `ref`.
   *
   * @param {string} ref Reference name.
   * @param {component} component Component to store as `ref`.
   * @final
   * @private
   */
        attachRef(ref, component) {
          const inst = this.getPublicInstance();
          !(inst != null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Stateless function components cannot have refs.") : _prodInvariant("110") : void 0;
          const publicComponentInstance = component.getPublicInstance();
          if (process.env.NODE_ENV !== "production") {
            const componentName = component && component.getName ? component.getName() : "a component";
            process.env.NODE_ENV !== "production" ? warning(publicComponentInstance != null || component._compositeType !== CompositeTypes.StatelessFunctional, "Stateless function components cannot be given refs " + "(See ref \"%s\" in %s created by %s). " + "Attempts to access this ref will fail.", ref, componentName, this.getName()) : void 0;
          }
          const refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
          refs[ref] = publicComponentInstance;
        },

  /**
   * Detaches a reference name.
   *
   * @param {string} ref Name to dereference.
   * @final
   * @private
   */
        detachRef(ref) {
          const refs = this.getPublicInstance().refs;
          delete refs[ref];
        },

  /**
   * Get a text description of the component that can be used to identify it
   * in error messages.
   * @return {string} The name or null.
   * @internal
   */
        getName() {
          const type = this._currentElement.type;
          const constructor = this._instance && this._instance.constructor;
          return type.displayName || constructor && constructor.displayName || type.name || constructor && constructor.name || null;
        },

  /**
   * Get the publicly accessible representation of this component - i.e. what
   * is exposed by refs and returned by render. Can be null for stateless
   * components.
   *
   * @return {ReactComponent} the public component instance.
   * @internal
   */
        getPublicInstance() {
          const inst = this._instance;
          if (this._compositeType === CompositeTypes.StatelessFunctional) {
            return null;
          }
          return inst;
        },

  // Stub
        _instantiateReactComponent: null,

      };

      module.exports = ReactCompositeComponent;
    }).call(this, require("_process"));
  }, { "./ReactComponentEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactComponentEnvironment.js", "./ReactErrorUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactErrorUtils.js", "./ReactInstanceMap": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstanceMap.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactNodeTypes": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactNodeTypes.js", "./ReactReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js", "./checkReactTypeSpec": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\checkReactTypeSpec.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "./shouldUpdateReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\shouldUpdateReactComponent.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyObject": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyObject.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/shallowEqual": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\shallowEqual.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js", "react/lib/React": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js", "react/lib/ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOM.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/* globals __REACT_DEVTOOLS_GLOBAL_HOOK__*/


      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactDefaultInjection = require("./ReactDefaultInjection");
      const ReactMount = require("./ReactMount");
      const ReactReconciler = require("./ReactReconciler");
      const ReactUpdates = require("./ReactUpdates");
      const ReactVersion = require("./ReactVersion");

      const findDOMNode = require("./findDOMNode");
      const getHostComponentFromComposite = require("./getHostComponentFromComposite");
      const renderSubtreeIntoContainer = require("./renderSubtreeIntoContainer");
      const warning = require("fbjs/lib/warning");

      ReactDefaultInjection.inject();

      const ReactDOM = {
        findDOMNode,
        render: ReactMount.render,
        unmountComponentAtNode: ReactMount.unmountComponentAtNode,
        version: ReactVersion,

  /* eslint-disable camelcase */
        unstable_batchedUpdates: ReactUpdates.batchedUpdates,
        unstable_renderSubtreeIntoContainer: renderSubtreeIntoContainer,
      };

// Inject the runtime into a devtools global hook regardless of browser.
// Allows for debugging when the hook is injected on the page.
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject === "function") {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.inject({
          ComponentTree: {
            getClosestInstanceFromNode: ReactDOMComponentTree.getClosestInstanceFromNode,
            getNodeFromInstance(inst) {
        // inst is an internal instance (but could be a composite)
              if (inst._renderedComponent) {
                inst = getHostComponentFromComposite(inst);
              }
              if (inst) {
                return ReactDOMComponentTree.getNodeFromInstance(inst);
              }
              return null;
            },
          },
          Mount: ReactMount,
          Reconciler: ReactReconciler,
        });
      }

      if (process.env.NODE_ENV !== "production") {
        const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
        if (ExecutionEnvironment.canUseDOM && window.top === window.self) {
    // First check if devtools is not installed
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined") {
      // If we're in Chrome or Firefox, provide a download link if not installed.
            if (navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Edge") === -1 || navigator.userAgent.indexOf("Firefox") > -1) {
        // Firefox does not have the issue with devtools loaded over file://
              const showFileUrlMessage = window.location.protocol.indexOf("http") === -1 && navigator.userAgent.indexOf("Firefox") === -1;
              console.debug(`Download the React DevTools ${showFileUrlMessage ? "and use an HTTP server (instead of a file: URL) " : ""}for a better development experience: ` + "https://fb.me/react-devtools");
            }
          }

          const testFunc = function testFn() {};
          process.env.NODE_ENV !== "production" ? warning((testFunc.name || testFunc.toString()).indexOf("testFn") !== -1, "It looks like you're using a minified copy of the development build " + "of React. When deploying React apps to production, make sure to use " + "the production build which skips development warnings and is faster. " + "See https://fb.me/react-minification for more details.") : void 0;

    // If we're in IE8, check to see if we are in compatibility mode and provide
    // information on preventing compatibility mode
          const ieCompatibilityMode = document.documentMode && document.documentMode < 8;

          process.env.NODE_ENV !== "production" ? warning(!ieCompatibilityMode, "Internet Explorer is running in compatibility mode; please add the " + "following tag to your HTML to prevent this from happening: " + "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />") : void 0;

          const expectedFeatures = [
    // shims
            Array.isArray, Array.prototype.every, Array.prototype.forEach, Array.prototype.indexOf, Array.prototype.map, Date.now, Function.prototype.bind, Object.keys, String.prototype.trim];

          for (let i = 0; i < expectedFeatures.length; i++) {
            if (!expectedFeatures[i]) {
              process.env.NODE_ENV !== "production" ? warning(false, "One or more ES5 shims expected by React are not available: " + "https://fb.me/react-warning-polyfills") : void 0;
              break;
            }
          }
        }
      }

      if (process.env.NODE_ENV !== "production") {
        const ReactInstrumentation = require("./ReactInstrumentation");
        const ReactDOMUnknownPropertyHook = require("./ReactDOMUnknownPropertyHook");
        const ReactDOMNullInputValuePropHook = require("./ReactDOMNullInputValuePropHook");
        const ReactDOMInvalidARIAHook = require("./ReactDOMInvalidARIAHook");

        ReactInstrumentation.debugTool.addHook(ReactDOMUnknownPropertyHook);
        ReactInstrumentation.debugTool.addHook(ReactDOMNullInputValuePropHook);
        ReactInstrumentation.debugTool.addHook(ReactDOMInvalidARIAHook);
      }

      module.exports = ReactDOM;
    }).call(this, require("_process"));
  }, { "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactDOMInvalidARIAHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMInvalidARIAHook.js", "./ReactDOMNullInputValuePropHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMNullInputValuePropHook.js", "./ReactDOMUnknownPropertyHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMUnknownPropertyHook.js", "./ReactDefaultInjection": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDefaultInjection.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactMount": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMount.js", "./ReactReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./ReactVersion": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactVersion.js", "./findDOMNode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\findDOMNode.js", "./getHostComponentFromComposite": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getHostComponentFromComposite.js", "./renderSubtreeIntoContainer": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\renderSubtreeIntoContainer.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/* global hasOwnProperty:true */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const AutoFocusUtils = require("./AutoFocusUtils");
      const CSSPropertyOperations = require("./CSSPropertyOperations");
      const DOMLazyTree = require("./DOMLazyTree");
      const DOMNamespaces = require("./DOMNamespaces");
      const DOMProperty = require("./DOMProperty");
      const DOMPropertyOperations = require("./DOMPropertyOperations");
      const EventPluginHub = require("./EventPluginHub");
      const EventPluginRegistry = require("./EventPluginRegistry");
      const ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
      const ReactDOMComponentFlags = require("./ReactDOMComponentFlags");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactDOMInput = require("./ReactDOMInput");
      const ReactDOMOption = require("./ReactDOMOption");
      const ReactDOMSelect = require("./ReactDOMSelect");
      const ReactDOMTextarea = require("./ReactDOMTextarea");
      const ReactInstrumentation = require("./ReactInstrumentation");
      const ReactMultiChild = require("./ReactMultiChild");
      const ReactServerRenderingTransaction = require("./ReactServerRenderingTransaction");

      const emptyFunction = require("fbjs/lib/emptyFunction");
      const escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
      const invariant = require("fbjs/lib/invariant");
      const isEventSupported = require("./isEventSupported");
      const shallowEqual = require("fbjs/lib/shallowEqual");
      const validateDOMNesting = require("./validateDOMNesting");
      const warning = require("fbjs/lib/warning");

      const Flags = ReactDOMComponentFlags;
      const deleteListener = EventPluginHub.deleteListener;
      const getNode = ReactDOMComponentTree.getNodeFromInstance;
      const listenTo = ReactBrowserEventEmitter.listenTo;
      const registrationNameModules = EventPluginRegistry.registrationNameModules;

// For quickly matching children type, to test if can be treated as content.
      const CONTENT_TYPES = { "string": true, "number": true };

      const STYLE = "style";
      const HTML = "__html";
      const RESERVED_PROPS = {
        children: null,
        dangerouslySetInnerHTML: null,
        suppressContentEditableWarning: null,
      };

// Node type for document fragments (Node.DOCUMENT_FRAGMENT_NODE).
      const DOC_FRAGMENT_TYPE = 11;

      function getDeclarationErrorAddendum(internalInstance) {
        if (internalInstance) {
          const owner = internalInstance._currentElement._owner || null;
          if (owner) {
            const name = owner.getName();
            if (name) {
              return ` This DOM node was rendered by \`${name}\`.`;
            }
          }
        }
        return "";
      }

      function friendlyStringify(obj) {
        if (typeof obj === "object") {
          if (Array.isArray(obj)) {
            return `[${obj.map(friendlyStringify).join(", ")}]`;
          }
          const pairs = [];
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const keyEscaped = /^[a-z$_][\w$_]*$/i.test(key) ? key : JSON.stringify(key);
              pairs.push(`${keyEscaped}: ${friendlyStringify(obj[key])}`);
            }
          }
          return `{${pairs.join(", ")}}`;
        } else if (typeof obj === "string") {
          return JSON.stringify(obj);
        } else if (typeof obj === "function") {
          return "[function object]";
        }
  // Differs from JSON.stringify in that undefined because undefined and that
  // inf and nan don't become null
        return String(obj);
      }

      const styleMutationWarning = {};

      function checkAndWarnForMutatedStyle(style1, style2, component) {
        if (style1 == null || style2 == null) {
          return;
        }
        if (shallowEqual(style1, style2)) {
          return;
        }

        const componentName = component._tag;
        const owner = component._currentElement._owner;
        let ownerName;
        if (owner) {
          ownerName = owner.getName();
        }

        const hash = `${ownerName}|${componentName}`;

        if (styleMutationWarning.hasOwnProperty(hash)) {
          return;
        }

        styleMutationWarning[hash] = true;

        process.env.NODE_ENV !== "production" ? warning(false, "`%s` was passed a style object that has previously been mutated. " + "Mutating `style` is deprecated. Consider cloning it beforehand. Check " + "the `render` %s. Previous style: %s. Mutated style: %s.", componentName, owner ? `of \`${ownerName}\`` : `using <${componentName}>`, friendlyStringify(style1), friendlyStringify(style2)) : void 0;
      }

/**
 * @param {object} component
 * @param {?object} props
 */
      function assertValidProps(component, props) {
        if (!props) {
          return;
        }
  // Note the use of `==` which checks for null or undefined.
        if (voidElementTags[component._tag]) {
          !(props.children == null && props.dangerouslySetInnerHTML == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "%s is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.%s", component._tag, component._currentElement._owner ? ` Check the render method of ${component._currentElement._owner.getName()}.` : "") : _prodInvariant("137", component._tag, component._currentElement._owner ? ` Check the render method of ${component._currentElement._owner.getName()}.` : "") : void 0;
        }
        if (props.dangerouslySetInnerHTML != null) {
          !(props.children == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Can only set one of `children` or `props.dangerouslySetInnerHTML`.") : _prodInvariant("60") : void 0;
          !(typeof props.dangerouslySetInnerHTML === "object" && HTML in props.dangerouslySetInnerHTML) ? process.env.NODE_ENV !== "production" ? invariant(false, "`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.") : _prodInvariant("61") : void 0;
        }
        if (process.env.NODE_ENV !== "production") {
          process.env.NODE_ENV !== "production" ? warning(props.innerHTML == null, "Directly setting property `innerHTML` is not permitted. " + "For more information, lookup documentation on `dangerouslySetInnerHTML`.") : void 0;
          process.env.NODE_ENV !== "production" ? warning(props.suppressContentEditableWarning || !props.contentEditable || props.children == null, "A component is `contentEditable` and contains `children` managed by " + "React. It is now your responsibility to guarantee that none of " + "those nodes are unexpectedly modified or duplicated. This is " + "probably not intentional.") : void 0;
          process.env.NODE_ENV !== "production" ? warning(props.onFocusIn == null && props.onFocusOut == null, "React uses onFocus and onBlur instead of onFocusIn and onFocusOut. " + "All React events are normalized to bubble, so onFocusIn and onFocusOut " + "are not needed/supported by React.") : void 0;
        }
        !(props.style == null || typeof props.style === "object") ? process.env.NODE_ENV !== "production" ? invariant(false, "The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.%s", getDeclarationErrorAddendum(component)) : _prodInvariant("62", getDeclarationErrorAddendum(component)) : void 0;
      }

      function enqueuePutListener(inst, registrationName, listener, transaction) {
        if (transaction instanceof ReactServerRenderingTransaction) {
          return;
        }
        if (process.env.NODE_ENV !== "production") {
    // IE8 has no API for event capturing and the `onScroll` event doesn't
    // bubble.
          process.env.NODE_ENV !== "production" ? warning(registrationName !== "onScroll" || isEventSupported("scroll", true), "This browser doesn't support the `onScroll` event") : void 0;
        }
        const containerInfo = inst._hostContainerInfo;
        const isDocumentFragment = containerInfo._node && containerInfo._node.nodeType === DOC_FRAGMENT_TYPE;
        const doc = isDocumentFragment ? containerInfo._node : containerInfo._ownerDocument;
        listenTo(registrationName, doc);
        transaction.getReactMountReady().enqueue(putListener, {
          inst,
          registrationName,
          listener,
        });
      }

      function putListener() {
        const listenerToPut = this;
        EventPluginHub.putListener(listenerToPut.inst, listenerToPut.registrationName, listenerToPut.listener);
      }

      function inputPostMount() {
        const inst = this;
        ReactDOMInput.postMountWrapper(inst);
      }

      function textareaPostMount() {
        const inst = this;
        ReactDOMTextarea.postMountWrapper(inst);
      }

      function optionPostMount() {
        const inst = this;
        ReactDOMOption.postMountWrapper(inst);
      }

      let setAndValidateContentChildDev = emptyFunction;
      if (process.env.NODE_ENV !== "production") {
        setAndValidateContentChildDev = function(content) {
          const hasExistingContent = this._contentDebugID != null;
          const debugID = this._debugID;
    // This ID represents the inlined child that has no backing instance:
          const contentDebugID = -debugID;

          if (content == null) {
            if (hasExistingContent) {
              ReactInstrumentation.debugTool.onUnmountComponent(this._contentDebugID);
            }
            this._contentDebugID = null;
            return;
          }

          validateDOMNesting(null, String(content), this, this._ancestorInfo);
          this._contentDebugID = contentDebugID;
          if (hasExistingContent) {
            ReactInstrumentation.debugTool.onBeforeUpdateComponent(contentDebugID, content);
            ReactInstrumentation.debugTool.onUpdateComponent(contentDebugID);
          } else {
            ReactInstrumentation.debugTool.onBeforeMountComponent(contentDebugID, content, debugID);
            ReactInstrumentation.debugTool.onMountComponent(contentDebugID);
            ReactInstrumentation.debugTool.onSetChildren(debugID, [contentDebugID]);
          }
        };
      }

// There are so many media events, it makes sense to just
// maintain a list rather than create a `trapBubbledEvent` for each
      const mediaEvents = {
        topAbort: "abort",
        topCanPlay: "canplay",
        topCanPlayThrough: "canplaythrough",
        topDurationChange: "durationchange",
        topEmptied: "emptied",
        topEncrypted: "encrypted",
        topEnded: "ended",
        topError: "error",
        topLoadedData: "loadeddata",
        topLoadedMetadata: "loadedmetadata",
        topLoadStart: "loadstart",
        topPause: "pause",
        topPlay: "play",
        topPlaying: "playing",
        topProgress: "progress",
        topRateChange: "ratechange",
        topSeeked: "seeked",
        topSeeking: "seeking",
        topStalled: "stalled",
        topSuspend: "suspend",
        topTimeUpdate: "timeupdate",
        topVolumeChange: "volumechange",
        topWaiting: "waiting",
      };

      function trapBubbledEventsLocal() {
        const inst = this;
  // If a component renders to null or if another component fatals and causes
  // the state of the tree to be corrupted, `node` here can be null.
        !inst._rootNodeID ? process.env.NODE_ENV !== "production" ? invariant(false, "Must be mounted to trap events") : _prodInvariant("63") : void 0;
        const node = getNode(inst);
        !node ? process.env.NODE_ENV !== "production" ? invariant(false, "trapBubbledEvent(...): Requires node to be rendered.") : _prodInvariant("64") : void 0;

        switch (inst._tag) {
          case "iframe":
          case "object":
            inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent("topLoad", "load", node)];
            break;
          case "video":
          case "audio":

            inst._wrapperState.listeners = [];
      // Create listener for each media event
            for (const event in mediaEvents) {
              if (mediaEvents.hasOwnProperty(event)) {
                inst._wrapperState.listeners.push(ReactBrowserEventEmitter.trapBubbledEvent(event, mediaEvents[event], node));
              }
            }
            break;
          case "source":
            inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent("topError", "error", node)];
            break;
          case "img":
            inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent("topError", "error", node), ReactBrowserEventEmitter.trapBubbledEvent("topLoad", "load", node)];
            break;
          case "form":
            inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent("topReset", "reset", node), ReactBrowserEventEmitter.trapBubbledEvent("topSubmit", "submit", node)];
            break;
          case "input":
          case "select":
          case "textarea":
            inst._wrapperState.listeners = [ReactBrowserEventEmitter.trapBubbledEvent("topInvalid", "invalid", node)];
            break;
        }
      }

      function postUpdateSelectWrapper() {
        ReactDOMSelect.postUpdateWrapper(this);
      }

// For HTML, certain tags should omit their close tag. We keep a whitelist for
// those special-case tags.

      const omittedCloseTags = {
        "area": true,
        "base": true,
        "br": true,
        "col": true,
        "embed": true,
        "hr": true,
        "img": true,
        "input": true,
        "keygen": true,
        "link": true,
        "meta": true,
        "param": true,
        "source": true,
        "track": true,
        "wbr": true,
      };

      const newlineEatingTags = {
        "listing": true,
        "pre": true,
        "textarea": true,
      };

// For HTML, certain tags cannot have children. This has the same purpose as
// `omittedCloseTags` except that `menuitem` should still have its closing tag.

      var voidElementTags = _assign({
        "menuitem": true,
      }, omittedCloseTags);

// We accept any tag to be rendered but since this gets injected into arbitrary
// HTML, we want to make sure that it's a safe tag.
// http://www.w3.org/TR/REC-xml/#NT-Name

      const VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset
      const validatedTagCache = {};
      const hasOwnProperty = {}.hasOwnProperty;

      function validateDangerousTag(tag) {
        if (!hasOwnProperty.call(validatedTagCache, tag)) {
          !VALID_TAG_REGEX.test(tag) ? process.env.NODE_ENV !== "production" ? invariant(false, "Invalid tag: %s", tag) : _prodInvariant("65", tag) : void 0;
          validatedTagCache[tag] = true;
        }
      }

      function isCustomComponent(tagName, props) {
        return tagName.indexOf("-") >= 0 || props.is != null;
      }

      let globalIdCounter = 1;

/**
 * Creates a new React class that is idempotent and capable of containing other
 * React components. It accepts event listeners and DOM properties that are
 * valid according to `DOMProperty`.
 *
 *  - Event listeners: `onClick`, `onMouseDown`, etc.
 *  - DOM properties: `className`, `name`, `title`, etc.
 *
 * The `style` property functions differently from the DOM API. It accepts an
 * object mapping of style properties to values.
 *
 * @constructor ReactDOMComponent
 * @extends ReactMultiChild
 */
      function ReactDOMComponent(element) {
        const tag = element.type;
        validateDangerousTag(tag);
        this._currentElement = element;
        this._tag = tag.toLowerCase();
        this._namespaceURI = null;
        this._renderedChildren = null;
        this._previousStyle = null;
        this._previousStyleCopy = null;
        this._hostNode = null;
        this._hostParent = null;
        this._rootNodeID = 0;
        this._domID = 0;
        this._hostContainerInfo = null;
        this._wrapperState = null;
        this._topLevelWrapper = null;
        this._flags = 0;
        if (process.env.NODE_ENV !== "production") {
          this._ancestorInfo = null;
          setAndValidateContentChildDev.call(this, null);
        }
      }

      ReactDOMComponent.displayName = "ReactDOMComponent";

      ReactDOMComponent.Mixin = {

  /**
   * Generates root tag markup then recurses. This method has side effects and
   * is not idempotent.
   *
   * @internal
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {?ReactDOMComponent} the parent component instance
   * @param {?object} info about the host container
   * @param {object} context
   * @return {string} The computed markup.
   */
        mountComponent(transaction, hostParent, hostContainerInfo, context) {
          this._rootNodeID = globalIdCounter++;
          this._domID = hostContainerInfo._idCounter++;
          this._hostParent = hostParent;
          this._hostContainerInfo = hostContainerInfo;

          let props = this._currentElement.props;

          switch (this._tag) {
            case "audio":
            case "form":
            case "iframe":
            case "img":
            case "link":
            case "object":
            case "source":
            case "video":
              this._wrapperState = {
                listeners: null,
              };
              transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
              break;
            case "input":
              ReactDOMInput.mountWrapper(this, props, hostParent);
              props = ReactDOMInput.getHostProps(this, props);
              transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
              break;
            case "option":
              ReactDOMOption.mountWrapper(this, props, hostParent);
              props = ReactDOMOption.getHostProps(this, props);
              break;
            case "select":
              ReactDOMSelect.mountWrapper(this, props, hostParent);
              props = ReactDOMSelect.getHostProps(this, props);
              transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
              break;
            case "textarea":
              ReactDOMTextarea.mountWrapper(this, props, hostParent);
              props = ReactDOMTextarea.getHostProps(this, props);
              transaction.getReactMountReady().enqueue(trapBubbledEventsLocal, this);
              break;
          }

          assertValidProps(this, props);

    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
          let namespaceURI;
          let parentTag;
          if (hostParent != null) {
            namespaceURI = hostParent._namespaceURI;
            parentTag = hostParent._tag;
          } else if (hostContainerInfo._tag) {
            namespaceURI = hostContainerInfo._namespaceURI;
            parentTag = hostContainerInfo._tag;
          }
          if (namespaceURI == null || namespaceURI === DOMNamespaces.svg && parentTag === "foreignobject") {
            namespaceURI = DOMNamespaces.html;
          }
          if (namespaceURI === DOMNamespaces.html) {
            if (this._tag === "svg") {
              namespaceURI = DOMNamespaces.svg;
            } else if (this._tag === "math") {
            namespaceURI = DOMNamespaces.mathml;
          }
          }
          this._namespaceURI = namespaceURI;

          if (process.env.NODE_ENV !== "production") {
            let parentInfo;
            if (hostParent != null) {
              parentInfo = hostParent._ancestorInfo;
            } else if (hostContainerInfo._tag) {
            parentInfo = hostContainerInfo._ancestorInfo;
          }
            if (parentInfo) {
        // parentInfo should always be present except for the top-level
        // component when server rendering
              validateDOMNesting(this._tag, null, this, parentInfo);
            }
            this._ancestorInfo = validateDOMNesting.updatedAncestorInfo(parentInfo, this._tag, this);
          }

          let mountImage;
          if (transaction.useCreateElement) {
            const ownerDocument = hostContainerInfo._ownerDocument;
            let el;
            if (namespaceURI === DOMNamespaces.html) {
              if (this._tag === "script") {
          // Create the script via .innerHTML so its "parser-inserted" flag is
          // set to true and it does not execute
              const div = ownerDocument.createElement("div");
              const type = this._currentElement.type;
              div.innerHTML = `<${type}></${type}>`;
              el = div.removeChild(div.firstChild);
            } else if (props.is) {
              el = ownerDocument.createElement(this._currentElement.type, props.is);
            } else {
          // Separate else branch instead of using `props.is || undefined` above becuase of a Firefox bug.
          // See discussion in https://github.com/facebook/react/pull/6896
          // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
              el = ownerDocument.createElement(this._currentElement.type);
            }
            } else {
              el = ownerDocument.createElementNS(namespaceURI, this._currentElement.type);
            }
            ReactDOMComponentTree.precacheNode(this, el);
            this._flags |= Flags.hasCachedChildNodes;
            if (!this._hostParent) {
              DOMPropertyOperations.setAttributeForRoot(el);
            }
            this._updateDOMProperties(null, props, transaction);
            const lazyTree = DOMLazyTree(el);
            this._createInitialChildren(transaction, props, context, lazyTree);
            mountImage = lazyTree;
          } else {
            const tagOpen = this._createOpenTagMarkupAndPutListeners(transaction, props);
            const tagContent = this._createContentMarkup(transaction, props, context);
            if (!tagContent && omittedCloseTags[this._tag]) {
              mountImage = `${tagOpen}/>`;
            } else {
              mountImage = `${tagOpen}>${tagContent}</${this._currentElement.type}>`;
            }
          }

          switch (this._tag) {
            case "input":
              transaction.getReactMountReady().enqueue(inputPostMount, this);
              if (props.autoFocus) {
                transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
              }
              break;
            case "textarea":
              transaction.getReactMountReady().enqueue(textareaPostMount, this);
              if (props.autoFocus) {
                transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
              }
              break;
            case "select":
              if (props.autoFocus) {
                transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
              }
              break;
            case "button":
              if (props.autoFocus) {
                transaction.getReactMountReady().enqueue(AutoFocusUtils.focusDOMComponent, this);
              }
              break;
            case "option":
              transaction.getReactMountReady().enqueue(optionPostMount, this);
              break;
          }

          return mountImage;
        },

  /**
   * Creates markup for the open tag and all attributes.
   *
   * This method has side effects because events get registered.
   *
   * Iterating over object properties is faster than iterating over arrays.
   * @see http://jsperf.com/obj-vs-arr-iteration
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} props
   * @return {string} Markup of opening tag.
   */
        _createOpenTagMarkupAndPutListeners(transaction, props) {
          let ret = `<${this._currentElement.type}`;

          for (const propKey in props) {
            if (!props.hasOwnProperty(propKey)) {
              continue;
            }
            let propValue = props[propKey];
            if (propValue == null) {
              continue;
            }
            if (registrationNameModules.hasOwnProperty(propKey)) {
              if (propValue) {
              enqueuePutListener(this, propKey, propValue, transaction);
            }
            } else {
              if (propKey === STYLE) {
              if (propValue) {
                if (process.env.NODE_ENV !== "production") {
              // See `_updateDOMProperties`. style block
                  this._previousStyle = propValue;
                }
                propValue = this._previousStyleCopy = _assign({}, props.style);
              }
              propValue = CSSPropertyOperations.createMarkupForStyles(propValue, this);
            }
              let markup = null;
              if (this._tag != null && isCustomComponent(this._tag, props)) {
              if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
                markup = DOMPropertyOperations.createMarkupForCustomAttribute(propKey, propValue);
              }
            } else {
              markup = DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
            }
              if (markup) {
              ret += ` ${markup}`;
            }
            }
          }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
          if (transaction.renderToStaticMarkup) {
            return ret;
          }

          if (!this._hostParent) {
            ret += ` ${DOMPropertyOperations.createMarkupForRoot()}`;
          }
          ret += ` ${DOMPropertyOperations.createMarkupForID(this._domID)}`;
          return ret;
        },

  /**
   * Creates markup for the content between the tags.
   *
   * @private
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} props
   * @param {object} context
   * @return {string} Content markup.
   */
        _createContentMarkup(transaction, props, context) {
          let ret = "";

    // Intentional use of != to avoid catching zero/false.
          const innerHTML = props.dangerouslySetInnerHTML;
          if (innerHTML != null) {
            if (innerHTML.__html != null) {
              ret = innerHTML.__html;
            }
          } else {
            const contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
            const childrenToUse = contentToUse != null ? null : props.children;
            if (contentToUse != null) {
        // TODO: Validate that text is allowed as a child of this node
              ret = escapeTextContentForBrowser(contentToUse);
              if (process.env.NODE_ENV !== "production") {
              setAndValidateContentChildDev.call(this, contentToUse);
            }
            } else if (childrenToUse != null) {
            const mountImages = this.mountChildren(childrenToUse, transaction, context);
            ret = mountImages.join("");
          }
          }
          if (newlineEatingTags[this._tag] && ret.charAt(0) === "\n") {
      // text/html ignores the first character in these tags if it's a newline
      // Prefer to break application/xml over text/html (for now) by adding
      // a newline specifically to get eaten by the parser. (Alternately for
      // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
      // \r is normalized out by HTMLTextAreaElement#value.)
      // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
      // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
      // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
      // See: Parsing of "textarea" "listing" and "pre" elements
      //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
            return `\n${ret}`;
          }
          return ret;
        },

        _createInitialChildren(transaction, props, context, lazyTree) {
    // Intentional use of != to avoid catching zero/false.
          const innerHTML = props.dangerouslySetInnerHTML;
          if (innerHTML != null) {
            if (innerHTML.__html != null) {
              DOMLazyTree.queueHTML(lazyTree, innerHTML.__html);
            }
          } else {
            const contentToUse = CONTENT_TYPES[typeof props.children] ? props.children : null;
            const childrenToUse = contentToUse != null ? null : props.children;
      // TODO: Validate that text is allowed as a child of this node
            if (contentToUse != null) {
        // Avoid setting textContent when the text is empty. In IE11 setting
        // textContent on a text area will cause the placeholder to not
        // show within the textarea until it has been focused and blurred again.
        // https://github.com/facebook/react/issues/6731#issuecomment-254874553
              if (contentToUse !== "") {
              if (process.env.NODE_ENV !== "production") {
                setAndValidateContentChildDev.call(this, contentToUse);
              }
              DOMLazyTree.queueText(lazyTree, contentToUse);
            }
            } else if (childrenToUse != null) {
            const mountImages = this.mountChildren(childrenToUse, transaction, context);
            for (let i = 0; i < mountImages.length; i++) {
              DOMLazyTree.queueChild(lazyTree, mountImages[i]);
            }
          }
          }
        },

  /**
   * Receives a next element and updates the component.
   *
   * @internal
   * @param {ReactElement} nextElement
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {object} context
   */
        receiveComponent(nextElement, transaction, context) {
          const prevElement = this._currentElement;
          this._currentElement = nextElement;
          this.updateComponent(transaction, prevElement, nextElement, context);
        },

  /**
   * Updates a DOM component after it has already been allocated and
   * attached to the DOM. Reconciles the root DOM node, then recurses.
   *
   * @param {ReactReconcileTransaction} transaction
   * @param {ReactElement} prevElement
   * @param {ReactElement} nextElement
   * @internal
   * @overridable
   */
        updateComponent(transaction, prevElement, nextElement, context) {
          let lastProps = prevElement.props;
          let nextProps = this._currentElement.props;

          switch (this._tag) {
            case "input":
              lastProps = ReactDOMInput.getHostProps(this, lastProps);
              nextProps = ReactDOMInput.getHostProps(this, nextProps);
              break;
            case "option":
              lastProps = ReactDOMOption.getHostProps(this, lastProps);
              nextProps = ReactDOMOption.getHostProps(this, nextProps);
              break;
            case "select":
              lastProps = ReactDOMSelect.getHostProps(this, lastProps);
              nextProps = ReactDOMSelect.getHostProps(this, nextProps);
              break;
            case "textarea":
              lastProps = ReactDOMTextarea.getHostProps(this, lastProps);
              nextProps = ReactDOMTextarea.getHostProps(this, nextProps);
              break;
          }

          assertValidProps(this, nextProps);
          this._updateDOMProperties(lastProps, nextProps, transaction);
          this._updateDOMChildren(lastProps, nextProps, transaction, context);

          switch (this._tag) {
            case "input":
        // Update the wrapper around inputs *after* updating props. This has to
        // happen after `_updateDOMProperties`. Otherwise HTML5 input validations
        // raise warnings and prevent the new value from being assigned.
              ReactDOMInput.updateWrapper(this);
              break;
            case "textarea":
              ReactDOMTextarea.updateWrapper(this);
              break;
            case "select":
        // <select> value update needs to occur after <option> children
        // reconciliation
              transaction.getReactMountReady().enqueue(postUpdateSelectWrapper, this);
              break;
          }
        },

  /**
   * Reconciles the properties by detecting differences in property values and
   * updating the DOM as necessary. This function is probably the single most
   * critical path for performance optimization.
   *
   * TODO: Benchmark whether checking for changed values in memory actually
   *       improves performance (especially statically positioned elements).
   * TODO: Benchmark the effects of putting this at the top since 99% of props
   *       do not change for a given reconciliation.
   * TODO: Benchmark areas that can be improved with caching.
   *
   * @private
   * @param {object} lastProps
   * @param {object} nextProps
   * @param {?DOMElement} node
   */
        _updateDOMProperties(lastProps, nextProps, transaction) {
          let propKey;
          let styleName;
          let styleUpdates;
          for (propKey in lastProps) {
            if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
              continue;
            }
            if (propKey === STYLE) {
              const lastStyle = this._previousStyleCopy;
              for (styleName in lastStyle) {
              if (lastStyle.hasOwnProperty(styleName)) {
                styleUpdates = styleUpdates || {};
                styleUpdates[styleName] = "";
              }
            }
              this._previousStyleCopy = null;
            } else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (lastProps[propKey]) {
          // Only call deleteListener if there was a listener previously or
          // else willDeleteListener gets called when there wasn't actually a
          // listener (e.g., onClick={null})
              deleteListener(this, propKey);
            }
          } else if (isCustomComponent(this._tag, lastProps)) {
            if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
              DOMPropertyOperations.deleteValueForAttribute(getNode(this), propKey);
            }
          } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
            DOMPropertyOperations.deleteValueForProperty(getNode(this), propKey);
          }
          }
          for (propKey in nextProps) {
            let nextProp = nextProps[propKey];
            const lastProp = propKey === STYLE ? this._previousStyleCopy : lastProps != null ? lastProps[propKey] : undefined;
            if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
              continue;
            }
            if (propKey === STYLE) {
              if (nextProp) {
              if (process.env.NODE_ENV !== "production") {
                checkAndWarnForMutatedStyle(this._previousStyleCopy, this._previousStyle, this);
                this._previousStyle = nextProp;
              }
              nextProp = this._previousStyleCopy = _assign({}, nextProp);
            } else {
              this._previousStyleCopy = null;
            }
              if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
              for (styleName in lastProp) {
                if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
                  styleUpdates = styleUpdates || {};
                  styleUpdates[styleName] = "";
                }
              }
          // Update styles that changed since `lastProp`.
              for (styleName in nextProp) {
                if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
                  styleUpdates = styleUpdates || {};
                  styleUpdates[styleName] = nextProp[styleName];
                }
              }
            } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
              styleUpdates = nextProp;
            }
            } else if (registrationNameModules.hasOwnProperty(propKey)) {
            if (nextProp) {
              enqueuePutListener(this, propKey, nextProp, transaction);
            } else if (lastProp) {
              deleteListener(this, propKey);
            }
          } else if (isCustomComponent(this._tag, nextProps)) {
            if (!RESERVED_PROPS.hasOwnProperty(propKey)) {
              DOMPropertyOperations.setValueForAttribute(getNode(this), propKey, nextProp);
            }
          } else if (DOMProperty.properties[propKey] || DOMProperty.isCustomAttribute(propKey)) {
            const node = getNode(this);
        // If we're updating to null or undefined, we should remove the property
        // from the DOM node instead of inadvertently setting to a string. This
        // brings us in line with the same behavior we have on initial render.
            if (nextProp != null) {
            DOMPropertyOperations.setValueForProperty(node, propKey, nextProp);
          } else {
            DOMPropertyOperations.deleteValueForProperty(node, propKey);
          }
          }
          }
          if (styleUpdates) {
            CSSPropertyOperations.setValueForStyles(getNode(this), styleUpdates, this);
          }
        },

  /**
   * Reconciles the children with the various properties that affect the
   * children content.
   *
   * @param {object} lastProps
   * @param {object} nextProps
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   */
        _updateDOMChildren(lastProps, nextProps, transaction, context) {
          const lastContent = CONTENT_TYPES[typeof lastProps.children] ? lastProps.children : null;
          const nextContent = CONTENT_TYPES[typeof nextProps.children] ? nextProps.children : null;

          const lastHtml = lastProps.dangerouslySetInnerHTML && lastProps.dangerouslySetInnerHTML.__html;
          const nextHtml = nextProps.dangerouslySetInnerHTML && nextProps.dangerouslySetInnerHTML.__html;

    // Note the use of `!=` which checks for null or undefined.
          const lastChildren = lastContent != null ? null : lastProps.children;
          const nextChildren = nextContent != null ? null : nextProps.children;

    // If we're switching from children to content/html or vice versa, remove
    // the old content
          const lastHasContentOrHtml = lastContent != null || lastHtml != null;
          const nextHasContentOrHtml = nextContent != null || nextHtml != null;
          if (lastChildren != null && nextChildren == null) {
            this.updateChildren(null, transaction, context);
          } else if (lastHasContentOrHtml && !nextHasContentOrHtml) {
            this.updateTextContent("");
            if (process.env.NODE_ENV !== "production") {
            ReactInstrumentation.debugTool.onSetChildren(this._debugID, []);
          }
          }

          if (nextContent != null) {
            if (lastContent !== nextContent) {
              this.updateTextContent(`${nextContent}`);
              if (process.env.NODE_ENV !== "production") {
              setAndValidateContentChildDev.call(this, nextContent);
            }
            }
          } else if (nextHtml != null) {
            if (lastHtml !== nextHtml) {
            this.updateMarkup(`${nextHtml}`);
          }
            if (process.env.NODE_ENV !== "production") {
            ReactInstrumentation.debugTool.onSetChildren(this._debugID, []);
          }
          } else if (nextChildren != null) {
          if (process.env.NODE_ENV !== "production") {
            setAndValidateContentChildDev.call(this, null);
          }

          this.updateChildren(nextChildren, transaction, context);
        }
        },

        getHostNode() {
          return getNode(this);
        },

  /**
   * Destroys all event registrations for this instance. Does not remove from
   * the DOM. That must be done by the parent.
   *
   * @internal
   */
        unmountComponent(safely) {
          switch (this._tag) {
            case "audio":
            case "form":
            case "iframe":
            case "img":
            case "link":
            case "object":
            case "source":
            case "video":
              var listeners = this._wrapperState.listeners;
              if (listeners) {
                for (let i = 0; i < listeners.length; i++) {
                listeners[i].remove();
              }
              }
              break;
            case "html":
            case "head":
            case "body":
        /**
         * Components like <html> <head> and <body> can't be removed or added
         * easily in a cross-browser way, however it's valuable to be able to
         * take advantage of React's reconciliation for styling and <title>
         * management. So we just document it and throw in dangerous cases.
         */
              !false ? process.env.NODE_ENV !== "production" ? invariant(false, "<%s> tried to unmount. Because of cross-browser quirks it is impossible to unmount some top-level components (eg <html>, <head>, and <body>) reliably and efficiently. To fix this, have a single top-level component that never unmounts render these elements.", this._tag) : _prodInvariant("66", this._tag) : void 0;
              break;
          }

          this.unmountChildren(safely);
          ReactDOMComponentTree.uncacheNode(this);
          EventPluginHub.deleteAllListeners(this);
          this._rootNodeID = 0;
          this._domID = 0;
          this._wrapperState = null;

          if (process.env.NODE_ENV !== "production") {
            setAndValidateContentChildDev.call(this, null);
          }
        },

        getPublicInstance() {
          return getNode(this);
        },

      };

      _assign(ReactDOMComponent.prototype, ReactDOMComponent.Mixin, ReactMultiChild.Mixin);

      module.exports = ReactDOMComponent;
    }).call(this, require("_process"));
  }, { "./AutoFocusUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\AutoFocusUtils.js", "./CSSPropertyOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CSSPropertyOperations.js", "./DOMLazyTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js", "./DOMNamespaces": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMNamespaces.js", "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "./DOMPropertyOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMPropertyOperations.js", "./EventPluginHub": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginHub.js", "./EventPluginRegistry": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginRegistry.js", "./ReactBrowserEventEmitter": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactBrowserEventEmitter.js", "./ReactDOMComponentFlags": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentFlags.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactDOMInput": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMInput.js", "./ReactDOMOption": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMOption.js", "./ReactDOMSelect": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMSelect.js", "./ReactDOMTextarea": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMTextarea.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactMultiChild": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMultiChild.js", "./ReactServerRenderingTransaction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactServerRenderingTransaction.js", "./escapeTextContentForBrowser": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\escapeTextContentForBrowser.js", "./isEventSupported": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isEventSupported.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "./validateDOMNesting": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\validateDOMNesting.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/shallowEqual": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\shallowEqual.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentFlags.js": [function(require, module, exports) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ReactDOMComponentFlags = {
      hasCachedChildNodes: 1 << 0,
    };

    module.exports = ReactDOMComponentFlags;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const DOMProperty = require("./DOMProperty");
      const ReactDOMComponentFlags = require("./ReactDOMComponentFlags");

      const invariant = require("fbjs/lib/invariant");

      const ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
      const Flags = ReactDOMComponentFlags;

      const internalInstanceKey = `__reactInternalInstance$${Math.random().toString(36).slice(2)}`;

/**
 * Check if a given node should be cached.
 */
      function shouldPrecacheNode(node, nodeID) {
        return node.nodeType === 1 && node.getAttribute(ATTR_NAME) === String(nodeID) || node.nodeType === 8 && node.nodeValue === ` react-text: ${nodeID} ` || node.nodeType === 8 && node.nodeValue === ` react-empty: ${nodeID} `;
      }

/**
 * Drill down (through composites and empty components) until we get a host or
 * host text component.
 *
 * This is pretty polymorphic but unavoidable with the current structure we have
 * for `_renderedChildren`.
 */
      function getRenderedHostOrTextFromComponent(component) {
        let rendered;
        while (rendered = component._renderedComponent) {
          component = rendered;
        }
        return component;
      }

/**
 * Populate `_hostNode` on the rendered host/text component with the given
 * DOM node. The passed `inst` can be a composite.
 */
      function precacheNode(inst, node) {
        const hostInst = getRenderedHostOrTextFromComponent(inst);
        hostInst._hostNode = node;
        node[internalInstanceKey] = hostInst;
      }

      function uncacheNode(inst) {
        const node = inst._hostNode;
        if (node) {
          delete node[internalInstanceKey];
          inst._hostNode = null;
        }
      }

/**
 * Populate `_hostNode` on each child of `inst`, assuming that the children
 * match up with the DOM (element) children of `node`.
 *
 * We cache entire levels at once to avoid an n^2 problem where we access the
 * children of a node sequentially and have to walk from the start to our target
 * node every time.
 *
 * Since we update `_renderedChildren` and the actual DOM at (slightly)
 * different times, we could race here and see a newer `_renderedChildren` than
 * the DOM nodes we see. To avoid this, ReactMultiChild calls
 * `prepareToManageChildren` before we change `_renderedChildren`, at which
 * time the container's child nodes are always cached (until it unmounts).
 */
      function precacheChildNodes(inst, node) {
        if (inst._flags & Flags.hasCachedChildNodes) {
          return;
        }
        const children = inst._renderedChildren;
        let childNode = node.firstChild;
        outer: for (const name in children) {
          if (!children.hasOwnProperty(name)) {
            continue;
          }
          const childInst = children[name];
          const childID = getRenderedHostOrTextFromComponent(childInst)._domID;
          if (childID === 0) {
      // We're currently unmounting this child in ReactMultiChild; skip it.
            continue;
          }
    // We assume the child nodes are in the same order as the child instances.
          for (; childNode !== null; childNode = childNode.nextSibling) {
            if (shouldPrecacheNode(childNode, childID)) {
              precacheNode(childInst, childNode);
              continue outer;
            }
          }
    // We reached the end of the DOM children without finding an ID match.
          !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Unable to find element with ID %s.", childID) : _prodInvariant("32", childID) : void 0;
        }
        inst._flags |= Flags.hasCachedChildNodes;
      }

/**
 * Given a DOM node, return the closest ReactDOMComponent or
 * ReactDOMTextComponent instance ancestor.
 */
      function getClosestInstanceFromNode(node) {
        if (node[internalInstanceKey]) {
          return node[internalInstanceKey];
        }

  // Walk up the tree until we find an ancestor whose instance we have cached.
        const parents = [];
        while (!node[internalInstanceKey]) {
          parents.push(node);
          if (node.parentNode) {
            node = node.parentNode;
          } else {
      // Top of the tree. This node must not be part of a React tree (or is
      // unmounted, potentially).
            return null;
          }
        }

        let closest;
        let inst;
        for (; node && (inst = node[internalInstanceKey]); node = parents.pop()) {
          closest = inst;
          if (parents.length) {
            precacheChildNodes(inst, node);
          }
        }

        return closest;
      }

/**
 * Given a DOM node, return the ReactDOMComponent or ReactDOMTextComponent
 * instance, or null if the node was not rendered by this React.
 */
      function getInstanceFromNode(node) {
        const inst = getClosestInstanceFromNode(node);
        if (inst != null && inst._hostNode === node) {
          return inst;
        }
        return null;
      }

/**
 * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
 * DOM node.
 */
      function getNodeFromInstance(inst) {
  // Without this first invariant, passing a non-DOM-component triggers the next
  // invariant for a missing parent, which is super confusing.
        !(inst._hostNode !== undefined) ? process.env.NODE_ENV !== "production" ? invariant(false, "getNodeFromInstance: Invalid argument.") : _prodInvariant("33") : void 0;

        if (inst._hostNode) {
          return inst._hostNode;
        }

  // Walk up the tree until we find an ancestor whose DOM node we have cached.
        const parents = [];
        while (!inst._hostNode) {
          parents.push(inst);
          !inst._hostParent ? process.env.NODE_ENV !== "production" ? invariant(false, "React DOM tree root should always have a node reference.") : _prodInvariant("34") : void 0;
          inst = inst._hostParent;
        }

  // Now parents contains each ancestor that does *not* have a cached native
  // node, and `inst` is the deepest ancestor that does.
        for (; parents.length; inst = parents.pop()) {
          precacheChildNodes(inst, inst._hostNode);
        }

        return inst._hostNode;
      }

      const ReactDOMComponentTree = {
        getClosestInstanceFromNode,
        getInstanceFromNode,
        getNodeFromInstance,
        precacheChildNodes,
        precacheNode,
        uncacheNode,
      };

      module.exports = ReactDOMComponentTree;
    }).call(this, require("_process"));
  }, { "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "./ReactDOMComponentFlags": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentFlags.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMContainerInfo.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const validateDOMNesting = require("./validateDOMNesting");

      const DOC_NODE_TYPE = 9;

      function ReactDOMContainerInfo(topLevelWrapper, node) {
        const info = {
          _topLevelWrapper: topLevelWrapper,
          _idCounter: 1,
          _ownerDocument: node ? node.nodeType === DOC_NODE_TYPE ? node : node.ownerDocument : null,
          _node: node,
          _tag: node ? node.nodeName.toLowerCase() : null,
          _namespaceURI: node ? node.namespaceURI : null,
        };
        if (process.env.NODE_ENV !== "production") {
          info._ancestorInfo = node ? validateDOMNesting.updatedAncestorInfo(null, info._tag, null) : null;
        }
        return info;
      }

      module.exports = ReactDOMContainerInfo;
    }).call(this, require("_process"));
  }, { "./validateDOMNesting": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\validateDOMNesting.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMEmptyComponent.js": [function(require, module, exports) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const _assign = require("object-assign");

    const DOMLazyTree = require("./DOMLazyTree");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");

    const ReactDOMEmptyComponent = function(instantiate) {
  // ReactCompositeComponent uses this:
      this._currentElement = null;
  // ReactDOMComponentTree uses these:
      this._hostNode = null;
      this._hostParent = null;
      this._hostContainerInfo = null;
      this._domID = 0;
    };
    _assign(ReactDOMEmptyComponent.prototype, {
      mountComponent(transaction, hostParent, hostContainerInfo, context) {
        const domID = hostContainerInfo._idCounter++;
        this._domID = domID;
        this._hostParent = hostParent;
        this._hostContainerInfo = hostContainerInfo;

        const nodeValue = ` react-empty: ${this._domID} `;
        if (transaction.useCreateElement) {
          const ownerDocument = hostContainerInfo._ownerDocument;
          const node = ownerDocument.createComment(nodeValue);
          ReactDOMComponentTree.precacheNode(this, node);
          return DOMLazyTree(node);
        }
        if (transaction.renderToStaticMarkup) {
        // Normally we'd insert a comment node, but since this is a situation
        // where React won't take over (static pages), we can simply return
        // nothing.
          return "";
        }
        return `<!--${nodeValue}-->`;
      },
      receiveComponent() {},
      getHostNode() {
        return ReactDOMComponentTree.getNodeFromInstance(this);
      },
      unmountComponent() {
        ReactDOMComponentTree.uncacheNode(this);
      },
    });

    module.exports = ReactDOMEmptyComponent;
  }, { "./DOMLazyTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMFeatureFlags.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ReactDOMFeatureFlags = {
      useCreateElement: true,
      useFiber: false,
    };

    module.exports = ReactDOMFeatureFlags;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMIDOperations.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const DOMChildrenOperations = require("./DOMChildrenOperations");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");

/**
 * Operations used to process updates to DOM nodes.
 */
    const ReactDOMIDOperations = {

  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @internal
   */
      dangerouslyProcessChildrenUpdates(parentInst, updates) {
        const node = ReactDOMComponentTree.getNodeFromInstance(parentInst);
        DOMChildrenOperations.processUpdates(node, updates);
      },
    };

    module.exports = ReactDOMIDOperations;
  }, { "./DOMChildrenOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMChildrenOperations.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMInput.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const DOMPropertyOperations = require("./DOMPropertyOperations");
      const LinkedValueUtils = require("./LinkedValueUtils");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactUpdates = require("./ReactUpdates");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      let didWarnValueLink = false;
      let didWarnCheckedLink = false;
      let didWarnValueDefaultValue = false;
      let didWarnCheckedDefaultChecked = false;
      let didWarnControlledToUncontrolled = false;
      let didWarnUncontrolledToControlled = false;

      function forceUpdateIfMounted() {
        if (this._rootNodeID) {
    // DOM component is still mounted; update
          ReactDOMInput.updateWrapper(this);
        }
      }

      function isControlled(props) {
        const usesChecked = props.type === "checkbox" || props.type === "radio";
        return usesChecked ? props.checked != null : props.value != null;
      }

/**
 * Implements an <input> host component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * @see http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
      var ReactDOMInput = {
        getHostProps(inst, props) {
          const value = LinkedValueUtils.getValue(props);
          const checked = LinkedValueUtils.getChecked(props);

          const hostProps = _assign({
      // Make sure we set .type before any other properties (setting .value
      // before .type means .value is lost in IE11 and below)
            type: undefined,
      // Make sure we set .step before .value (setting .value before .step
      // means .value is rounded on mount, based upon step precision)
            step: undefined,
      // Make sure we set .min & .max before .value (to ensure proper order
      // in corner cases such as min or max deriving from value, e.g. Issue #7170)
            min: undefined,
            max: undefined,
          }, props, {
            defaultChecked: undefined,
            defaultValue: undefined,
            value: value != null ? value : inst._wrapperState.initialValue,
            checked: checked != null ? checked : inst._wrapperState.initialChecked,
            onChange: inst._wrapperState.onChange,
          });

          return hostProps;
        },

        mountWrapper(inst, props) {
          if (process.env.NODE_ENV !== "production") {
            LinkedValueUtils.checkPropTypes("input", props, inst._currentElement._owner);

            const owner = inst._currentElement._owner;

            if (props.valueLink !== undefined && !didWarnValueLink) {
              process.env.NODE_ENV !== "production" ? warning(false, "`valueLink` prop on `input` is deprecated; set `value` and `onChange` instead.") : void 0;
              didWarnValueLink = true;
            }
            if (props.checkedLink !== undefined && !didWarnCheckedLink) {
              process.env.NODE_ENV !== "production" ? warning(false, "`checkedLink` prop on `input` is deprecated; set `value` and `onChange` instead.") : void 0;
              didWarnCheckedLink = true;
            }
            if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnCheckedDefaultChecked) {
              process.env.NODE_ENV !== "production" ? warning(false, "%s contains an input of type %s with both checked and defaultChecked props. " + "Input elements must be either controlled or uncontrolled " + "(specify either the checked prop, or the defaultChecked prop, but not " + "both). Decide between using a controlled or uncontrolled input " + "element and remove one of these props. More info: " + "https://fb.me/react-controlled-components", owner && owner.getName() || "A component", props.type) : void 0;
              didWarnCheckedDefaultChecked = true;
            }
            if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
              process.env.NODE_ENV !== "production" ? warning(false, "%s contains an input of type %s with both value and defaultValue props. " + "Input elements must be either controlled or uncontrolled " + "(specify either the value prop, or the defaultValue prop, but not " + "both). Decide between using a controlled or uncontrolled input " + "element and remove one of these props. More info: " + "https://fb.me/react-controlled-components", owner && owner.getName() || "A component", props.type) : void 0;
              didWarnValueDefaultValue = true;
            }
          }

          const defaultValue = props.defaultValue;
          inst._wrapperState = {
            initialChecked: props.checked != null ? props.checked : props.defaultChecked,
            initialValue: props.value != null ? props.value : defaultValue,
            listeners: null,
            onChange: _handleChange.bind(inst),
          };

          if (process.env.NODE_ENV !== "production") {
            inst._wrapperState.controlled = isControlled(props);
          }
        },

        updateWrapper(inst) {
          const props = inst._currentElement.props;

          if (process.env.NODE_ENV !== "production") {
            const controlled = isControlled(props);
            const owner = inst._currentElement._owner;

            if (!inst._wrapperState.controlled && controlled && !didWarnUncontrolledToControlled) {
              process.env.NODE_ENV !== "production" ? warning(false, "%s is changing an uncontrolled input of type %s to be controlled. " + "Input elements should not switch from uncontrolled to controlled (or vice versa). " + "Decide between using a controlled or uncontrolled input " + "element for the lifetime of the component. More info: https://fb.me/react-controlled-components", owner && owner.getName() || "A component", props.type) : void 0;
              didWarnUncontrolledToControlled = true;
            }
            if (inst._wrapperState.controlled && !controlled && !didWarnControlledToUncontrolled) {
              process.env.NODE_ENV !== "production" ? warning(false, "%s is changing a controlled input of type %s to be uncontrolled. " + "Input elements should not switch from controlled to uncontrolled (or vice versa). " + "Decide between using a controlled or uncontrolled input " + "element for the lifetime of the component. More info: https://fb.me/react-controlled-components", owner && owner.getName() || "A component", props.type) : void 0;
              didWarnControlledToUncontrolled = true;
            }
          }

    // TODO: Shouldn't this be getChecked(props)?
          const checked = props.checked;
          if (checked != null) {
            DOMPropertyOperations.setValueForProperty(ReactDOMComponentTree.getNodeFromInstance(inst), "checked", checked || false);
          }

          const node = ReactDOMComponentTree.getNodeFromInstance(inst);
          const value = LinkedValueUtils.getValue(props);
          if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
            const newValue = `${value}`;

      // To avoid side effects (such as losing text selection), only set value if changed
            if (newValue !== node.value) {
              node.value = newValue;
            }
          } else {
            if (props.value == null && props.defaultValue != null) {
        // In Chrome, assigning defaultValue to certain input types triggers input validation.
        // For number inputs, the display value loses trailing decimal points. For email inputs,
        // Chrome raises "The specified value <x> is not a valid email address".
        //
        // Here we check to see if the defaultValue has actually changed, avoiding these problems
        // when the user is inputting text
        //
        // https://github.com/facebook/react/issues/7253
              if (node.defaultValue !== `${props.defaultValue}`) {
              node.defaultValue = `${props.defaultValue}`;
            }
            }
            if (props.checked == null && props.defaultChecked != null) {
              node.defaultChecked = !!props.defaultChecked;
            }
          }
        },

        postMountWrapper(inst) {
          const props = inst._currentElement.props;

    // This is in postMount because we need access to the DOM node, which is not
    // available until after the component has mounted.
          const node = ReactDOMComponentTree.getNodeFromInstance(inst);

    // Detach value from defaultValue. We won't do anything if we're working on
    // submit or reset inputs as those values & defaultValues are linked. They
    // are not resetable nodes so this operation doesn't matter and actually
    // removes browser-default values (eg "Submit Query") when no value is
    // provided.

          switch (props.type) {
            case "submit":
            case "reset":
              break;
            case "color":
            case "date":
            case "datetime":
            case "datetime-local":
            case "month":
            case "time":
            case "week":
        // This fixes the no-show issue on iOS Safari and Android Chrome:
        // https://github.com/facebook/react/issues/7233
              node.value = "";
              node.value = node.defaultValue;
              break;
            default:
              node.value = node.value;
              break;
          }

    // Normally, we'd just do `node.checked = node.checked` upon initial mount, less this bug
    // this is needed to work around a chrome bug where setting defaultChecked
    // will sometimes influence the value of checked (even after detachment).
    // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=608416
    // We need to temporarily unset name to avoid disrupting radio button groups.
          const name = node.name;
          if (name !== "") {
            node.name = "";
          }
          node.defaultChecked = !node.defaultChecked;
          node.defaultChecked = !node.defaultChecked;
          if (name !== "") {
            node.name = name;
          }
        },
      };

      function _handleChange(event) {
        const props = this._currentElement.props;

        const returnValue = LinkedValueUtils.executeOnChange(props, event);

  // Here we use asap to wait until all updates have propagated, which
  // is important when using controlled components within layers:
  // https://github.com/facebook/react/issues/1698
        ReactUpdates.asap(forceUpdateIfMounted, this);

        const name = props.name;
        if (props.type === "radio" && name != null) {
          const rootNode = ReactDOMComponentTree.getNodeFromInstance(this);
          let queryRoot = rootNode;

          while (queryRoot.parentNode) {
            queryRoot = queryRoot.parentNode;
          }

    // If `rootNode.form` was non-null, then we could try `form.elements`,
    // but that sometimes behaves strangely in IE8. We could also try using
    // `form.getElementsByName`, but that will only return direct children
    // and won't include inputs that use the HTML5 `form=` attribute. Since
    // the input might not even be in a form, let's just use the global
    // `querySelectorAll` to ensure we don't miss anything.
          const group = queryRoot.querySelectorAll(`input[name=${JSON.stringify(`${name}`)}][type="radio"]`);

          for (let i = 0; i < group.length; i++) {
            const otherNode = group[i];
            if (otherNode === rootNode || otherNode.form !== rootNode.form) {
              continue;
            }
      // This will throw if radio buttons rendered by different copies of React
      // and the same name are rendered into the same form (same as #1939).
      // That's probably okay; we don't support it just as we don't support
      // mixing React radio buttons with non-React ones.
            const otherInstance = ReactDOMComponentTree.getInstanceFromNode(otherNode);
            !otherInstance ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.") : _prodInvariant("90") : void 0;
      // If this is a controlled radio button group, forcing the input that
      // was previously checked to update will cause it to be come re-checked
      // as appropriate.
            ReactUpdates.asap(forceUpdateIfMounted, otherInstance);
          }
        }

        return returnValue;
      }

      module.exports = ReactDOMInput;
    }).call(this, require("_process"));
  }, { "./DOMPropertyOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMPropertyOperations.js", "./LinkedValueUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\LinkedValueUtils.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMInvalidARIAHook.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const DOMProperty = require("./DOMProperty");
      const ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");

      const warning = require("fbjs/lib/warning");

      const warnedProperties = {};
      const rARIA = new RegExp(`^(aria)-[${DOMProperty.ATTRIBUTE_NAME_CHAR}]*$`);

      function validateProperty(tagName, name, debugID) {
        if (warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
          return true;
        }

        if (rARIA.test(name)) {
          const lowerCasedName = name.toLowerCase();
          const standardName = DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ? DOMProperty.getPossibleStandardName[lowerCasedName] : null;

    // If this is an aria-* attribute, but is not listed in the known DOM
    // DOM properties, then it is an invalid aria-* attribute.
          if (standardName == null) {
            warnedProperties[name] = true;
            return false;
          }
    // aria-* attributes should be lowercase; suggest the lowercase version.
          if (name !== standardName) {
            process.env.NODE_ENV !== "production" ? warning(false, "Unknown ARIA attribute %s. Did you mean %s?%s", name, standardName, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
            warnedProperties[name] = true;
            return true;
          }
        }

        return true;
      }

      function warnInvalidARIAProps(debugID, element) {
        const invalidProps = [];

        for (const key in element.props) {
          const isValid = validateProperty(element.type, key, debugID);
          if (!isValid) {
            invalidProps.push(key);
          }
        }

        const unknownPropString = invalidProps.map((prop) => {
          return `\`${prop}\``;
        }).join(", ");

        if (invalidProps.length === 1) {
          process.env.NODE_ENV !== "production" ? warning(false, "Invalid aria prop %s on <%s> tag. " + "For details, see https://fb.me/invalid-aria-prop%s", unknownPropString, element.type, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
        } else if (invalidProps.length > 1) {
          process.env.NODE_ENV !== "production" ? warning(false, "Invalid aria props %s on <%s> tag. " + "For details, see https://fb.me/invalid-aria-prop%s", unknownPropString, element.type, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
        }
      }

      function handleElement(debugID, element) {
        if (element == null || typeof element.type !== "string") {
          return;
        }
        if (element.type.indexOf("-") >= 0 || element.props.is) {
          return;
        }

        warnInvalidARIAProps(debugID, element);
      }

      const ReactDOMInvalidARIAHook = {
        onBeforeMountComponent(debugID, element) {
          if (process.env.NODE_ENV !== "production") {
            handleElement(debugID, element);
          }
        },
        onBeforeUpdateComponent(debugID, element) {
          if (process.env.NODE_ENV !== "production") {
            handleElement(debugID, element);
          }
        },
      };

      module.exports = ReactDOMInvalidARIAHook;
    }).call(this, require("_process"));
  }, { "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMNullInputValuePropHook.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");

      const warning = require("fbjs/lib/warning");

      let didWarnValueNull = false;

      function handleElement(debugID, element) {
        if (element == null) {
          return;
        }
        if (element.type !== "input" && element.type !== "textarea" && element.type !== "select") {
          return;
        }
        if (element.props != null && element.props.value === null && !didWarnValueNull) {
          process.env.NODE_ENV !== "production" ? warning(false, "`value` prop on `%s` should not be null. " + "Consider using the empty string to clear the component or `undefined` " + "for uncontrolled components.%s", element.type, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;

          didWarnValueNull = true;
        }
      }

      const ReactDOMNullInputValuePropHook = {
        onBeforeMountComponent(debugID, element) {
          handleElement(debugID, element);
        },
        onBeforeUpdateComponent(debugID, element) {
          handleElement(debugID, element);
        },
      };

      module.exports = ReactDOMNullInputValuePropHook;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMOption.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const React = require("react/lib/React");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactDOMSelect = require("./ReactDOMSelect");

      const warning = require("fbjs/lib/warning");
      let didWarnInvalidOptionChildren = false;

      function flattenChildren(children) {
        let content = "";

  // Flatten children and warn if they aren't strings or numbers;
  // invalid types are ignored.
        React.Children.forEach(children, (child) => {
          if (child == null) {
            return;
          }
          if (typeof child === "string" || typeof child === "number") {
            content += child;
          } else if (!didWarnInvalidOptionChildren) {
            didWarnInvalidOptionChildren = true;
            process.env.NODE_ENV !== "production" ? warning(false, "Only strings and numbers are supported as <option> children.") : void 0;
          }
        });

        return content;
      }

/**
 * Implements an <option> host component that warns when `selected` is set.
 */
      const ReactDOMOption = {
        mountWrapper(inst, props, hostParent) {
    // TODO (yungsters): Remove support for `selected` in <option>.
          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(props.selected == null, "Use the `defaultValue` or `value` props on <select> instead of " + "setting `selected` on <option>.") : void 0;
          }

    // Look up whether this option is 'selected'
          let selectValue = null;
          if (hostParent != null) {
            let selectParent = hostParent;

            if (selectParent._tag === "optgroup") {
              selectParent = selectParent._hostParent;
            }

            if (selectParent != null && selectParent._tag === "select") {
              selectValue = ReactDOMSelect.getSelectValueContext(selectParent);
            }
          }

    // If the value is null (e.g., no specified value or after initial mount)
    // or missing (e.g., for <datalist>), we don't change props.selected
          let selected = null;
          if (selectValue != null) {
            let value;
            if (props.value != null) {
              value = `${props.value}`;
            } else {
              value = flattenChildren(props.children);
            }
            selected = false;
            if (Array.isArray(selectValue)) {
        // multiple
              for (let i = 0; i < selectValue.length; i++) {
                if (`${selectValue[i]}` === value) {
                selected = true;
                break;
              }
              }
            } else {
              selected = `${selectValue}` === value;
            }
          }

          inst._wrapperState = { selected };
        },

        postMountWrapper(inst) {
    // value="" should make a value attribute (#6219)
          const props = inst._currentElement.props;
          if (props.value != null) {
            const node = ReactDOMComponentTree.getNodeFromInstance(inst);
            node.setAttribute("value", props.value);
          }
        },

        getHostProps(inst, props) {
          const hostProps = _assign({ selected: undefined, children: undefined }, props);

    // Read state only from initial mount because <select> updates value
    // manually; we need the initial state only for server rendering
          if (inst._wrapperState.selected != null) {
            hostProps.selected = inst._wrapperState.selected;
          }

          const content = flattenChildren(props.children);

          if (content) {
            hostProps.children = content;
          }

          return hostProps;
        },

      };

      module.exports = ReactDOMOption;
    }).call(this, require("_process"));
  }, { "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactDOMSelect": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMSelect.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js", "react/lib/React": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMSelect.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const LinkedValueUtils = require("./LinkedValueUtils");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactUpdates = require("./ReactUpdates");

      const warning = require("fbjs/lib/warning");

      let didWarnValueLink = false;
      let didWarnValueDefaultValue = false;

      function updateOptionsIfPendingUpdateAndMounted() {
        if (this._rootNodeID && this._wrapperState.pendingUpdate) {
          this._wrapperState.pendingUpdate = false;

          const props = this._currentElement.props;
          const value = LinkedValueUtils.getValue(props);

          if (value != null) {
            updateOptions(this, Boolean(props.multiple), value);
          }
        }
      }

      function getDeclarationErrorAddendum(owner) {
        if (owner) {
          const name = owner.getName();
          if (name) {
            return ` Check the render method of \`${name}\`.`;
          }
        }
        return "";
      }

      const valuePropNames = ["value", "defaultValue"];

/**
 * Validation function for `value` and `defaultValue`.
 * @private
 */
      function checkSelectPropTypes(inst, props) {
        const owner = inst._currentElement._owner;
        LinkedValueUtils.checkPropTypes("select", props, owner);

        if (props.valueLink !== undefined && !didWarnValueLink) {
          process.env.NODE_ENV !== "production" ? warning(false, "`valueLink` prop on `select` is deprecated; set `value` and `onChange` instead.") : void 0;
          didWarnValueLink = true;
        }

        for (let i = 0; i < valuePropNames.length; i++) {
          const propName = valuePropNames[i];
          if (props[propName] == null) {
            continue;
          }
          const isArray = Array.isArray(props[propName]);
          if (props.multiple && !isArray) {
            process.env.NODE_ENV !== "production" ? warning(false, "The `%s` prop supplied to <select> must be an array if " + "`multiple` is true.%s", propName, getDeclarationErrorAddendum(owner)) : void 0;
          } else if (!props.multiple && isArray) {
            process.env.NODE_ENV !== "production" ? warning(false, "The `%s` prop supplied to <select> must be a scalar " + "value if `multiple` is false.%s", propName, getDeclarationErrorAddendum(owner)) : void 0;
          }
        }
      }

/**
 * @param {ReactDOMComponent} inst
 * @param {boolean} multiple
 * @param {*} propValue A stringable (with `multiple`, a list of stringables).
 * @private
 */
      function updateOptions(inst, multiple, propValue) {
        let selectedValue,
          i;
        const options = ReactDOMComponentTree.getNodeFromInstance(inst).options;

        if (multiple) {
          selectedValue = {};
          for (i = 0; i < propValue.length; i++) {
            selectedValue[`${propValue[i]}`] = true;
          }
          for (i = 0; i < options.length; i++) {
            const selected = selectedValue.hasOwnProperty(options[i].value);
            if (options[i].selected !== selected) {
              options[i].selected = selected;
            }
          }
        } else {
    // Do not set `select.value` as exact behavior isn't consistent across all
    // browsers for all cases.
          selectedValue = `${propValue}`;
          for (i = 0; i < options.length; i++) {
            if (options[i].value === selectedValue) {
              options[i].selected = true;
              return;
            }
          }
          if (options.length) {
            options[0].selected = true;
          }
        }
      }

/**
 * Implements a <select> host component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * stringable. If `multiple` is true, the prop must be an array of stringables.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */
      const ReactDOMSelect = {
        getHostProps(inst, props) {
          return _assign({}, props, {
            onChange: inst._wrapperState.onChange,
            value: undefined,
          });
        },

        mountWrapper(inst, props) {
          if (process.env.NODE_ENV !== "production") {
            checkSelectPropTypes(inst, props);
          }

          const value = LinkedValueUtils.getValue(props);
          inst._wrapperState = {
            pendingUpdate: false,
            initialValue: value != null ? value : props.defaultValue,
            listeners: null,
            onChange: _handleChange.bind(inst),
            wasMultiple: Boolean(props.multiple),
          };

          if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
            process.env.NODE_ENV !== "production" ? warning(false, "Select elements must be either controlled or uncontrolled " + "(specify either the value prop, or the defaultValue prop, but not " + "both). Decide between using a controlled or uncontrolled select " + "element and remove one of these props. More info: " + "https://fb.me/react-controlled-components") : void 0;
            didWarnValueDefaultValue = true;
          }
        },

        getSelectValueContext(inst) {
    // ReactDOMOption looks at this initial value so the initial generated
    // markup has correct `selected` attributes
          return inst._wrapperState.initialValue;
        },

        postUpdateWrapper(inst) {
          const props = inst._currentElement.props;

    // After the initial mount, we control selected-ness manually so don't pass
    // this value down
          inst._wrapperState.initialValue = undefined;

          const wasMultiple = inst._wrapperState.wasMultiple;
          inst._wrapperState.wasMultiple = Boolean(props.multiple);

          const value = LinkedValueUtils.getValue(props);
          if (value != null) {
            inst._wrapperState.pendingUpdate = false;
            updateOptions(inst, Boolean(props.multiple), value);
          } else if (wasMultiple !== Boolean(props.multiple)) {
      // For simplicity, reapply `defaultValue` if `multiple` is toggled.
            if (props.defaultValue != null) {
              updateOptions(inst, Boolean(props.multiple), props.defaultValue);
            } else {
        // Revert the select back to its default unselected state.
              updateOptions(inst, Boolean(props.multiple), props.multiple ? [] : "");
            }
          }
        },
      };

      function _handleChange(event) {
        const props = this._currentElement.props;
        const returnValue = LinkedValueUtils.executeOnChange(props, event);

        if (this._rootNodeID) {
          this._wrapperState.pendingUpdate = true;
        }
        ReactUpdates.asap(updateOptionsIfPendingUpdateAndMounted, this);
        return returnValue;
      }

      module.exports = ReactDOMSelect;
    }).call(this, require("_process"));
  }, { "./LinkedValueUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\LinkedValueUtils.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMSelection.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

    const getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
    const getTextContentAccessor = require("./getTextContentAccessor");

/**
 * While `isCollapsed` is available on the Selection object and `collapsed`
 * is available on the Range object, IE11 sometimes gets them wrong.
 * If the anchor/focus nodes and offsets are the same, the range is collapsed.
 */
    function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
      return anchorNode === focusNode && anchorOffset === focusOffset;
    }

/**
 * Get the appropriate anchor and focus node/offset pairs for IE.
 *
 * The catch here is that IE's selection API doesn't provide information
 * about whether the selection is forward or backward, so we have to
 * behave as though it's always forward.
 *
 * IE text differs from modern selection in that it behaves as though
 * block elements end with a new line. This means character offsets will
 * differ between the two APIs.
 *
 * @param {DOMElement} node
 * @return {object}
 */
    function getIEOffsets(node) {
      const selection = document.selection;
      const selectedRange = selection.createRange();
      const selectedLength = selectedRange.text.length;

  // Duplicate selection so we can move range without breaking user selection.
      const fromStart = selectedRange.duplicate();
      fromStart.moveToElementText(node);
      fromStart.setEndPoint("EndToStart", selectedRange);

      const startOffset = fromStart.text.length;
      const endOffset = startOffset + selectedLength;

      return {
        start: startOffset,
        end: endOffset,
      };
    }

/**
 * @param {DOMElement} node
 * @return {?object}
 */
    function getModernOffsets(node) {
      const selection = window.getSelection && window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      const anchorNode = selection.anchorNode;
      const anchorOffset = selection.anchorOffset;
      const focusNode = selection.focusNode;
      const focusOffset = selection.focusOffset;

      const currentRange = selection.getRangeAt(0);

  // In Firefox, range.startContainer and range.endContainer can be "anonymous
  // divs", e.g. the up/down buttons on an <input type="number">. Anonymous
  // divs do not seem to expose properties, triggering a "Permission denied
  // error" if any of its properties are accessed. The only seemingly possible
  // way to avoid erroring is to access a property that typically works for
  // non-anonymous divs and catch any error that may otherwise arise. See
  // https://bugzilla.mozilla.org/show_bug.cgi?id=208427
      try {
    /* eslint-disable no-unused-expressions */
        currentRange.startContainer.nodeType;
        currentRange.endContainer.nodeType;
    /* eslint-enable no-unused-expressions */
      } catch (e) {
        return null;
      }

  // If the node and offset values are the same, the selection is collapsed.
  // `Selection.isCollapsed` is available natively, but IE sometimes gets
  // this value wrong.
      const isSelectionCollapsed = isCollapsed(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);

      const rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;

      const tempRange = currentRange.cloneRange();
      tempRange.selectNodeContents(node);
      tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);

      const isTempRangeCollapsed = isCollapsed(tempRange.startContainer, tempRange.startOffset, tempRange.endContainer, tempRange.endOffset);

      const start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
      const end = start + rangeLength;

  // Detect whether the selection is backward.
      const detectionRange = document.createRange();
      detectionRange.setStart(anchorNode, anchorOffset);
      detectionRange.setEnd(focusNode, focusOffset);
      const isBackward = detectionRange.collapsed;

      return {
        start: isBackward ? end : start,
        end: isBackward ? start : end,
      };
    }

/**
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
    function setIEOffsets(node, offsets) {
      const range = document.selection.createRange().duplicate();
      let start,
        end;

      if (offsets.end === undefined) {
        start = offsets.start;
        end = start;
      } else if (offsets.start > offsets.end) {
        start = offsets.end;
        end = offsets.start;
      } else {
        start = offsets.start;
        end = offsets.end;
      }

      range.moveToElementText(node);
      range.moveStart("character", start);
      range.setEndPoint("EndToStart", range);
      range.moveEnd("character", end - start);
      range.select();
    }

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programmatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
    function setModernOffsets(node, offsets) {
      if (!window.getSelection) {
        return;
      }

      const selection = window.getSelection();
      const length = node[getTextContentAccessor()].length;
      let start = Math.min(offsets.start, length);
      let end = offsets.end === undefined ? start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
      if (!selection.extend && start > end) {
        const temp = end;
        end = start;
        start = temp;
      }

      const startMarker = getNodeForCharacterOffset(node, start);
      const endMarker = getNodeForCharacterOffset(node, end);

      if (startMarker && endMarker) {
        const range = document.createRange();
        range.setStart(startMarker.node, startMarker.offset);
        selection.removeAllRanges();

        if (start > end) {
          selection.addRange(range);
          selection.extend(endMarker.node, endMarker.offset);
        } else {
          range.setEnd(endMarker.node, endMarker.offset);
          selection.addRange(range);
        }
      }
    }

    const useIEOffsets = ExecutionEnvironment.canUseDOM && "selection" in document && !("getSelection" in window);

    const ReactDOMSelection = {
  /**
   * @param {DOMElement} node
   */
      getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,

  /**
   * @param {DOMElement|DOMTextNode} node
   * @param {object} offsets
   */
      setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets,
    };

    module.exports = ReactDOMSelection;
  }, { "./getNodeForCharacterOffset": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getNodeForCharacterOffset.js", "./getTextContentAccessor": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getTextContentAccessor.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMTextComponent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const DOMChildrenOperations = require("./DOMChildrenOperations");
      const DOMLazyTree = require("./DOMLazyTree");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");

      const escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
      const invariant = require("fbjs/lib/invariant");
      const validateDOMNesting = require("./validateDOMNesting");

/**
 * Text nodes violate a couple assumptions that React makes about components:
 *
 *  - When mounting text into the DOM, adjacent text nodes are merged.
 *  - Text nodes cannot be assigned a React root ID.
 *
 * This component is used to wrap strings between comment nodes so that they
 * can undergo the same reconciliation that is applied to elements.
 *
 * TODO: Investigate representing React components in the DOM with text nodes.
 *
 * @class ReactDOMTextComponent
 * @extends ReactComponent
 * @internal
 */
      const ReactDOMTextComponent = function(text) {
  // TODO: This is really a ReactText (ReactNode), not a ReactElement
        this._currentElement = text;
        this._stringText = `${text}`;
  // ReactDOMComponentTree uses these:
        this._hostNode = null;
        this._hostParent = null;

  // Properties
        this._domID = 0;
        this._mountIndex = 0;
        this._closingComment = null;
        this._commentNodes = null;
      };

      _assign(ReactDOMTextComponent.prototype, {

  /**
   * Creates the markup for this text node. This node is not intended to have
   * any features besides containing text content.
   *
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @return {string} Markup for this text node.
   * @internal
   */
        mountComponent(transaction, hostParent, hostContainerInfo, context) {
          if (process.env.NODE_ENV !== "production") {
            let parentInfo;
            if (hostParent != null) {
              parentInfo = hostParent._ancestorInfo;
            } else if (hostContainerInfo != null) {
              parentInfo = hostContainerInfo._ancestorInfo;
            }
            if (parentInfo) {
        // parentInfo should always be present except for the top-level
        // component when server rendering
              validateDOMNesting(null, this._stringText, this, parentInfo);
            }
          }

          const domID = hostContainerInfo._idCounter++;
          const openingValue = ` react-text: ${domID} `;
          const closingValue = " /react-text ";
          this._domID = domID;
          this._hostParent = hostParent;
          if (transaction.useCreateElement) {
            const ownerDocument = hostContainerInfo._ownerDocument;
            const openingComment = ownerDocument.createComment(openingValue);
            const closingComment = ownerDocument.createComment(closingValue);
            const lazyTree = DOMLazyTree(ownerDocument.createDocumentFragment());
            DOMLazyTree.queueChild(lazyTree, DOMLazyTree(openingComment));
            if (this._stringText) {
              DOMLazyTree.queueChild(lazyTree, DOMLazyTree(ownerDocument.createTextNode(this._stringText)));
            }
            DOMLazyTree.queueChild(lazyTree, DOMLazyTree(closingComment));
            ReactDOMComponentTree.precacheNode(this, openingComment);
            this._closingComment = closingComment;
            return lazyTree;
          }
          const escapedText = escapeTextContentForBrowser(this._stringText);

          if (transaction.renderToStaticMarkup) {
        // Normally we'd wrap this between comment nodes for the reasons stated
        // above, but since this is a situation where React won't take over
        // (static pages), we can simply return the text as it is.
            return escapedText;
          }

          return `<!--${openingValue}-->${escapedText}<!--${closingValue}-->`;
        },

  /**
   * Updates this component by updating the text content.
   *
   * @param {ReactText} nextText The next text content
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
        receiveComponent(nextText, transaction) {
          if (nextText !== this._currentElement) {
            this._currentElement = nextText;
            const nextStringText = `${nextText}`;
            if (nextStringText !== this._stringText) {
        // TODO: Save this as pending props and use performUpdateIfNecessary
        // and/or updateComponent to do the actual update for consistency with
        // other component types?
              this._stringText = nextStringText;
              const commentNodes = this.getHostNode();
              DOMChildrenOperations.replaceDelimitedText(commentNodes[0], commentNodes[1], nextStringText);
            }
          }
        },

        getHostNode() {
          let hostNode = this._commentNodes;
          if (hostNode) {
            return hostNode;
          }
          if (!this._closingComment) {
            const openingComment = ReactDOMComponentTree.getNodeFromInstance(this);
            let node = openingComment.nextSibling;
            while (true) {
              !(node != null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Missing closing comment for text component %s", this._domID) : _prodInvariant("67", this._domID) : void 0;
              if (node.nodeType === 8 && node.nodeValue === " /react-text ") {
                this._closingComment = node;
                break;
              }
              node = node.nextSibling;
            }
          }
          hostNode = [this._hostNode, this._closingComment];
          this._commentNodes = hostNode;
          return hostNode;
        },

        unmountComponent() {
          this._closingComment = null;
          this._commentNodes = null;
          ReactDOMComponentTree.uncacheNode(this);
        },

      });

      module.exports = ReactDOMTextComponent;
    }).call(this, require("_process"));
  }, { "./DOMChildrenOperations": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMChildrenOperations.js", "./DOMLazyTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./escapeTextContentForBrowser": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\escapeTextContentForBrowser.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "./validateDOMNesting": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\validateDOMNesting.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMTextarea.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const LinkedValueUtils = require("./LinkedValueUtils");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactUpdates = require("./ReactUpdates");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      let didWarnValueLink = false;
      let didWarnValDefaultVal = false;

      function forceUpdateIfMounted() {
        if (this._rootNodeID) {
    // DOM component is still mounted; update
          ReactDOMTextarea.updateWrapper(this);
        }
      }

/**
 * Implements a <textarea> host component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */
      var ReactDOMTextarea = {
        getHostProps(inst, props) {
          !(props.dangerouslySetInnerHTML == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "`dangerouslySetInnerHTML` does not make sense on <textarea>.") : _prodInvariant("91") : void 0;

    // Always set children to the same thing. In IE9, the selection range will
    // get reset if `textContent` is mutated.  We could add a check in setTextContent
    // to only set the value if/when the value differs from the node value (which would
    // completely solve this IE9 bug), but Sebastian+Ben seemed to like this solution.
    // The value can be a boolean or object so that's why it's forced to be a string.
          const hostProps = _assign({}, props, {
            value: undefined,
            defaultValue: undefined,
            children: `${inst._wrapperState.initialValue}`,
            onChange: inst._wrapperState.onChange,
          });

          return hostProps;
        },

        mountWrapper(inst, props) {
          if (process.env.NODE_ENV !== "production") {
            LinkedValueUtils.checkPropTypes("textarea", props, inst._currentElement._owner);
            if (props.valueLink !== undefined && !didWarnValueLink) {
              process.env.NODE_ENV !== "production" ? warning(false, "`valueLink` prop on `textarea` is deprecated; set `value` and `onChange` instead.") : void 0;
              didWarnValueLink = true;
            }
            if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValDefaultVal) {
              process.env.NODE_ENV !== "production" ? warning(false, "Textarea elements must be either controlled or uncontrolled " + "(specify either the value prop, or the defaultValue prop, but not " + "both). Decide between using a controlled or uncontrolled textarea " + "and remove one of these props. More info: " + "https://fb.me/react-controlled-components") : void 0;
              didWarnValDefaultVal = true;
            }
          }

          const value = LinkedValueUtils.getValue(props);
          let initialValue = value;

    // Only bother fetching default value if we're going to use it
          if (value == null) {
            let defaultValue = props.defaultValue;
      // TODO (yungsters): Remove support for children content in <textarea>.
            let children = props.children;
            if (children != null) {
              if (process.env.NODE_ENV !== "production") {
              process.env.NODE_ENV !== "production" ? warning(false, "Use the `defaultValue` or `value` props instead of setting " + "children on <textarea>.") : void 0;
            }
              !(defaultValue == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "If you supply `defaultValue` on a <textarea>, do not pass children.") : _prodInvariant("92") : void 0;
              if (Array.isArray(children)) {
              !(children.length <= 1) ? process.env.NODE_ENV !== "production" ? invariant(false, "<textarea> can only have at most one child.") : _prodInvariant("93") : void 0;
              children = children[0];
            }

              defaultValue = `${children}`;
            }
            if (defaultValue == null) {
              defaultValue = "";
            }
            initialValue = defaultValue;
          }

          inst._wrapperState = {
            initialValue: `${initialValue}`,
            listeners: null,
            onChange: _handleChange.bind(inst),
          };
        },

        updateWrapper(inst) {
          const props = inst._currentElement.props;

          const node = ReactDOMComponentTree.getNodeFromInstance(inst);
          const value = LinkedValueUtils.getValue(props);
          if (value != null) {
      // Cast `value` to a string to ensure the value is set correctly. While
      // browsers typically do this as necessary, jsdom doesn't.
            const newValue = `${value}`;

      // To avoid side effects (such as losing text selection), only set value if changed
            if (newValue !== node.value) {
              node.value = newValue;
            }
            if (props.defaultValue == null) {
              node.defaultValue = newValue;
            }
          }
          if (props.defaultValue != null) {
            node.defaultValue = props.defaultValue;
          }
        },

        postMountWrapper(inst) {
    // This is in postMount because we need access to the DOM node, which is not
    // available until after the component has mounted.
          const node = ReactDOMComponentTree.getNodeFromInstance(inst);
          const textContent = node.textContent;

    // Only set node.value if textContent is equal to the expected
    // initial value. In IE10/IE11 there is a bug where the placeholder attribute
    // will populate textContent as well.
    // https://developer.microsoft.com/microsoft-edge/platform/issues/101525/
          if (textContent === inst._wrapperState.initialValue) {
            node.value = textContent;
          }
        },
      };

      function _handleChange(event) {
        const props = this._currentElement.props;
        const returnValue = LinkedValueUtils.executeOnChange(props, event);
        ReactUpdates.asap(forceUpdateIfMounted, this);
        return returnValue;
      }

      module.exports = ReactDOMTextarea;
    }).call(this, require("_process"));
  }, { "./LinkedValueUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\LinkedValueUtils.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMTreeTraversal.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

/**
 * Return the lowest common ancestor of A and B, or null if they are in
 * different trees.
 */
      function getLowestCommonAncestor(instA, instB) {
        !("_hostNode" in instA) ? process.env.NODE_ENV !== "production" ? invariant(false, "getNodeFromInstance: Invalid argument.") : _prodInvariant("33") : void 0;
        !("_hostNode" in instB) ? process.env.NODE_ENV !== "production" ? invariant(false, "getNodeFromInstance: Invalid argument.") : _prodInvariant("33") : void 0;

        let depthA = 0;
        for (let tempA = instA; tempA; tempA = tempA._hostParent) {
          depthA++;
        }
        let depthB = 0;
        for (let tempB = instB; tempB; tempB = tempB._hostParent) {
          depthB++;
        }

  // If A is deeper, crawl up.
        while (depthA - depthB > 0) {
          instA = instA._hostParent;
          depthA--;
        }

  // If B is deeper, crawl up.
        while (depthB - depthA > 0) {
          instB = instB._hostParent;
          depthB--;
        }

  // Walk in lockstep until we find a match.
        let depth = depthA;
        while (depth--) {
          if (instA === instB) {
            return instA;
          }
          instA = instA._hostParent;
          instB = instB._hostParent;
        }
        return null;
      }

/**
 * Return if A is an ancestor of B.
 */
      function isAncestor(instA, instB) {
        !("_hostNode" in instA) ? process.env.NODE_ENV !== "production" ? invariant(false, "isAncestor: Invalid argument.") : _prodInvariant("35") : void 0;
        !("_hostNode" in instB) ? process.env.NODE_ENV !== "production" ? invariant(false, "isAncestor: Invalid argument.") : _prodInvariant("35") : void 0;

        while (instB) {
          if (instB === instA) {
            return true;
          }
          instB = instB._hostParent;
        }
        return false;
      }

/**
 * Return the parent instance of the passed-in instance.
 */
      function getParentInstance(inst) {
        !("_hostNode" in inst) ? process.env.NODE_ENV !== "production" ? invariant(false, "getParentInstance: Invalid argument.") : _prodInvariant("36") : void 0;

        return inst._hostParent;
      }

/**
 * Simulates the traversal of a two-phase, capture/bubble event dispatch.
 */
      function traverseTwoPhase(inst, fn, arg) {
        const path = [];
        while (inst) {
          path.push(inst);
          inst = inst._hostParent;
        }
        let i;
        for (i = path.length; i-- > 0;) {
          fn(path[i], "captured", arg);
        }
        for (i = 0; i < path.length; i++) {
          fn(path[i], "bubbled", arg);
        }
      }

/**
 * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
 * should would receive a `mouseEnter` or `mouseLeave` event.
 *
 * Does not invoke the callback on the nearest common ancestor because nothing
 * "entered" or "left" that element.
 */
      function traverseEnterLeave(from, to, fn, argFrom, argTo) {
        const common = from && to ? getLowestCommonAncestor(from, to) : null;
        const pathFrom = [];
        while (from && from !== common) {
          pathFrom.push(from);
          from = from._hostParent;
        }
        const pathTo = [];
        while (to && to !== common) {
          pathTo.push(to);
          to = to._hostParent;
        }
        let i;
        for (i = 0; i < pathFrom.length; i++) {
          fn(pathFrom[i], "bubbled", argFrom);
        }
        for (i = pathTo.length; i-- > 0;) {
          fn(pathTo[i], "captured", argTo);
        }
      }

      module.exports = {
        isAncestor,
        getLowestCommonAncestor,
        getParentInstance,
        traverseTwoPhase,
        traverseEnterLeave,
      };
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMUnknownPropertyHook.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const DOMProperty = require("./DOMProperty");
      const EventPluginRegistry = require("./EventPluginRegistry");
      const ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");

      const warning = require("fbjs/lib/warning");

      if (process.env.NODE_ENV !== "production") {
        const reactProps = {
          children: true,
          dangerouslySetInnerHTML: true,
          key: true,
          ref: true,

          autoFocus: true,
          defaultValue: true,
          valueLink: true,
          defaultChecked: true,
          checkedLink: true,
          innerHTML: true,
          suppressContentEditableWarning: true,
          onFocusIn: true,
          onFocusOut: true,
        };
        const warnedProperties = {};

        var validateProperty = function(tagName, name, debugID) {
          if (DOMProperty.properties.hasOwnProperty(name) || DOMProperty.isCustomAttribute(name)) {
            return true;
          }
          if (reactProps.hasOwnProperty(name) && reactProps[name] || warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
            return true;
          }
          if (EventPluginRegistry.registrationNameModules.hasOwnProperty(name)) {
            return true;
          }
          warnedProperties[name] = true;
          const lowerCasedName = name.toLowerCase();

    // data-* attributes should be lowercase; suggest the lowercase version
          const standardName = DOMProperty.isCustomAttribute(lowerCasedName) ? lowerCasedName : DOMProperty.getPossibleStandardName.hasOwnProperty(lowerCasedName) ? DOMProperty.getPossibleStandardName[lowerCasedName] : null;

          const registrationName = EventPluginRegistry.possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? EventPluginRegistry.possibleRegistrationNames[lowerCasedName] : null;

          if (standardName != null) {
            process.env.NODE_ENV !== "production" ? warning(false, "Unknown DOM property %s. Did you mean %s?%s", name, standardName, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
            return true;
          } else if (registrationName != null) {
            process.env.NODE_ENV !== "production" ? warning(false, "Unknown event handler property %s. Did you mean `%s`?%s", name, registrationName, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
            return true;
          }
      // We were unable to guess which prop the user intended.
      // It is likely that the user was just blindly spreading/forwarding props
      // Components should be careful to only render valid props/attributes.
      // Warning will be invoked in warnUnknownProperties to allow grouping.
          return false;
        };
      }

      const warnUnknownProperties = function(debugID, element) {
        const unknownProps = [];
        for (const key in element.props) {
          const isValid = validateProperty(element.type, key, debugID);
          if (!isValid) {
            unknownProps.push(key);
          }
        }

        const unknownPropString = unknownProps.map((prop) => {
          return `\`${prop}\``;
        }).join(", ");

        if (unknownProps.length === 1) {
          process.env.NODE_ENV !== "production" ? warning(false, "Unknown prop %s on <%s> tag. Remove this prop from the element. " + "For details, see https://fb.me/react-unknown-prop%s", unknownPropString, element.type, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
        } else if (unknownProps.length > 1) {
          process.env.NODE_ENV !== "production" ? warning(false, "Unknown props %s on <%s> tag. Remove these props from the element. " + "For details, see https://fb.me/react-unknown-prop%s", unknownPropString, element.type, ReactComponentTreeHook.getStackAddendumByID(debugID)) : void 0;
        }
      };

      function handleElement(debugID, element) {
        if (element == null || typeof element.type !== "string") {
          return;
        }
        if (element.type.indexOf("-") >= 0 || element.props.is) {
          return;
        }
        warnUnknownProperties(debugID, element);
      }

      const ReactDOMUnknownPropertyHook = {
        onBeforeMountComponent(debugID, element) {
          handleElement(debugID, element);
        },
        onBeforeUpdateComponent(debugID, element) {
          handleElement(debugID, element);
        },
      };

      module.exports = ReactDOMUnknownPropertyHook;
    }).call(this, require("_process"));
  }, { "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "./EventPluginRegistry": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginRegistry.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDebugTool.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const ReactInvalidSetStateWarningHook = require("./ReactInvalidSetStateWarningHook");
      const ReactHostOperationHistoryHook = require("./ReactHostOperationHistoryHook");
      const ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
      const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

      const performanceNow = require("fbjs/lib/performanceNow");
      const warning = require("fbjs/lib/warning");

      const hooks = [];
      const didHookThrowForEvent = {};

      function callHook(event, fn, context, arg1, arg2, arg3, arg4, arg5) {
        try {
          fn.call(context, arg1, arg2, arg3, arg4, arg5);
        } catch (e) {
          process.env.NODE_ENV !== "production" ? warning(didHookThrowForEvent[event], "Exception thrown by hook while handling %s: %s", event, `${e}\n${e.stack}`) : void 0;
          didHookThrowForEvent[event] = true;
        }
      }

      function emitEvent(event, arg1, arg2, arg3, arg4, arg5) {
        for (let i = 0; i < hooks.length; i++) {
          const hook = hooks[i];
          const fn = hook[event];
          if (fn) {
            callHook(event, fn, hook, arg1, arg2, arg3, arg4, arg5);
          }
        }
      }

      let isProfiling = false;
      const flushHistory = [];
      const lifeCycleTimerStack = [];
      let currentFlushNesting = 0;
      let currentFlushMeasurements = [];
      let currentFlushStartTime = 0;
      let currentTimerDebugID = null;
      let currentTimerStartTime = 0;
      let currentTimerNestedFlushDuration = 0;
      let currentTimerType = null;

      let lifeCycleTimerHasWarned = false;

      function clearHistory() {
        ReactComponentTreeHook.purgeUnmountedComponents();
        ReactHostOperationHistoryHook.clearHistory();
      }

      function getTreeSnapshot(registeredIDs) {
        return registeredIDs.reduce((tree, id) => {
          const ownerID = ReactComponentTreeHook.getOwnerID(id);
          const parentID = ReactComponentTreeHook.getParentID(id);
          tree[id] = {
            displayName: ReactComponentTreeHook.getDisplayName(id),
            text: ReactComponentTreeHook.getText(id),
            updateCount: ReactComponentTreeHook.getUpdateCount(id),
            childIDs: ReactComponentTreeHook.getChildIDs(id),
      // Text nodes don't have owners but this is close enough.
            ownerID: ownerID || parentID && ReactComponentTreeHook.getOwnerID(parentID) || 0,
            parentID,
          };
          return tree;
        }, {});
      }

      function resetMeasurements() {
        const previousStartTime = currentFlushStartTime;
        const previousMeasurements = currentFlushMeasurements;
        const previousOperations = ReactHostOperationHistoryHook.getHistory();

        if (currentFlushNesting === 0) {
          currentFlushStartTime = 0;
          currentFlushMeasurements = [];
          clearHistory();
          return;
        }

        if (previousMeasurements.length || previousOperations.length) {
          const registeredIDs = ReactComponentTreeHook.getRegisteredIDs();
          flushHistory.push({
            duration: performanceNow() - previousStartTime,
            measurements: previousMeasurements || [],
            operations: previousOperations || [],
            treeSnapshot: getTreeSnapshot(registeredIDs),
          });
        }

        clearHistory();
        currentFlushStartTime = performanceNow();
        currentFlushMeasurements = [];
      }

      function checkDebugID(debugID) {
        const allowRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (allowRoot && debugID === 0) {
          return;
        }
        if (!debugID) {
          process.env.NODE_ENV !== "production" ? warning(false, "ReactDebugTool: debugID may not be empty.") : void 0;
        }
      }

      function beginLifeCycleTimer(debugID, timerType) {
        if (currentFlushNesting === 0) {
          return;
        }
        if (currentTimerType && !lifeCycleTimerHasWarned) {
          process.env.NODE_ENV !== "production" ? warning(false, "There is an internal error in the React performance measurement code. " + "Did not expect %s timer to start while %s timer is still in " + "progress for %s instance.", timerType, currentTimerType || "no", debugID === currentTimerDebugID ? "the same" : "another") : void 0;
          lifeCycleTimerHasWarned = true;
        }
        currentTimerStartTime = performanceNow();
        currentTimerNestedFlushDuration = 0;
        currentTimerDebugID = debugID;
        currentTimerType = timerType;
      }

      function endLifeCycleTimer(debugID, timerType) {
        if (currentFlushNesting === 0) {
          return;
        }
        if (currentTimerType !== timerType && !lifeCycleTimerHasWarned) {
          process.env.NODE_ENV !== "production" ? warning(false, "There is an internal error in the React performance measurement code. " + "We did not expect %s timer to stop while %s timer is still in " + "progress for %s instance. Please report this as a bug in React.", timerType, currentTimerType || "no", debugID === currentTimerDebugID ? "the same" : "another") : void 0;
          lifeCycleTimerHasWarned = true;
        }
        if (isProfiling) {
          currentFlushMeasurements.push({
            timerType,
            instanceID: debugID,
            duration: performanceNow() - currentTimerStartTime - currentTimerNestedFlushDuration,
          });
        }
        currentTimerStartTime = 0;
        currentTimerNestedFlushDuration = 0;
        currentTimerDebugID = null;
        currentTimerType = null;
      }

      function pauseCurrentLifeCycleTimer() {
        const currentTimer = {
          startTime: currentTimerStartTime,
          nestedFlushStartTime: performanceNow(),
          debugID: currentTimerDebugID,
          timerType: currentTimerType,
        };
        lifeCycleTimerStack.push(currentTimer);
        currentTimerStartTime = 0;
        currentTimerNestedFlushDuration = 0;
        currentTimerDebugID = null;
        currentTimerType = null;
      }

      function resumeCurrentLifeCycleTimer() {
        let _lifeCycleTimerStack$ = lifeCycleTimerStack.pop(),
          startTime = _lifeCycleTimerStack$.startTime,
          nestedFlushStartTime = _lifeCycleTimerStack$.nestedFlushStartTime,
          debugID = _lifeCycleTimerStack$.debugID,
          timerType = _lifeCycleTimerStack$.timerType;

        const nestedFlushDuration = performanceNow() - nestedFlushStartTime;
        currentTimerStartTime = startTime;
        currentTimerNestedFlushDuration += nestedFlushDuration;
        currentTimerDebugID = debugID;
        currentTimerType = timerType;
      }

      let lastMarkTimeStamp = 0;
      const canUsePerformanceMeasure =
// $FlowFixMe https://github.com/facebook/flow/issues/2345
typeof performance !== "undefined" && typeof performance.mark === "function" && typeof performance.clearMarks === "function" && typeof performance.measure === "function" && typeof performance.clearMeasures === "function";

      function shouldMark(debugID) {
        if (!isProfiling || !canUsePerformanceMeasure) {
          return false;
        }
        const element = ReactComponentTreeHook.getElement(debugID);
        if (element == null || typeof element !== "object") {
          return false;
        }
        const isHostElement = typeof element.type === "string";
        if (isHostElement) {
          return false;
        }
        return true;
      }

      function markBegin(debugID, markType) {
        if (!shouldMark(debugID)) {
          return;
        }

        const markName = `${debugID}::${markType}`;
        lastMarkTimeStamp = performanceNow();
        performance.mark(markName);
      }

      function markEnd(debugID, markType) {
        if (!shouldMark(debugID)) {
          return;
        }

        const markName = `${debugID}::${markType}`;
        const displayName = ReactComponentTreeHook.getDisplayName(debugID) || "Unknown";

  // Chrome has an issue of dropping markers recorded too fast:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=640652
  // To work around this, we will not report very small measurements.
  // I determined the magic number by tweaking it back and forth.
  // 0.05ms was enough to prevent the issue, but I set it to 0.1ms to be safe.
  // When the bug is fixed, we can `measure()` unconditionally if we want to.
        const timeStamp = performanceNow();
        if (timeStamp - lastMarkTimeStamp > 0.1) {
          var measurementName = `${displayName} [${markType}]`;
          performance.measure(measurementName, markName);
        }

        performance.clearMarks(markName);
        performance.clearMeasures(measurementName);
      }

      var ReactDebugTool = {
        addHook(hook) {
          hooks.push(hook);
        },
        removeHook(hook) {
          for (let i = 0; i < hooks.length; i++) {
            if (hooks[i] === hook) {
              hooks.splice(i, 1);
              i--;
            }
          }
        },
        isProfiling() {
          return isProfiling;
        },
        beginProfiling() {
          if (isProfiling) {
            return;
          }

          isProfiling = true;
          flushHistory.length = 0;
          resetMeasurements();
          ReactDebugTool.addHook(ReactHostOperationHistoryHook);
        },
        endProfiling() {
          if (!isProfiling) {
            return;
          }

          isProfiling = false;
          resetMeasurements();
          ReactDebugTool.removeHook(ReactHostOperationHistoryHook);
        },
        getFlushHistory() {
          return flushHistory;
        },
        onBeginFlush() {
          currentFlushNesting++;
          resetMeasurements();
          pauseCurrentLifeCycleTimer();
          emitEvent("onBeginFlush");
        },
        onEndFlush() {
          resetMeasurements();
          currentFlushNesting--;
          resumeCurrentLifeCycleTimer();
          emitEvent("onEndFlush");
        },
        onBeginLifeCycleTimer(debugID, timerType) {
          checkDebugID(debugID);
          emitEvent("onBeginLifeCycleTimer", debugID, timerType);
          markBegin(debugID, timerType);
          beginLifeCycleTimer(debugID, timerType);
        },
        onEndLifeCycleTimer(debugID, timerType) {
          checkDebugID(debugID);
          endLifeCycleTimer(debugID, timerType);
          markEnd(debugID, timerType);
          emitEvent("onEndLifeCycleTimer", debugID, timerType);
        },
        onBeginProcessingChildContext() {
          emitEvent("onBeginProcessingChildContext");
        },
        onEndProcessingChildContext() {
          emitEvent("onEndProcessingChildContext");
        },
        onHostOperation(operation) {
          checkDebugID(operation.instanceID);
          emitEvent("onHostOperation", operation);
        },
        onSetState() {
          emitEvent("onSetState");
        },
        onSetChildren(debugID, childDebugIDs) {
          checkDebugID(debugID);
          childDebugIDs.forEach(checkDebugID);
          emitEvent("onSetChildren", debugID, childDebugIDs);
        },
        onBeforeMountComponent(debugID, element, parentDebugID) {
          checkDebugID(debugID);
          checkDebugID(parentDebugID, true);
          emitEvent("onBeforeMountComponent", debugID, element, parentDebugID);
          markBegin(debugID, "mount");
        },
        onMountComponent(debugID) {
          checkDebugID(debugID);
          markEnd(debugID, "mount");
          emitEvent("onMountComponent", debugID);
        },
        onBeforeUpdateComponent(debugID, element) {
          checkDebugID(debugID);
          emitEvent("onBeforeUpdateComponent", debugID, element);
          markBegin(debugID, "update");
        },
        onUpdateComponent(debugID) {
          checkDebugID(debugID);
          markEnd(debugID, "update");
          emitEvent("onUpdateComponent", debugID);
        },
        onBeforeUnmountComponent(debugID) {
          checkDebugID(debugID);
          emitEvent("onBeforeUnmountComponent", debugID);
          markBegin(debugID, "unmount");
        },
        onUnmountComponent(debugID) {
          checkDebugID(debugID);
          markEnd(debugID, "unmount");
          emitEvent("onUnmountComponent", debugID);
        },
        onTestEvent() {
          emitEvent("onTestEvent");
        },
      };

// TODO remove these when RN/www gets updated
      ReactDebugTool.addDevtool = ReactDebugTool.addHook;
      ReactDebugTool.removeDevtool = ReactDebugTool.removeHook;

      ReactDebugTool.addHook(ReactInvalidSetStateWarningHook);
      ReactDebugTool.addHook(ReactComponentTreeHook);
      const url = ExecutionEnvironment.canUseDOM && window.location.href || "";
      if (/[?&]react_perf\b/.test(url)) {
        ReactDebugTool.beginProfiling();
      }

      module.exports = ReactDebugTool;
    }).call(this, require("_process"));
  }, { "./ReactHostOperationHistoryHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactHostOperationHistoryHook.js", "./ReactInvalidSetStateWarningHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInvalidSetStateWarningHook.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "fbjs/lib/performanceNow": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\performanceNow.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDefaultBatchingStrategy.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const _assign = require("object-assign");

    const ReactUpdates = require("./ReactUpdates");
    const Transaction = require("./Transaction");

    const emptyFunction = require("fbjs/lib/emptyFunction");

    const RESET_BATCHED_UPDATES = {
      initialize: emptyFunction,
      close() {
        ReactDefaultBatchingStrategy.isBatchingUpdates = false;
      },
    };

    const FLUSH_BATCHED_UPDATES = {
      initialize: emptyFunction,
      close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates),
    };

    const TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];

    function ReactDefaultBatchingStrategyTransaction() {
      this.reinitializeTransaction();
    }

    _assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction, {
      getTransactionWrappers() {
        return TRANSACTION_WRAPPERS;
      },
    });

    const transaction = new ReactDefaultBatchingStrategyTransaction();

    var ReactDefaultBatchingStrategy = {
      isBatchingUpdates: false,

  /**
   * Call the provided function in a context within which calls to `setState`
   * and friends are batched such that components aren't updated unnecessarily.
   */
      batchedUpdates(callback, a, b, c, d, e) {
        const alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;

        ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    // The code is written this way to avoid extra allocations
        if (alreadyBatchingUpdates) {
          return callback(a, b, c, d, e);
        }
        return transaction.perform(callback, null, a, b, c, d, e);
      },
    };

    module.exports = ReactDefaultBatchingStrategy;
  }, { "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./Transaction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Transaction.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDefaultInjection.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ARIADOMPropertyConfig = require("./ARIADOMPropertyConfig");
    const BeforeInputEventPlugin = require("./BeforeInputEventPlugin");
    const ChangeEventPlugin = require("./ChangeEventPlugin");
    const DefaultEventPluginOrder = require("./DefaultEventPluginOrder");
    const EnterLeaveEventPlugin = require("./EnterLeaveEventPlugin");
    const HTMLDOMPropertyConfig = require("./HTMLDOMPropertyConfig");
    const ReactComponentBrowserEnvironment = require("./ReactComponentBrowserEnvironment");
    const ReactDOMComponent = require("./ReactDOMComponent");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");
    const ReactDOMEmptyComponent = require("./ReactDOMEmptyComponent");
    const ReactDOMTreeTraversal = require("./ReactDOMTreeTraversal");
    const ReactDOMTextComponent = require("./ReactDOMTextComponent");
    const ReactDefaultBatchingStrategy = require("./ReactDefaultBatchingStrategy");
    const ReactEventListener = require("./ReactEventListener");
    const ReactInjection = require("./ReactInjection");
    const ReactReconcileTransaction = require("./ReactReconcileTransaction");
    const SVGDOMPropertyConfig = require("./SVGDOMPropertyConfig");
    const SelectEventPlugin = require("./SelectEventPlugin");
    const SimpleEventPlugin = require("./SimpleEventPlugin");

    let alreadyInjected = false;

    function inject() {
      if (alreadyInjected) {
    // TODO: This is currently true because these injections are shared between
    // the client and the server package. They should be built independently
    // and not share any injection state. Then this problem will be solved.
        return;
      }
      alreadyInjected = true;

      ReactInjection.EventEmitter.injectReactEventListener(ReactEventListener);

  /**
   * Inject modules for resolving DOM hierarchy and plugin ordering.
   */
      ReactInjection.EventPluginHub.injectEventPluginOrder(DefaultEventPluginOrder);
      ReactInjection.EventPluginUtils.injectComponentTree(ReactDOMComponentTree);
      ReactInjection.EventPluginUtils.injectTreeTraversal(ReactDOMTreeTraversal);

  /**
   * Some important event plugins included by default (without having to require
   * them).
   */
      ReactInjection.EventPluginHub.injectEventPluginsByName({
        SimpleEventPlugin,
        EnterLeaveEventPlugin,
        ChangeEventPlugin,
        SelectEventPlugin,
        BeforeInputEventPlugin,
      });

      ReactInjection.HostComponent.injectGenericComponentClass(ReactDOMComponent);

      ReactInjection.HostComponent.injectTextComponentClass(ReactDOMTextComponent);

      ReactInjection.DOMProperty.injectDOMPropertyConfig(ARIADOMPropertyConfig);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(HTMLDOMPropertyConfig);
      ReactInjection.DOMProperty.injectDOMPropertyConfig(SVGDOMPropertyConfig);

      ReactInjection.EmptyComponent.injectEmptyComponentFactory((instantiate) => {
        return new ReactDOMEmptyComponent(instantiate);
      });

      ReactInjection.Updates.injectReconcileTransaction(ReactReconcileTransaction);
      ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

      ReactInjection.Component.injectEnvironment(ReactComponentBrowserEnvironment);
    }

    module.exports = {
      inject,
    };
  }, { "./ARIADOMPropertyConfig": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ARIADOMPropertyConfig.js", "./BeforeInputEventPlugin": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\BeforeInputEventPlugin.js", "./ChangeEventPlugin": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ChangeEventPlugin.js", "./DefaultEventPluginOrder": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DefaultEventPluginOrder.js", "./EnterLeaveEventPlugin": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EnterLeaveEventPlugin.js", "./HTMLDOMPropertyConfig": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\HTMLDOMPropertyConfig.js", "./ReactComponentBrowserEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactComponentBrowserEnvironment.js", "./ReactDOMComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponent.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactDOMEmptyComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMEmptyComponent.js", "./ReactDOMTextComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMTextComponent.js", "./ReactDOMTreeTraversal": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMTreeTraversal.js", "./ReactDefaultBatchingStrategy": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDefaultBatchingStrategy.js", "./ReactEventListener": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEventListener.js", "./ReactInjection": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInjection.js", "./ReactReconcileTransaction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconcileTransaction.js", "./SVGDOMPropertyConfig": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SVGDOMPropertyConfig.js", "./SelectEventPlugin": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SelectEventPlugin.js", "./SimpleEventPlugin": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SimpleEventPlugin.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactElementSymbol.js": [function(require, module, exports) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


// The Symbol used to tag the ReactElement type. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.

    const REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;

    module.exports = REACT_ELEMENT_TYPE;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEmptyComponent.js": [function(require, module, exports) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    let emptyComponentFactory;

    const ReactEmptyComponentInjection = {
      injectEmptyComponentFactory(factory) {
        emptyComponentFactory = factory;
      },
    };

    const ReactEmptyComponent = {
      create(instantiate) {
        return emptyComponentFactory(instantiate);
      },
    };

    ReactEmptyComponent.injection = ReactEmptyComponentInjection;

    module.exports = ReactEmptyComponent;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactErrorUtils.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      let caughtError = null;

/**
 * Call a function while guarding against errors that happens within it.
 *
 * @param {String} name of the guard to use for logging or debugging
 * @param {Function} func The function to invoke
 * @param {*} a First argument
 * @param {*} b Second argument
 */
      function invokeGuardedCallback(name, func, a) {
        try {
          func(a);
        } catch (x) {
          if (caughtError === null) {
            caughtError = x;
          }
        }
      }

      const ReactErrorUtils = {
        invokeGuardedCallback,

  /**
   * Invoked by ReactTestUtils.Simulate so that any errors thrown by the event
   * handler are sure to be rethrown by rethrowCaughtError.
   */
        invokeGuardedCallbackWithCatch: invokeGuardedCallback,

  /**
   * During execution of guarded functions we will capture the first error which
   * we will rethrow to be handled by the top level error handler.
   */
        rethrowCaughtError() {
          if (caughtError) {
            const error = caughtError;
            caughtError = null;
            throw error;
          }
        },
      };

      if (process.env.NODE_ENV !== "production") {
  /**
   * To help development we can get better devtools integration by simulating a
   * real browser event.
   */
        if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof document !== "undefined" && typeof document.createEvent === "function") {
          const fakeNode = document.createElement("react");
          ReactErrorUtils.invokeGuardedCallback = function(name, func, a) {
            const boundFunc = func.bind(null, a);
            const evtType = `react-${name}`;
            fakeNode.addEventListener(evtType, boundFunc, false);
            const evt = document.createEvent("Event");
      // $FlowFixMe https://github.com/facebook/flow/issues/2336
            evt.initEvent(evtType, false, false);
            fakeNode.dispatchEvent(evt);
            fakeNode.removeEventListener(evtType, boundFunc, false);
          };
        }
      }

      module.exports = ReactErrorUtils;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEventEmitterMixin.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const EventPluginHub = require("./EventPluginHub");

    function runEventQueueInBatch(events) {
      EventPluginHub.enqueueEvents(events);
      EventPluginHub.processEventQueue(false);
    }

    const ReactEventEmitterMixin = {

  /**
   * Streams a fired top-level event to `EventPluginHub` where plugins have the
   * opportunity to create `ReactEvent`s to be dispatched.
   */
      handleTopLevel(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        const events = EventPluginHub.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
        runEventQueueInBatch(events);
      },
    };

    module.exports = ReactEventEmitterMixin;
  }, { "./EventPluginHub": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginHub.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEventListener.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const _assign = require("object-assign");

    const EventListener = require("fbjs/lib/EventListener");
    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
    const PooledClass = require("./PooledClass");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");
    const ReactUpdates = require("./ReactUpdates");

    const getEventTarget = require("./getEventTarget");
    const getUnboundedScrollPosition = require("fbjs/lib/getUnboundedScrollPosition");

/**
 * Find the deepest React component completely containing the root of the
 * passed-in instance (for use when entire React trees are nested within each
 * other). If React trees are not nested, returns null.
 */
    function findParent(inst) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
      while (inst._hostParent) {
        inst = inst._hostParent;
      }
      const rootNode = ReactDOMComponentTree.getNodeFromInstance(inst);
      const container = rootNode.parentNode;
      return ReactDOMComponentTree.getClosestInstanceFromNode(container);
    }

// Used to store ancestor hierarchy in top level callback
    function TopLevelCallbackBookKeeping(topLevelType, nativeEvent) {
      this.topLevelType = topLevelType;
      this.nativeEvent = nativeEvent;
      this.ancestors = [];
    }
    _assign(TopLevelCallbackBookKeeping.prototype, {
      destructor() {
        this.topLevelType = null;
        this.nativeEvent = null;
        this.ancestors.length = 0;
      },
    });
    PooledClass.addPoolingTo(TopLevelCallbackBookKeeping, PooledClass.twoArgumentPooler);

    function handleTopLevelImpl(bookKeeping) {
      const nativeEventTarget = getEventTarget(bookKeeping.nativeEvent);
      let targetInst = ReactDOMComponentTree.getClosestInstanceFromNode(nativeEventTarget);

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
      let ancestor = targetInst;
      do {
        bookKeeping.ancestors.push(ancestor);
        ancestor = ancestor && findParent(ancestor);
      } while (ancestor);

      for (let i = 0; i < bookKeeping.ancestors.length; i++) {
        targetInst = bookKeeping.ancestors[i];
        ReactEventListener._handleTopLevel(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
      }
    }

    function scrollValueMonitor(cb) {
      const scrollPosition = getUnboundedScrollPosition(window);
      cb(scrollPosition);
    }

    var ReactEventListener = {
      _enabled: true,
      _handleTopLevel: null,

      WINDOW_HANDLE: ExecutionEnvironment.canUseDOM ? window : null,

      setHandleTopLevel(handleTopLevel) {
        ReactEventListener._handleTopLevel = handleTopLevel;
      },

      setEnabled(enabled) {
        ReactEventListener._enabled = !!enabled;
      },

      isEnabled() {
        return ReactEventListener._enabled;
      },

  /**
   * Traps top-level events by using event bubbling.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} element Element on which to attach listener.
   * @return {?object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
      trapBubbledEvent(topLevelType, handlerBaseName, element) {
        if (!element) {
          return null;
        }
        return EventListener.listen(element, handlerBaseName, ReactEventListener.dispatchEvent.bind(null, topLevelType));
      },

  /**
   * Traps a top-level event by using event capturing.
   *
   * @param {string} topLevelType Record from `EventConstants`.
   * @param {string} handlerBaseName Event name (e.g. "click").
   * @param {object} element Element on which to attach listener.
   * @return {?object} An object with a remove function which will forcefully
   *                  remove the listener.
   * @internal
   */
      trapCapturedEvent(topLevelType, handlerBaseName, element) {
        if (!element) {
          return null;
        }
        return EventListener.capture(element, handlerBaseName, ReactEventListener.dispatchEvent.bind(null, topLevelType));
      },

      monitorScrollValue(refresh) {
        const callback = scrollValueMonitor.bind(null, refresh);
        EventListener.listen(window, "scroll", callback);
      },

      dispatchEvent(topLevelType, nativeEvent) {
        if (!ReactEventListener._enabled) {
          return;
        }

        const bookKeeping = TopLevelCallbackBookKeeping.getPooled(topLevelType, nativeEvent);
        try {
      // Event queue being processed in the same cycle allows
      // `preventDefault`.
          ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
        } finally {
          TopLevelCallbackBookKeeping.release(bookKeeping);
        }
      },
    };

    module.exports = ReactEventListener;
  }, { "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./getEventTarget": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventTarget.js", "fbjs/lib/EventListener": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\EventListener.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "fbjs/lib/getUnboundedScrollPosition": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getUnboundedScrollPosition.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactFeatureFlags.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


    const ReactFeatureFlags = {
  // When true, call console.time() before and .timeEnd() after each top-level
  // render (both initial renders and updates). Useful when looking at prod-mode
  // timeline profiles in Chrome, for example.
      logTopLevelRenders: false,
    };

    module.exports = ReactFeatureFlags;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactHostComponent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

      let genericComponentClass = null;
      let textComponentClass = null;

      const ReactHostComponentInjection = {
  // This accepts a class that receives the tag string. This is a catch all
  // that can render any kind of tag.
        injectGenericComponentClass(componentClass) {
          genericComponentClass = componentClass;
        },
  // This accepts a text component class that takes the text string to be
  // rendered as props.
        injectTextComponentClass(componentClass) {
          textComponentClass = componentClass;
        },
      };

/**
 * Get a host internal component class for a specific tag.
 *
 * @param {ReactElement} element The element to create.
 * @return {function} The internal class constructor function.
 */
      function createInternalComponent(element) {
        !genericComponentClass ? process.env.NODE_ENV !== "production" ? invariant(false, "There is no registered component for the tag %s", element.type) : _prodInvariant("111", element.type) : void 0;
        return new genericComponentClass(element);
      }

/**
 * @param {ReactText} text
 * @return {ReactComponent}
 */
      function createInstanceForText(text) {
        return new textComponentClass(text);
      }

/**
 * @param {ReactComponent} component
 * @return {boolean}
 */
      function isTextComponent(component) {
        return component instanceof textComponentClass;
      }

      const ReactHostComponent = {
        createInternalComponent,
        createInstanceForText,
        isTextComponent,
        injection: ReactHostComponentInjection,
      };

      module.exports = ReactHostComponent;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactHostOperationHistoryHook.js": [function(require, module, exports) {
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


    let history = [];

    var ReactHostOperationHistoryHook = {
      onHostOperation(operation) {
        history.push(operation);
      },
      clearHistory() {
        if (ReactHostOperationHistoryHook._preventClearing) {
      // Should only be used for tests.
          return;
        }

        history = [];
      },
      getHistory() {
        return history;
      },
    };

    module.exports = ReactHostOperationHistoryHook;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInjection.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const DOMProperty = require("./DOMProperty");
    const EventPluginHub = require("./EventPluginHub");
    const EventPluginUtils = require("./EventPluginUtils");
    const ReactComponentEnvironment = require("./ReactComponentEnvironment");
    const ReactEmptyComponent = require("./ReactEmptyComponent");
    const ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
    const ReactHostComponent = require("./ReactHostComponent");
    const ReactUpdates = require("./ReactUpdates");

    const ReactInjection = {
      Component: ReactComponentEnvironment.injection,
      DOMProperty: DOMProperty.injection,
      EmptyComponent: ReactEmptyComponent.injection,
      EventPluginHub: EventPluginHub.injection,
      EventPluginUtils: EventPluginUtils.injection,
      EventEmitter: ReactBrowserEventEmitter.injection,
      HostComponent: ReactHostComponent.injection,
      Updates: ReactUpdates.injection,
    };

    module.exports = ReactInjection;
  }, { "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "./EventPluginHub": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginHub.js", "./EventPluginUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPluginUtils.js", "./ReactBrowserEventEmitter": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactBrowserEventEmitter.js", "./ReactComponentEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactComponentEnvironment.js", "./ReactEmptyComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEmptyComponent.js", "./ReactHostComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactHostComponent.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInputSelection.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ReactDOMSelection = require("./ReactDOMSelection");

    const containsNode = require("fbjs/lib/containsNode");
    const focusNode = require("fbjs/lib/focusNode");
    const getActiveElement = require("fbjs/lib/getActiveElement");

    function isInDocument(node) {
      return containsNode(document.documentElement, node);
    }

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */
    var ReactInputSelection = {

      hasSelectionCapabilities(elem) {
        const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
        return nodeName && (nodeName === "input" && elem.type === "text" || nodeName === "textarea" || elem.contentEditable === "true");
      },

      getSelectionInformation() {
        const focusedElem = getActiveElement();
        return {
          focusedElem,
          selectionRange: ReactInputSelection.hasSelectionCapabilities(focusedElem) ? ReactInputSelection.getSelection(focusedElem) : null,
        };
      },

  /**
   * @restoreSelection: If any selection information was potentially lost,
   * restore it. This is useful when performing operations that could remove dom
   * nodes and place them back in, resulting in focus being lost.
   */
      restoreSelection(priorSelectionInformation) {
        const curFocusedElem = getActiveElement();
        const priorFocusedElem = priorSelectionInformation.focusedElem;
        const priorSelectionRange = priorSelectionInformation.selectionRange;
        if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
          if (ReactInputSelection.hasSelectionCapabilities(priorFocusedElem)) {
            ReactInputSelection.setSelection(priorFocusedElem, priorSelectionRange);
          }
          focusNode(priorFocusedElem);
        }
      },

  /**
   * @getSelection: Gets the selection bounds of a focused textarea, input or
   * contentEditable node.
   * -@input: Look up selection bounds of this input
   * -@return {start: selectionStart, end: selectionEnd}
   */
      getSelection(input) {
        let selection;

        if ("selectionStart" in input) {
      // Modern browser with input or textarea.
          selection = {
            start: input.selectionStart,
            end: input.selectionEnd,
          };
        } else if (document.selection && input.nodeName && input.nodeName.toLowerCase() === "input") {
      // IE8 input.
          const range = document.selection.createRange();
      // There can only be one selection per document in IE, so it must
      // be in our element.
          if (range.parentElement() === input) {
            selection = {
              start: -range.moveStart("character", -input.value.length),
              end: -range.moveEnd("character", -input.value.length),
            };
          }
        } else {
      // Content editable or old IE textarea.
          selection = ReactDOMSelection.getOffsets(input);
        }

        return selection || { start: 0, end: 0 };
      },

  /**
   * @setSelection: Sets the selection bounds of a textarea or input and focuses
   * the input.
   * -@input     Set selection bounds of this input or textarea
   * -@offsets   Object of same form that is returned from get*
   */
      setSelection(input, offsets) {
        const start = offsets.start;
        let end = offsets.end;
        if (end === undefined) {
          end = start;
        }

        if ("selectionStart" in input) {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, input.value.length);
        } else if (document.selection && input.nodeName && input.nodeName.toLowerCase() === "input") {
          const range = input.createTextRange();
          range.collapse(true);
          range.moveStart("character", start);
          range.moveEnd("character", end - start);
          range.select();
        } else {
          ReactDOMSelection.setOffsets(input, offsets);
        }
      },
    };

    module.exports = ReactInputSelection;
  }, { "./ReactDOMSelection": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMSelection.js", "fbjs/lib/containsNode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\containsNode.js", "fbjs/lib/focusNode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\focusNode.js", "fbjs/lib/getActiveElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getActiveElement.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstanceMap.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 */

// TODO: Replace this with ES6: var ReactInstanceMap = new Map();

    const ReactInstanceMap = {

  /**
   * This API should be called `delete` but we'd have to make sure to always
   * transform these to strings for IE support. When this transform is fully
   * supported we can rename it.
   */
      remove(key) {
        key._reactInternalInstance = undefined;
      },

      get(key) {
        return key._reactInternalInstance;
      },

      has(key) {
        return key._reactInternalInstance !== undefined;
      },

      set(key, value) {
        key._reactInternalInstance = value;
      },

    };

    module.exports = ReactInstanceMap;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


// Trust the developer to only use ReactInstrumentation with a __DEV__ check

      let debugTool = null;

      if (process.env.NODE_ENV !== "production") {
        const ReactDebugTool = require("./ReactDebugTool");
        debugTool = ReactDebugTool;
      }

      module.exports = { debugTool };
    }).call(this, require("_process"));
  }, { "./ReactDebugTool": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDebugTool.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInvalidSetStateWarningHook.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const warning = require("fbjs/lib/warning");

      if (process.env.NODE_ENV !== "production") {
        var processingChildContext = false;

        var warnInvalidSetState = function() {
          process.env.NODE_ENV !== "production" ? warning(!processingChildContext, "setState(...): Cannot call setState() inside getChildContext()") : void 0;
        };
      }

      const ReactInvalidSetStateWarningHook = {
        onBeginProcessingChildContext() {
          processingChildContext = true;
        },
        onEndProcessingChildContext() {
          processingChildContext = false;
        },
        onSetState() {
          warnInvalidSetState();
        },
      };

      module.exports = ReactInvalidSetStateWarningHook;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMarkupChecksum.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const adler32 = require("./adler32");

    const TAG_END = /\/?>/;
    const COMMENT_START = /^<\!\-\-/;

    var ReactMarkupChecksum = {
      CHECKSUM_ATTR_NAME: "data-react-checksum",

  /**
   * @param {string} markup Markup string
   * @return {string} Markup string with checksum attribute attached
   */
      addChecksumToMarkup(markup) {
        const checksum = adler32(markup);

    // Add checksum (handle both parent tags, comments and self-closing tags)
        if (COMMENT_START.test(markup)) {
          return markup;
        }
        return markup.replace(TAG_END, ` ${ReactMarkupChecksum.CHECKSUM_ATTR_NAME}="${checksum}"$&`);
      },

  /**
   * @param {string} markup to use
   * @param {DOMElement} element root React element
   * @returns {boolean} whether or not the markup is the same
   */
      canReuseMarkup(markup, element) {
        let existingChecksum = element.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
        existingChecksum = existingChecksum && parseInt(existingChecksum, 10);
        const markupChecksum = adler32(markup);
        return markupChecksum === existingChecksum;
      },
    };

    module.exports = ReactMarkupChecksum;
  }, { "./adler32": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\adler32.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMount.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const DOMLazyTree = require("./DOMLazyTree");
      const DOMProperty = require("./DOMProperty");
      const React = require("react/lib/React");
      const ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
      const ReactCurrentOwner = require("react/lib/ReactCurrentOwner");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactDOMContainerInfo = require("./ReactDOMContainerInfo");
      const ReactDOMFeatureFlags = require("./ReactDOMFeatureFlags");
      const ReactFeatureFlags = require("./ReactFeatureFlags");
      const ReactInstanceMap = require("./ReactInstanceMap");
      const ReactInstrumentation = require("./ReactInstrumentation");
      const ReactMarkupChecksum = require("./ReactMarkupChecksum");
      const ReactReconciler = require("./ReactReconciler");
      const ReactUpdateQueue = require("./ReactUpdateQueue");
      const ReactUpdates = require("./ReactUpdates");

      const emptyObject = require("fbjs/lib/emptyObject");
      const instantiateReactComponent = require("./instantiateReactComponent");
      const invariant = require("fbjs/lib/invariant");
      const setInnerHTML = require("./setInnerHTML");
      const shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
      const warning = require("fbjs/lib/warning");

      const ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
      const ROOT_ATTR_NAME = DOMProperty.ROOT_ATTRIBUTE_NAME;

      const ELEMENT_NODE_TYPE = 1;
      const DOC_NODE_TYPE = 9;
      const DOCUMENT_FRAGMENT_NODE_TYPE = 11;

      const instancesByReactRootID = {};

/**
 * Finds the index of the first character
 * that's not common between the two given strings.
 *
 * @return {number} the index of the character where the strings diverge
 */
      function firstDifferenceIndex(string1, string2) {
        const minLen = Math.min(string1.length, string2.length);
        for (let i = 0; i < minLen; i++) {
          if (string1.charAt(i) !== string2.charAt(i)) {
            return i;
          }
        }
        return string1.length === string2.length ? -1 : minLen;
      }

/**
 * @param {DOMElement|DOMDocument} container DOM element that may contain
 * a React component
 * @return {?*} DOM element that may have the reactRoot ID, or null.
 */
      function getReactRootElementInContainer(container) {
        if (!container) {
          return null;
        }

        if (container.nodeType === DOC_NODE_TYPE) {
          return container.documentElement;
        }
        return container.firstChild;
      }

      function internalGetID(node) {
  // If node is something like a window, document, or text node, none of
  // which support attributes or a .getAttribute method, gracefully return
  // the empty string, as if the attribute were missing.
        return node.getAttribute && node.getAttribute(ATTR_NAME) || "";
      }

/**
 * Mounts this component and inserts it into the DOM.
 *
 * @param {ReactComponent} componentInstance The instance to mount.
 * @param {DOMElement} container DOM element to mount into.
 * @param {ReactReconcileTransaction} transaction
 * @param {boolean} shouldReuseMarkup If true, do not insert markup
 */
      function mountComponentIntoNode(wrapperInstance, container, transaction, shouldReuseMarkup, context) {
        let markerName;
        if (ReactFeatureFlags.logTopLevelRenders) {
          const wrappedElement = wrapperInstance._currentElement.props.child;
          const type = wrappedElement.type;
          markerName = `React mount: ${typeof type === "string" ? type : type.displayName || type.name}`;
          console.time(markerName);
        }

        const markup = ReactReconciler.mountComponent(wrapperInstance, transaction, null, ReactDOMContainerInfo(wrapperInstance, container), context, 0 /* parentDebugID */
  );

        if (markerName) {
          console.timeEnd(markerName);
        }

        wrapperInstance._renderedComponent._topLevelWrapper = wrapperInstance;
        ReactMount._mountImageIntoNode(markup, container, wrapperInstance, shouldReuseMarkup, transaction);
      }

/**
 * Batched mount.
 *
 * @param {ReactComponent} componentInstance The instance to mount.
 * @param {DOMElement} container DOM element to mount into.
 * @param {boolean} shouldReuseMarkup If true, do not insert markup
 */
      function batchedMountComponentIntoNode(componentInstance, container, shouldReuseMarkup, context) {
        const transaction = ReactUpdates.ReactReconcileTransaction.getPooled(
  /* useCreateElement */
  !shouldReuseMarkup && ReactDOMFeatureFlags.useCreateElement);
        transaction.perform(mountComponentIntoNode, null, componentInstance, container, transaction, shouldReuseMarkup, context);
        ReactUpdates.ReactReconcileTransaction.release(transaction);
      }

/**
 * Unmounts a component and removes it from the DOM.
 *
 * @param {ReactComponent} instance React component instance.
 * @param {DOMElement} container DOM element to unmount from.
 * @final
 * @internal
 * @see {ReactMount.unmountComponentAtNode}
 */
      function unmountComponentFromNode(instance, container, safely) {
        if (process.env.NODE_ENV !== "production") {
          ReactInstrumentation.debugTool.onBeginFlush();
        }
        ReactReconciler.unmountComponent(instance, safely);
        if (process.env.NODE_ENV !== "production") {
          ReactInstrumentation.debugTool.onEndFlush();
        }

        if (container.nodeType === DOC_NODE_TYPE) {
          container = container.documentElement;
        }

  // http://jsperf.com/emptying-a-node
        while (container.lastChild) {
          container.removeChild(container.lastChild);
        }
      }

/**
 * True if the supplied DOM node has a direct React-rendered child that is
 * not a React root element. Useful for warning in `render`,
 * `unmountComponentAtNode`, etc.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM element contains a direct child that was
 * rendered by React but is not a root element.
 * @internal
 */
      function hasNonRootReactChild(container) {
        const rootEl = getReactRootElementInContainer(container);
        if (rootEl) {
          const inst = ReactDOMComponentTree.getInstanceFromNode(rootEl);
          return !!(inst && inst._hostParent);
        }
      }

/**
 * True if the supplied DOM node is a React DOM element and
 * it has been rendered by another copy of React.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM has been rendered by another copy of React
 * @internal
 */
      function nodeIsRenderedByOtherInstance(container) {
        const rootEl = getReactRootElementInContainer(container);
        return !!(rootEl && isReactNode(rootEl) && !ReactDOMComponentTree.getInstanceFromNode(rootEl));
      }

/**
 * True if the supplied DOM node is a valid node element.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM is a valid DOM node.
 * @internal
 */
      function isValidContainer(node) {
        return !!(node && (node.nodeType === ELEMENT_NODE_TYPE || node.nodeType === DOC_NODE_TYPE || node.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE));
      }

/**
 * True if the supplied DOM node is a valid React node element.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM is a valid React DOM node.
 * @internal
 */
      function isReactNode(node) {
        return isValidContainer(node) && (node.hasAttribute(ROOT_ATTR_NAME) || node.hasAttribute(ATTR_NAME));
      }

      function getHostRootInstanceInContainer(container) {
        const rootEl = getReactRootElementInContainer(container);
        const prevHostInstance = rootEl && ReactDOMComponentTree.getInstanceFromNode(rootEl);
        return prevHostInstance && !prevHostInstance._hostParent ? prevHostInstance : null;
      }

      function getTopLevelWrapperInContainer(container) {
        const root = getHostRootInstanceInContainer(container);
        return root ? root._hostContainerInfo._topLevelWrapper : null;
      }

/**
 * Temporary (?) hack so that we can store all top-level pending updates on
 * composites instead of having to worry about different types of components
 * here.
 */
      let topLevelRootCounter = 1;
      const TopLevelWrapper = function() {
        this.rootID = topLevelRootCounter++;
      };
      TopLevelWrapper.prototype.isReactComponent = {};
      if (process.env.NODE_ENV !== "production") {
        TopLevelWrapper.displayName = "TopLevelWrapper";
      }
      TopLevelWrapper.prototype.render = function() {
        return this.props.child;
      };
      TopLevelWrapper.isReactTopLevelWrapper = true;

/**
 * Mounting is the process of initializing a React component by creating its
 * representative DOM elements and inserting them into a supplied `container`.
 * Any prior content inside `container` is destroyed in the process.
 *
 *   ReactMount.render(
 *     component,
 *     document.getElementById('container')
 *   );
 *
 *   <div id="container">                   <-- Supplied `container`.
 *     <div data-reactid=".3">              <-- Rendered reactRoot of React
 *       // ...                                 component.
 *     </div>
 *   </div>
 *
 * Inside of `container`, the first element rendered is the "reactRoot".
 */
      var ReactMount = {

        TopLevelWrapper,

  /**
   * Used by devtools. The keys are not important.
   */
        _instancesByReactRootID: instancesByReactRootID,

  /**
   * This is a hook provided to support rendering React components while
   * ensuring that the apparent scroll position of its `container` does not
   * change.
   *
   * @param {DOMElement} container The `container` being rendered into.
   * @param {function} renderCallback This must be called once to do the render.
   */
        scrollMonitor(container, renderCallback) {
          renderCallback();
        },

  /**
   * Take a component that's already mounted into the DOM and replace its props
   * @param {ReactComponent} prevComponent component instance already in the DOM
   * @param {ReactElement} nextElement component instance to render
   * @param {DOMElement} container container to render into
   * @param {?function} callback function triggered on completion
   */
        _updateRootComponent(prevComponent, nextElement, nextContext, container, callback) {
          ReactMount.scrollMonitor(container, () => {
            ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement, nextContext);
            if (callback) {
              ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
            }
          });

          return prevComponent;
        },

  /**
   * Render a new component into the DOM. Hooked by hooks!
   *
   * @param {ReactElement} nextElement element to render
   * @param {DOMElement} container container to render into
   * @param {boolean} shouldReuseMarkup if we should skip the markup insertion
   * @return {ReactComponent} nextComponent
   */
        _renderNewRootComponent(nextElement, container, shouldReuseMarkup, context) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case.
          process.env.NODE_ENV !== "production" ? warning(ReactCurrentOwner.current == null, "_renderNewRootComponent(): Render methods should be a pure function " + "of props and state; triggering nested component updates from " + "render is not allowed. If necessary, trigger nested updates in " + "componentDidUpdate. Check the render method of %s.", ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || "ReactCompositeComponent") : void 0;

          !isValidContainer(container) ? process.env.NODE_ENV !== "production" ? invariant(false, "_registerComponent(...): Target container is not a DOM element.") : _prodInvariant("37") : void 0;

          ReactBrowserEventEmitter.ensureScrollValueMonitoring();
          const componentInstance = instantiateReactComponent(nextElement, false);

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.

          ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, container, shouldReuseMarkup, context);

          const wrapperID = componentInstance._instance.rootID;
          instancesByReactRootID[wrapperID] = componentInstance;

          return componentInstance;
        },

  /**
   * Renders a React component into the DOM in the supplied `container`.
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactComponent} parentComponent The conceptual parent of this render tree.
   * @param {ReactElement} nextElement Component element to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
        renderSubtreeIntoContainer(parentComponent, nextElement, container, callback) {
          !(parentComponent != null && ReactInstanceMap.has(parentComponent)) ? process.env.NODE_ENV !== "production" ? invariant(false, "parentComponent must be a valid React Component") : _prodInvariant("38") : void 0;
          return ReactMount._renderSubtreeIntoContainer(parentComponent, nextElement, container, callback);
        },

        _renderSubtreeIntoContainer(parentComponent, nextElement, container, callback) {
          ReactUpdateQueue.validateCallback(callback, "ReactDOM.render");
          !React.isValidElement(nextElement) ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactDOM.render(): Invalid component element.%s", typeof nextElement === "string" ? " Instead of passing a string like 'div', pass " + "React.createElement('div') or <div />." : typeof nextElement === "function" ? " Instead of passing a class like Foo, pass " + "React.createElement(Foo) or <Foo />." :
    // Check if it quacks like an element
    nextElement != null && nextElement.props !== undefined ? " This may be caused by unintentionally loading two independent " + "copies of React." : "") : _prodInvariant("39", typeof nextElement === "string" ? " Instead of passing a string like 'div', pass " + "React.createElement('div') or <div />." : typeof nextElement === "function" ? " Instead of passing a class like Foo, pass " + "React.createElement(Foo) or <Foo />." : nextElement != null && nextElement.props !== undefined ? " This may be caused by unintentionally loading two independent " + "copies of React." : "") : void 0;

          process.env.NODE_ENV !== "production" ? warning(!container || !container.tagName || container.tagName.toUpperCase() !== "BODY", "render(): Rendering components directly into document.body is " + "discouraged, since its children are often manipulated by third-party " + "scripts and browser extensions. This may lead to subtle " + "reconciliation issues. Try rendering into a container element created " + "for your app.") : void 0;

          const nextWrappedElement = React.createElement(TopLevelWrapper, { child: nextElement });

          let nextContext;
          if (parentComponent) {
            const parentInst = ReactInstanceMap.get(parentComponent);
            nextContext = parentInst._processChildContext(parentInst._context);
          } else {
            nextContext = emptyObject;
          }

          const prevComponent = getTopLevelWrapperInContainer(container);

          if (prevComponent) {
            const prevWrappedElement = prevComponent._currentElement;
            const prevElement = prevWrappedElement.props.child;
            if (shouldUpdateReactComponent(prevElement, nextElement)) {
              const publicInst = prevComponent._renderedComponent.getPublicInstance();
              const updatedCallback = callback && function() {
                callback.call(publicInst);
              };
              ReactMount._updateRootComponent(prevComponent, nextWrappedElement, nextContext, container, updatedCallback);
              return publicInst;
            }
            ReactMount.unmountComponentAtNode(container);
          }

          const reactRootElement = getReactRootElementInContainer(container);
          const containerHasReactMarkup = reactRootElement && !!internalGetID(reactRootElement);
          const containerHasNonRootReactChild = hasNonRootReactChild(container);

          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(!containerHasNonRootReactChild, "render(...): Replacing React-rendered children with a new root " + "component. If you intended to update the children of this node, " + "you should instead have the existing children update their state " + "and render the new components instead of calling ReactDOM.render.") : void 0;

            if (!containerHasReactMarkup || reactRootElement.nextSibling) {
              let rootElementSibling = reactRootElement;
              while (rootElementSibling) {
                if (internalGetID(rootElementSibling)) {
                process.env.NODE_ENV !== "production" ? warning(false, "render(): Target node has markup rendered by React, but there " + "are unrelated nodes as well. This is most commonly caused by " + "white-space inserted around server-rendered markup.") : void 0;
                break;
              }
                rootElementSibling = rootElementSibling.nextSibling;
              }
            }
          }

          const shouldReuseMarkup = containerHasReactMarkup && !prevComponent && !containerHasNonRootReactChild;
          const component = ReactMount._renderNewRootComponent(nextWrappedElement, container, shouldReuseMarkup, nextContext)._renderedComponent.getPublicInstance();
          if (callback) {
            callback.call(component);
          }
          return component;
        },

  /**
   * Renders a React component into the DOM in the supplied `container`.
   * See https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
   *
   * If the React component was previously rendered into `container`, this will
   * perform an update on it and only mutate the DOM as necessary to reflect the
   * latest React component.
   *
   * @param {ReactElement} nextElement Component element to render.
   * @param {DOMElement} container DOM element to render into.
   * @param {?function} callback function triggered on completion
   * @return {ReactComponent} Component instance rendered in `container`.
   */
        render(nextElement, container, callback) {
          return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
        },

  /**
   * Unmounts and destroys the React component rendered in the `container`.
   * See https://facebook.github.io/react/docs/top-level-api.html#reactdom.unmountcomponentatnode
   *
   * @param {DOMElement} container DOM element containing a React component.
   * @return {boolean} True if a component was found in and unmounted from
   *                   `container`
   */
        unmountComponentAtNode(container) {
    // Various parts of our code (such as ReactCompositeComponent's
    // _renderValidatedComponent) assume that calls to render aren't nested;
    // verify that that's the case. (Strictly speaking, unmounting won't cause a
    // render but we still don't expect to be in a render call here.)
          process.env.NODE_ENV !== "production" ? warning(ReactCurrentOwner.current == null, "unmountComponentAtNode(): Render methods should be a pure function " + "of props and state; triggering nested component updates from render " + "is not allowed. If necessary, trigger nested updates in " + "componentDidUpdate. Check the render method of %s.", ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || "ReactCompositeComponent") : void 0;

          !isValidContainer(container) ? process.env.NODE_ENV !== "production" ? invariant(false, "unmountComponentAtNode(...): Target container is not a DOM element.") : _prodInvariant("40") : void 0;

          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(!nodeIsRenderedByOtherInstance(container), "unmountComponentAtNode(): The node you're attempting to unmount " + "was rendered by another copy of React.") : void 0;
          }

          const prevComponent = getTopLevelWrapperInContainer(container);
          if (!prevComponent) {
      // Check if the node being unmounted was rendered by React, but isn't a
      // root node.
            const containerHasNonRootReactChild = hasNonRootReactChild(container);

      // Check if the container itself is a React root node.
            const isContainerReactRoot = container.nodeType === 1 && container.hasAttribute(ROOT_ATTR_NAME);

            if (process.env.NODE_ENV !== "production") {
              process.env.NODE_ENV !== "production" ? warning(!containerHasNonRootReactChild, "unmountComponentAtNode(): The node you're attempting to unmount " + "was rendered by React and is not a top-level container. %s", isContainerReactRoot ? "You may have accidentally passed in a React root node instead " + "of its container." : "Instead, have the parent component update its state and " + "rerender in order to remove this component.") : void 0;
            }

            return false;
          }
          delete instancesByReactRootID[prevComponent._instance.rootID];
          ReactUpdates.batchedUpdates(unmountComponentFromNode, prevComponent, container, false);
          return true;
        },

        _mountImageIntoNode(markup, container, instance, shouldReuseMarkup, transaction) {
          !isValidContainer(container) ? process.env.NODE_ENV !== "production" ? invariant(false, "mountComponentIntoNode(...): Target container is not valid.") : _prodInvariant("41") : void 0;

          if (shouldReuseMarkup) {
            const rootElement = getReactRootElementInContainer(container);
            if (ReactMarkupChecksum.canReuseMarkup(markup, rootElement)) {
              ReactDOMComponentTree.precacheNode(instance, rootElement);
              return;
            }
            const checksum = rootElement.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
            rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);

            const rootMarkup = rootElement.outerHTML;
            rootElement.setAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME, checksum);

            let normalizedMarkup = markup;
            if (process.env.NODE_ENV !== "production") {
          // because rootMarkup is retrieved from the DOM, various normalizations
          // will have occurred which will not be present in `markup`. Here,
          // insert markup into a <div> or <iframe> depending on the container
          // type to perform the same normalizations before comparing.
              let normalizer;
              if (container.nodeType === ELEMENT_NODE_TYPE) {
                normalizer = document.createElement("div");
                normalizer.innerHTML = markup;
                normalizedMarkup = normalizer.innerHTML;
              } else {
                normalizer = document.createElement("iframe");
                document.body.appendChild(normalizer);
                normalizer.contentDocument.write(markup);
                normalizedMarkup = normalizer.contentDocument.documentElement.outerHTML;
                document.body.removeChild(normalizer);
              }
            }

            const diffIndex = firstDifferenceIndex(normalizedMarkup, rootMarkup);
            const difference = ` (client) ${normalizedMarkup.substring(diffIndex - 20, diffIndex + 20)}\n (server) ${rootMarkup.substring(diffIndex - 20, diffIndex + 20)}`;

            !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== "production" ? invariant(false, "You're trying to render a component to the document using server rendering but the checksum was invalid. This usually means you rendered a different component type or props on the client from the one on the server, or your render() methods are impure. React cannot handle this case due to cross-browser quirks by rendering at the document root. You should look for environment dependent code in your components and ensure the props are the same client and server side:\n%s", difference) : _prodInvariant("42", difference) : void 0;

            if (process.env.NODE_ENV !== "production") {
              process.env.NODE_ENV !== "production" ? warning(false, "React attempted to reuse markup in a container but the " + "checksum was invalid. This generally means that you are " + "using server rendering and the markup generated on the " + "server was not what the client was expecting. React injected " + "new markup to compensate which works but you have lost many " + "of the benefits of server rendering. Instead, figure out " + "why the markup being generated is different on the client " + "or server:\n%s", difference) : void 0;
            }
          }

          !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== "production" ? invariant(false, "You're trying to render a component to the document but you didn't use server rendering. We can't do this without using server rendering due to cross-browser quirks. See ReactDOMServer.renderToString() for server rendering.") : _prodInvariant("43") : void 0;

          if (transaction.useCreateElement) {
            while (container.lastChild) {
              container.removeChild(container.lastChild);
            }
            DOMLazyTree.insertTreeBefore(container, markup, null);
          } else {
            setInnerHTML(container, markup);
            ReactDOMComponentTree.precacheNode(instance, container.firstChild);
          }

          if (process.env.NODE_ENV !== "production") {
            const hostNode = ReactDOMComponentTree.getInstanceFromNode(container.firstChild);
            if (hostNode._debugID !== 0) {
              ReactInstrumentation.debugTool.onHostOperation({
                instanceID: hostNode._debugID,
                type: "mount",
                payload: markup.toString(),
              });
            }
          }
        },
      };

      module.exports = ReactMount;
    }).call(this, require("_process"));
  }, { "./DOMLazyTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMLazyTree.js", "./DOMProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMProperty.js", "./ReactBrowserEventEmitter": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactBrowserEventEmitter.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactDOMContainerInfo": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMContainerInfo.js", "./ReactDOMFeatureFlags": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMFeatureFlags.js", "./ReactFeatureFlags": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactFeatureFlags.js", "./ReactInstanceMap": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstanceMap.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactMarkupChecksum": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMarkupChecksum.js", "./ReactReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js", "./ReactUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdateQueue.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./instantiateReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\instantiateReactComponent.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "./setInnerHTML": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setInnerHTML.js", "./shouldUpdateReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\shouldUpdateReactComponent.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyObject": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyObject.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/React": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js", "react/lib/ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMultiChild.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactComponentEnvironment = require("./ReactComponentEnvironment");
      const ReactInstanceMap = require("./ReactInstanceMap");
      const ReactInstrumentation = require("./ReactInstrumentation");

      const ReactCurrentOwner = require("react/lib/ReactCurrentOwner");
      const ReactReconciler = require("./ReactReconciler");
      const ReactChildReconciler = require("./ReactChildReconciler");

      const emptyFunction = require("fbjs/lib/emptyFunction");
      const flattenChildren = require("./flattenChildren");
      const invariant = require("fbjs/lib/invariant");

/**
 * Make an update for markup to be rendered and inserted at a supplied index.
 *
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
      function makeInsertMarkup(markup, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
        return {
          type: "INSERT_MARKUP",
          content: markup,
          fromIndex: null,
          fromNode: null,
          toIndex,
          afterNode,
        };
      }

/**
 * Make an update for moving an existing element to another index.
 *
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
      function makeMove(child, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
        return {
          type: "MOVE_EXISTING",
          content: null,
          fromIndex: child._mountIndex,
          fromNode: ReactReconciler.getHostNode(child),
          toIndex,
          afterNode,
        };
      }

/**
 * Make an update for removing an element at an index.
 *
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
      function makeRemove(child, node) {
  // NOTE: Null values reduce hidden classes.
        return {
          type: "REMOVE_NODE",
          content: null,
          fromIndex: child._mountIndex,
          fromNode: node,
          toIndex: null,
          afterNode: null,
        };
      }

/**
 * Make an update for setting the markup of a node.
 *
 * @param {string} markup Markup that renders into an element.
 * @private
 */
      function makeSetMarkup(markup) {
  // NOTE: Null values reduce hidden classes.
        return {
          type: "SET_MARKUP",
          content: markup,
          fromIndex: null,
          fromNode: null,
          toIndex: null,
          afterNode: null,
        };
      }

/**
 * Make an update for setting the text content.
 *
 * @param {string} textContent Text content to set.
 * @private
 */
      function makeTextContent(textContent) {
  // NOTE: Null values reduce hidden classes.
        return {
          type: "TEXT_CONTENT",
          content: textContent,
          fromIndex: null,
          fromNode: null,
          toIndex: null,
          afterNode: null,
        };
      }

/**
 * Push an update, if any, onto the queue. Creates a new queue if none is
 * passed and always returns the queue. Mutative.
 */
      function enqueue(queue, update) {
        if (update) {
          queue = queue || [];
          queue.push(update);
        }
        return queue;
      }

/**
 * Processes any enqueued updates.
 *
 * @private
 */
      function processQueue(inst, updateQueue) {
        ReactComponentEnvironment.processChildrenUpdates(inst, updateQueue);
      }

      let setChildrenForInstrumentation = emptyFunction;
      if (process.env.NODE_ENV !== "production") {
        var getDebugID = function(inst) {
          if (!inst._debugID) {
      // Check for ART-like instances. TODO: This is silly/gross.
            let internal;
            if (internal = ReactInstanceMap.get(inst)) {
              inst = internal;
            }
          }
          return inst._debugID;
        };
        setChildrenForInstrumentation = function(children) {
          const debugID = getDebugID(this);
    // TODO: React Native empty components are also multichild.
    // This means they still get into this method but don't have _debugID.
          if (debugID !== 0) {
            ReactInstrumentation.debugTool.onSetChildren(debugID, children ? Object.keys(children).map((key) => {
              return children[key]._debugID;
            }) : []);
          }
        };
      }

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * @class ReactMultiChild
 * @internal
 */
      const ReactMultiChild = {

  /**
   * Provides common functionality for components that must reconcile multiple
   * children. This is used by `ReactDOMComponent` to mount, update, and
   * unmount child components.
   *
   * @lends {ReactMultiChild.prototype}
   */
        Mixin: {

          _reconcilerInstantiateChildren(nestedChildren, transaction, context) {
            if (process.env.NODE_ENV !== "production") {
              const selfDebugID = getDebugID(this);
              if (this._currentElement) {
                try {
                ReactCurrentOwner.current = this._currentElement._owner;
                return ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context, selfDebugID);
              } finally {
                ReactCurrentOwner.current = null;
              }
              }
            }
            return ReactChildReconciler.instantiateChildren(nestedChildren, transaction, context);
          },

          _reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, mountImages, removedNodes, transaction, context) {
            let nextChildren;
            let selfDebugID = 0;
            if (process.env.NODE_ENV !== "production") {
              selfDebugID = getDebugID(this);
              if (this._currentElement) {
                try {
                ReactCurrentOwner.current = this._currentElement._owner;
                nextChildren = flattenChildren(nextNestedChildrenElements, selfDebugID);
              } finally {
                ReactCurrentOwner.current = null;
              }
                ReactChildReconciler.updateChildren(prevChildren, nextChildren, mountImages, removedNodes, transaction, this, this._hostContainerInfo, context, selfDebugID);
                return nextChildren;
              }
            }
            nextChildren = flattenChildren(nextNestedChildrenElements, selfDebugID);
            ReactChildReconciler.updateChildren(prevChildren, nextChildren, mountImages, removedNodes, transaction, this, this._hostContainerInfo, context, selfDebugID);
            return nextChildren;
          },

    /**
     * Generates a "mount image" for each of the supplied children. In the case
     * of `ReactDOMComponent`, a mount image is a string of markup.
     *
     * @param {?object} nestedChildren Nested child maps.
     * @return {array} An array of mounted representations.
     * @internal
     */
          mountChildren(nestedChildren, transaction, context) {
            const children = this._reconcilerInstantiateChildren(nestedChildren, transaction, context);
            this._renderedChildren = children;

            const mountImages = [];
            let index = 0;
            for (const name in children) {
              if (children.hasOwnProperty(name)) {
                const child = children[name];
                let selfDebugID = 0;
                if (process.env.NODE_ENV !== "production") {
                selfDebugID = getDebugID(this);
              }
                const mountImage = ReactReconciler.mountComponent(child, transaction, this, this._hostContainerInfo, context, selfDebugID);
                child._mountIndex = index++;
                mountImages.push(mountImage);
              }
            }

            if (process.env.NODE_ENV !== "production") {
              setChildrenForInstrumentation.call(this, children);
            }

            return mountImages;
          },

    /**
     * Replaces any rendered children with a text content string.
     *
     * @param {string} nextContent String of content.
     * @internal
     */
          updateTextContent(nextContent) {
            const prevChildren = this._renderedChildren;
      // Remove any rendered children.
            ReactChildReconciler.unmountChildren(prevChildren, false);
            for (const name in prevChildren) {
              if (prevChildren.hasOwnProperty(name)) {
                !false ? process.env.NODE_ENV !== "production" ? invariant(false, "updateTextContent called on non-empty component.") : _prodInvariant("118") : void 0;
              }
            }
      // Set new text content.
            const updates = [makeTextContent(nextContent)];
            processQueue(this, updates);
          },

    /**
     * Replaces any rendered children with a markup string.
     *
     * @param {string} nextMarkup String of markup.
     * @internal
     */
          updateMarkup(nextMarkup) {
            const prevChildren = this._renderedChildren;
      // Remove any rendered children.
            ReactChildReconciler.unmountChildren(prevChildren, false);
            for (const name in prevChildren) {
              if (prevChildren.hasOwnProperty(name)) {
                !false ? process.env.NODE_ENV !== "production" ? invariant(false, "updateTextContent called on non-empty component.") : _prodInvariant("118") : void 0;
              }
            }
            const updates = [makeSetMarkup(nextMarkup)];
            processQueue(this, updates);
          },

    /**
     * Updates the rendered children with new children.
     *
     * @param {?object} nextNestedChildrenElements Nested child element maps.
     * @param {ReactReconcileTransaction} transaction
     * @internal
     */
          updateChildren(nextNestedChildrenElements, transaction, context) {
      // Hook used by React ART
            this._updateChildren(nextNestedChildrenElements, transaction, context);
          },

    /**
     * @param {?object} nextNestedChildrenElements Nested child element maps.
     * @param {ReactReconcileTransaction} transaction
     * @final
     * @protected
     */
          _updateChildren(nextNestedChildrenElements, transaction, context) {
            const prevChildren = this._renderedChildren;
            const removedNodes = {};
            const mountImages = [];
            const nextChildren = this._reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, mountImages, removedNodes, transaction, context);
            if (!nextChildren && !prevChildren) {
              return;
            }
            let updates = null;
            let name;
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
            let nextIndex = 0;
            let lastIndex = 0;
      // `nextMountIndex` will increment for each newly mounted child.
            let nextMountIndex = 0;
            let lastPlacedNode = null;
            for (name in nextChildren) {
              if (!nextChildren.hasOwnProperty(name)) {
                continue;
              }
              const prevChild = prevChildren && prevChildren[name];
              const nextChild = nextChildren[name];
              if (prevChild === nextChild) {
                updates = enqueue(updates, this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex));
                lastIndex = Math.max(prevChild._mountIndex, lastIndex);
                prevChild._mountIndex = nextIndex;
              } else {
                if (prevChild) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
                lastIndex = Math.max(prevChild._mountIndex, lastIndex);
            // The `removedNodes` loop below will actually remove the child.
              }
          // The child must be instantiated before it's mounted.
                updates = enqueue(updates, this._mountChildAtIndex(nextChild, mountImages[nextMountIndex], lastPlacedNode, nextIndex, transaction, context));
                nextMountIndex++;
              }
              nextIndex++;
              lastPlacedNode = ReactReconciler.getHostNode(nextChild);
            }
      // Remove children that are no longer present.
            for (name in removedNodes) {
              if (removedNodes.hasOwnProperty(name)) {
                updates = enqueue(updates, this._unmountChild(prevChildren[name], removedNodes[name]));
              }
            }
            if (updates) {
              processQueue(this, updates);
            }
            this._renderedChildren = nextChildren;

            if (process.env.NODE_ENV !== "production") {
              setChildrenForInstrumentation.call(this, nextChildren);
            }
          },

    /**
     * Unmounts all rendered children. This should be used to clean up children
     * when this component is unmounted. It does not actually perform any
     * backend operations.
     *
     * @internal
     */
          unmountChildren(safely) {
            const renderedChildren = this._renderedChildren;
            ReactChildReconciler.unmountChildren(renderedChildren, safely);
            this._renderedChildren = null;
          },

    /**
     * Moves a child component to the supplied index.
     *
     * @param {ReactComponent} child Component to move.
     * @param {number} toIndex Destination index of the element.
     * @param {number} lastIndex Last index visited of the siblings of `child`.
     * @protected
     */
          moveChild(child, afterNode, toIndex, lastIndex) {
      // If the index of `child` is less than `lastIndex`, then it needs to
      // be moved. Otherwise, we do not need to move it because a child will be
      // inserted or moved before `child`.
            if (child._mountIndex < lastIndex) {
              return makeMove(child, afterNode, toIndex);
            }
          },

    /**
     * Creates a child component.
     *
     * @param {ReactComponent} child Component to create.
     * @param {string} mountImage Markup to insert.
     * @protected
     */
          createChild(child, afterNode, mountImage) {
            return makeInsertMarkup(mountImage, afterNode, child._mountIndex);
          },

    /**
     * Removes a child component.
     *
     * @param {ReactComponent} child Child to remove.
     * @protected
     */
          removeChild(child, node) {
            return makeRemove(child, node);
          },

    /**
     * Mounts a child with the supplied name.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to mount.
     * @param {string} name Name of the child.
     * @param {number} index Index at which to insert the child.
     * @param {ReactReconcileTransaction} transaction
     * @private
     */
          _mountChildAtIndex(child, mountImage, afterNode, index, transaction, context) {
            child._mountIndex = index;
            return this.createChild(child, afterNode, mountImage);
          },

    /**
     * Unmounts a rendered child.
     *
     * NOTE: This is part of `updateChildren` and is here for readability.
     *
     * @param {ReactComponent} child Component to unmount.
     * @private
     */
          _unmountChild(child, node) {
            const update = this.removeChild(child, node);
            child._mountIndex = null;
            return update;
          },

        },

      };

      module.exports = ReactMultiChild;
    }).call(this, require("_process"));
  }, { "./ReactChildReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactChildReconciler.js", "./ReactComponentEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactComponentEnvironment.js", "./ReactInstanceMap": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstanceMap.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js", "./flattenChildren": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\flattenChildren.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "react/lib/ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactNodeTypes.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const React = require("react/lib/React");

      const invariant = require("fbjs/lib/invariant");

      var ReactNodeTypes = {
        HOST: 0,
        COMPOSITE: 1,
        EMPTY: 2,

        getType(node) {
          if (node === null || node === false) {
            return ReactNodeTypes.EMPTY;
          } else if (React.isValidElement(node)) {
            if (typeof node.type === "function") {
            return ReactNodeTypes.COMPOSITE;
          }
            return ReactNodeTypes.HOST;
          }
          !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Unexpected node: %s", node) : _prodInvariant("26", node) : void 0;
        },
      };

      module.exports = ReactNodeTypes;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "react/lib/React": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactOwner.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

/**
 * @param {?object} object
 * @return {boolean} True if `object` is a valid owner.
 * @final
 */
      function isValidOwner(object) {
        return !!(object && typeof object.attachRef === "function" && typeof object.detachRef === "function");
      }

/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
      const ReactOwner = {
  /**
   * Adds a component by ref to an owner component.
   *
   * @param {ReactComponent} component Component to reference.
   * @param {string} ref Name by which to refer to the component.
   * @param {ReactOwner} owner Component on which to record the ref.
   * @final
   * @internal
   */
        addComponentAsRefTo(component, ref, owner) {
          !isValidOwner(owner) ? process.env.NODE_ENV !== "production" ? invariant(false, "addComponentAsRefTo(...): Only a ReactOwner can have refs. You might be adding a ref to a component that was not created inside a component's `render` method, or you have multiple copies of React loaded (details: https://fb.me/react-refs-must-have-owner).") : _prodInvariant("119") : void 0;
          owner.attachRef(ref, component);
        },

  /**
   * Removes a component by ref from an owner component.
   *
   * @param {ReactComponent} component Component to dereference.
   * @param {string} ref Name of the ref to remove.
   * @param {ReactOwner} owner Component on which the ref is recorded.
   * @final
   * @internal
   */
        removeComponentAsRefFrom(component, ref, owner) {
          !isValidOwner(owner) ? process.env.NODE_ENV !== "production" ? invariant(false, "removeComponentAsRefFrom(...): Only a ReactOwner can have refs. You might be removing a ref to a component that was not created inside a component's `render` method, or you have multiple copies of React loaded (details: https://fb.me/react-refs-must-have-owner).") : _prodInvariant("120") : void 0;
          const ownerPublicInstance = owner.getPublicInstance();
    // Check that `component`'s owner is still alive and that `component` is still the current ref
    // because we do not want to detach the ref if another component stole it.
          if (ownerPublicInstance && ownerPublicInstance.refs[ref] === component.getPublicInstance()) {
            owner.detachRef(ref);
          }
        },

      };

      module.exports = ReactOwner;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactPropTypeLocationNames.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      let ReactPropTypeLocationNames = {};

      if (process.env.NODE_ENV !== "production") {
        ReactPropTypeLocationNames = {
          prop: "prop",
          context: "context",
          childContext: "child context",
        };
      }

      module.exports = ReactPropTypeLocationNames;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactPropTypesSecret.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


    const ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";

    module.exports = ReactPropTypesSecret;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconcileTransaction.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const CallbackQueue = require("./CallbackQueue");
      const PooledClass = require("./PooledClass");
      const ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
      const ReactInputSelection = require("./ReactInputSelection");
      const ReactInstrumentation = require("./ReactInstrumentation");
      const Transaction = require("./Transaction");
      const ReactUpdateQueue = require("./ReactUpdateQueue");

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
      const SELECTION_RESTORATION = {
  /**
   * @return {Selection} Selection information.
   */
        initialize: ReactInputSelection.getSelectionInformation,
  /**
   * @param {Selection} sel Selection information returned from `initialize`.
   */
        close: ReactInputSelection.restoreSelection,
      };

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
      const EVENT_SUPPRESSION = {
  /**
   * @return {boolean} The enabled status of `ReactBrowserEventEmitter` before
   * the reconciliation.
   */
        initialize() {
          const currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
          ReactBrowserEventEmitter.setEnabled(false);
          return currentlyEnabled;
        },

  /**
   * @param {boolean} previouslyEnabled Enabled status of
   *   `ReactBrowserEventEmitter` before the reconciliation occurred. `close`
   *   restores the previous value.
   */
        close(previouslyEnabled) {
          ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
        },
      };

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the transaction.
 */
      const ON_DOM_READY_QUEUEING = {
  /**
   * Initializes the internal `onDOMReady` queue.
   */
        initialize() {
          this.reactMountReady.reset();
        },

  /**
   * After DOM is flushed, invoke all registered `onDOMReady` callbacks.
   */
        close() {
          this.reactMountReady.notifyAll();
        },
      };

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
      const TRANSACTION_WRAPPERS = [SELECTION_RESTORATION, EVENT_SUPPRESSION, ON_DOM_READY_QUEUEING];

      if (process.env.NODE_ENV !== "production") {
        TRANSACTION_WRAPPERS.push({
          initialize: ReactInstrumentation.debugTool.onBeginFlush,
          close: ReactInstrumentation.debugTool.onEndFlush,
        });
      }

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
      function ReactReconcileTransaction(useCreateElement) {
        this.reinitializeTransaction();
  // Only server-side rendering really needs this option (see
  // `ReactServerRendering`), but server-side uses
  // `ReactServerRenderingTransaction` instead. This option is here so that it's
  // accessible and defaults to false when `ReactDOMComponent` and
  // `ReactDOMTextComponent` checks it in `mountComponent`.`
        this.renderToStaticMarkup = false;
        this.reactMountReady = CallbackQueue.getPooled(null);
        this.useCreateElement = useCreateElement;
      }

      const Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap procedures.
   *   TODO: convert to array<TransactionWrapper>
   */
        getTransactionWrappers() {
          return TRANSACTION_WRAPPERS;
        },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
        getReactMountReady() {
          return this.reactMountReady;
        },

  /**
   * @return {object} The queue to collect React async events.
   */
        getUpdateQueue() {
          return ReactUpdateQueue;
        },

  /**
   * Save current transaction state -- if the return value from this method is
   * passed to `rollback`, the transaction will be reset to that state.
   */
        checkpoint() {
    // reactMountReady is the our only stateful wrapper
          return this.reactMountReady.checkpoint();
        },

        rollback(checkpoint) {
          this.reactMountReady.rollback(checkpoint);
        },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be reused.
   */
        destructor() {
          CallbackQueue.release(this.reactMountReady);
          this.reactMountReady = null;
        },
      };

      _assign(ReactReconcileTransaction.prototype, Transaction, Mixin);

      PooledClass.addPoolingTo(ReactReconcileTransaction);

      module.exports = ReactReconcileTransaction;
    }).call(this, require("_process"));
  }, { "./CallbackQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CallbackQueue.js", "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "./ReactBrowserEventEmitter": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactBrowserEventEmitter.js", "./ReactInputSelection": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInputSelection.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdateQueue.js", "./Transaction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Transaction.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const ReactRef = require("./ReactRef");
      const ReactInstrumentation = require("./ReactInstrumentation");

      const warning = require("fbjs/lib/warning");

/**
 * Helper to call ReactRef.attachRefs with this composite component, split out
 * to avoid allocations in the transaction mount-ready queue.
 */
      function attachRefs() {
        ReactRef.attachRefs(this, this._currentElement);
      }

      const ReactReconciler = {

  /**
   * Initializes the component, renders markup, and registers event listeners.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
   * @param {?object} the containing host component instance
   * @param {?object} info about the host container
   * @return {?string} Rendered markup to be inserted into the DOM.
   * @final
   * @internal
   */
        mountComponent(internalInstance, transaction, hostParent, hostContainerInfo, context, parentDebugID // 0 in production and for roots
  ) {
          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onBeforeMountComponent(internalInstance._debugID, internalInstance._currentElement, parentDebugID);
            }
          }
          const markup = internalInstance.mountComponent(transaction, hostParent, hostContainerInfo, context, parentDebugID);
          if (internalInstance._currentElement && internalInstance._currentElement.ref != null) {
            transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
          }
          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onMountComponent(internalInstance._debugID);
            }
          }
          return markup;
        },

  /**
   * Returns a value that can be passed to
   * ReactComponentEnvironment.replaceNodeWithMarkup.
   */
        getHostNode(internalInstance) {
          return internalInstance.getHostNode();
        },

  /**
   * Releases any resources allocated by `mountComponent`.
   *
   * @final
   * @internal
   */
        unmountComponent(internalInstance, safely) {
          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onBeforeUnmountComponent(internalInstance._debugID);
            }
          }
          ReactRef.detachRefs(internalInstance, internalInstance._currentElement);
          internalInstance.unmountComponent(safely);
          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onUnmountComponent(internalInstance._debugID);
            }
          }
        },

  /**
   * Update a component using a new element.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactElement} nextElement
   * @param {ReactReconcileTransaction} transaction
   * @param {object} context
   * @internal
   */
        receiveComponent(internalInstance, nextElement, transaction, context) {
          const prevElement = internalInstance._currentElement;

          if (nextElement === prevElement && context === internalInstance._context) {
      // Since elements are immutable after the owner is rendered,
      // we can do a cheap identity compare here to determine if this is a
      // superfluous reconcile. It's possible for state to be mutable but such
      // change should trigger an update of the owner which would recreate
      // the element. We explicitly check for the existence of an owner since
      // it's possible for an element created outside a composite to be
      // deeply mutated and reused.

      // TODO: Bailing out early is just a perf optimization right?
      // TODO: Removing the return statement should affect correctness?
            return;
          }

          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onBeforeUpdateComponent(internalInstance._debugID, nextElement);
            }
          }

          const refsChanged = ReactRef.shouldUpdateRefs(prevElement, nextElement);

          if (refsChanged) {
            ReactRef.detachRefs(internalInstance, prevElement);
          }

          internalInstance.receiveComponent(nextElement, transaction, context);

          if (refsChanged && internalInstance._currentElement && internalInstance._currentElement.ref != null) {
            transaction.getReactMountReady().enqueue(attachRefs, internalInstance);
          }

          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onUpdateComponent(internalInstance._debugID);
            }
          }
        },

  /**
   * Flush any dirty changes in a component.
   *
   * @param {ReactComponent} internalInstance
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
        performUpdateIfNecessary(internalInstance, transaction, updateBatchNumber) {
          if (internalInstance._updateBatchNumber !== updateBatchNumber) {
      // The component's enqueued batch number should always be the current
      // batch or the following one.
            process.env.NODE_ENV !== "production" ? warning(internalInstance._updateBatchNumber == null || internalInstance._updateBatchNumber === updateBatchNumber + 1, "performUpdateIfNecessary: Unexpected batch number (current %s, " + "pending %s)", updateBatchNumber, internalInstance._updateBatchNumber) : void 0;
            return;
          }
          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onBeforeUpdateComponent(internalInstance._debugID, internalInstance._currentElement);
            }
          }
          internalInstance.performUpdateIfNecessary(transaction);
          if (process.env.NODE_ENV !== "production") {
            if (internalInstance._debugID !== 0) {
              ReactInstrumentation.debugTool.onUpdateComponent(internalInstance._debugID);
            }
          }
        },

      };

      module.exports = ReactReconciler;
    }).call(this, require("_process"));
  }, { "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactRef": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactRef.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactRef.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


    const ReactOwner = require("./ReactOwner");

    const ReactRef = {};

    function attachRef(ref, component, owner) {
      if (typeof ref === "function") {
        ref(component.getPublicInstance());
      } else {
    // Legacy ref
        ReactOwner.addComponentAsRefTo(component, ref, owner);
      }
    }

    function detachRef(ref, component, owner) {
      if (typeof ref === "function") {
        ref(null);
      } else {
    // Legacy ref
        ReactOwner.removeComponentAsRefFrom(component, ref, owner);
      }
    }

    ReactRef.attachRefs = function(instance, element) {
      if (element === null || typeof element !== "object") {
        return;
      }
      const ref = element.ref;
      if (ref != null) {
        attachRef(ref, instance, element._owner);
      }
    };

    ReactRef.shouldUpdateRefs = function(prevElement, nextElement) {
  // If either the owner or a `ref` has changed, make sure the newest owner
  // has stored a reference to `this`, and the previous owner (if different)
  // has forgotten the reference to `this`. We use the element instead
  // of the public this.props because the post processing cannot determine
  // a ref. The ref conceptually lives on the element.

  // TODO: Should this even be possible? The owner cannot change because
  // it's forbidden by shouldUpdateReactComponent. The ref can change
  // if you swap the keys of but not the refs. Reconsider where this check
  // is made. It probably belongs where the key checking and
  // instantiateReactComponent is done.

      let prevRef = null;
      let prevOwner = null;
      if (prevElement !== null && typeof prevElement === "object") {
        prevRef = prevElement.ref;
        prevOwner = prevElement._owner;
      }

      let nextRef = null;
      let nextOwner = null;
      if (nextElement !== null && typeof nextElement === "object") {
        nextRef = nextElement.ref;
        nextOwner = nextElement._owner;
      }

      return prevRef !== nextRef ||
  // If owner changes but we have an unchanged function ref, don't update refs
  typeof nextRef === "string" && nextOwner !== prevOwner;
    };

    ReactRef.detachRefs = function(instance, element) {
      if (element === null || typeof element !== "object") {
        return;
      }
      const ref = element.ref;
      if (ref != null) {
        detachRef(ref, instance, element._owner);
      }
    };

    module.exports = ReactRef;
  }, { "./ReactOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactServerRenderingTransaction.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const PooledClass = require("./PooledClass");
      const Transaction = require("./Transaction");
      const ReactInstrumentation = require("./ReactInstrumentation");
      const ReactServerUpdateQueue = require("./ReactServerUpdateQueue");

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
      const TRANSACTION_WRAPPERS = [];

      if (process.env.NODE_ENV !== "production") {
        TRANSACTION_WRAPPERS.push({
          initialize: ReactInstrumentation.debugTool.onBeginFlush,
          close: ReactInstrumentation.debugTool.onEndFlush,
        });
      }

      const noopCallbackQueue = {
        enqueue() {},
      };

/**
 * @class ReactServerRenderingTransaction
 * @param {boolean} renderToStaticMarkup
 */
      function ReactServerRenderingTransaction(renderToStaticMarkup) {
        this.reinitializeTransaction();
        this.renderToStaticMarkup = renderToStaticMarkup;
        this.useCreateElement = false;
        this.updateQueue = new ReactServerUpdateQueue(this);
      }

      const Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array} Empty list of operation wrap procedures.
   */
        getTransactionWrappers() {
          return TRANSACTION_WRAPPERS;
        },

  /**
   * @return {object} The queue to collect `onDOMReady` callbacks with.
   */
        getReactMountReady() {
          return noopCallbackQueue;
        },

  /**
   * @return {object} The queue to collect React async events.
   */
        getUpdateQueue() {
          return this.updateQueue;
        },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be reused.
   */
        destructor() {},

        checkpoint() {},

        rollback() {},
      };

      _assign(ReactServerRenderingTransaction.prototype, Transaction, Mixin);

      PooledClass.addPoolingTo(ReactServerRenderingTransaction);

      module.exports = ReactServerRenderingTransaction;
    }).call(this, require("_process"));
  }, { "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactServerUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactServerUpdateQueue.js", "./Transaction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Transaction.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactServerUpdateQueue.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

      const ReactUpdateQueue = require("./ReactUpdateQueue");

      const warning = require("fbjs/lib/warning");

      function warnNoop(publicInstance, callerName) {
        if (process.env.NODE_ENV !== "production") {
          const constructor = publicInstance.constructor;
          process.env.NODE_ENV !== "production" ? warning(false, "%s(...): Can only update a mounting component. " + "This usually means you called %s() outside componentWillMount() on the server. " + "This is a no-op. Please check the code for the %s component.", callerName, callerName, constructor && (constructor.displayName || constructor.name) || "ReactClass") : void 0;
        }
      }

/**
 * This is the update queue used for server rendering.
 * It delegates to ReactUpdateQueue while server rendering is in progress and
 * switches to ReactNoopUpdateQueue after the transaction has completed.
 * @class ReactServerUpdateQueue
 * @param {Transaction} transaction
 */

      const ReactServerUpdateQueue = (function() {
        function ReactServerUpdateQueue(transaction) {
          _classCallCheck(this, ReactServerUpdateQueue);

          this.transaction = transaction;
        }

  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */


        ReactServerUpdateQueue.prototype.isMounted = function isMounted(publicInstance) {
          return false;
        };

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @internal
   */


        ReactServerUpdateQueue.prototype.enqueueCallback = function enqueueCallback(publicInstance, callback, callerName) {
          if (this.transaction.isInTransaction()) {
            ReactUpdateQueue.enqueueCallback(publicInstance, callback, callerName);
          }
        };

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */


        ReactServerUpdateQueue.prototype.enqueueForceUpdate = function enqueueForceUpdate(publicInstance) {
          if (this.transaction.isInTransaction()) {
            ReactUpdateQueue.enqueueForceUpdate(publicInstance);
          } else {
            warnNoop(publicInstance, "forceUpdate");
          }
        };

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object|function} completeState Next state.
   * @internal
   */


        ReactServerUpdateQueue.prototype.enqueueReplaceState = function enqueueReplaceState(publicInstance, completeState) {
          if (this.transaction.isInTransaction()) {
            ReactUpdateQueue.enqueueReplaceState(publicInstance, completeState);
          } else {
            warnNoop(publicInstance, "replaceState");
          }
        };

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object|function} partialState Next partial state to be merged with state.
   * @internal
   */


        ReactServerUpdateQueue.prototype.enqueueSetState = function enqueueSetState(publicInstance, partialState) {
          if (this.transaction.isInTransaction()) {
            ReactUpdateQueue.enqueueSetState(publicInstance, partialState);
          } else {
            warnNoop(publicInstance, "setState");
          }
        };

        return ReactServerUpdateQueue;
      }());

      module.exports = ReactServerUpdateQueue;
    }).call(this, require("_process"));
  }, { "./ReactUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdateQueue.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdateQueue.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactCurrentOwner = require("react/lib/ReactCurrentOwner");
      const ReactInstanceMap = require("./ReactInstanceMap");
      const ReactInstrumentation = require("./ReactInstrumentation");
      const ReactUpdates = require("./ReactUpdates");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      function enqueueUpdate(internalInstance) {
        ReactUpdates.enqueueUpdate(internalInstance);
      }

      function formatUnexpectedArgument(arg) {
        const type = typeof arg;
        if (type !== "object") {
          return type;
        }
        const displayName = arg.constructor && arg.constructor.name || type;
        const keys = Object.keys(arg);
        if (keys.length > 0 && keys.length < 20) {
          return `${displayName} (keys: ${keys.join(", ")})`;
        }
        return displayName;
      }

      function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
        const internalInstance = ReactInstanceMap.get(publicInstance);
        if (!internalInstance) {
          if (process.env.NODE_ENV !== "production") {
            const ctor = publicInstance.constructor;
      // Only warn when we have a callerName. Otherwise we should be silent.
      // We're probably calling from enqueueCallback. We don't want to warn
      // there because we already warned for the corresponding lifecycle method.
            process.env.NODE_ENV !== "production" ? warning(!callerName, "%s(...): Can only update a mounted or mounting component. " + "This usually means you called %s() on an unmounted component. " + "This is a no-op. Please check the code for the %s component.", callerName, callerName, ctor && (ctor.displayName || ctor.name) || "ReactClass") : void 0;
          }
          return null;
        }

        if (process.env.NODE_ENV !== "production") {
          process.env.NODE_ENV !== "production" ? warning(ReactCurrentOwner.current == null, "%s(...): Cannot update during an existing state transition (such as " + "within `render` or another component's constructor). Render methods " + "should be a pure function of props and state; constructor " + "side-effects are an anti-pattern, but can be moved to " + "`componentWillMount`.", callerName) : void 0;
        }

        return internalInstance;
      }

/**
 * ReactUpdateQueue allows for state updates to be scheduled into a later
 * reconciliation step.
 */
      var ReactUpdateQueue = {

  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
        isMounted(publicInstance) {
          if (process.env.NODE_ENV !== "production") {
            const owner = ReactCurrentOwner.current;
            if (owner !== null) {
              process.env.NODE_ENV !== "production" ? warning(owner._warnedAboutRefsInRender, "%s is accessing isMounted inside its render() function. " + "render() should be a pure function of props and state. It should " + "never access something that requires stale data from the previous " + "render, such as refs. Move this logic to componentDidMount and " + "componentDidUpdate instead.", owner.getName() || "A component") : void 0;
              owner._warnedAboutRefsInRender = true;
            }
          }
          const internalInstance = ReactInstanceMap.get(publicInstance);
          if (internalInstance) {
      // During componentWillMount and render this will still be null but after
      // that will always render to something. At least for now. So we can use
      // this hack.
            return !!internalInstance._renderedComponent;
          }
          return false;
        },

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @param {string} callerName Name of the calling function in the public API.
   * @internal
   */
        enqueueCallback(publicInstance, callback, callerName) {
          ReactUpdateQueue.validateCallback(callback, callerName);
          const internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    // Previously we would throw an error if we didn't have an internal
    // instance. Since we want to make it a no-op instead, we mirror the same
    // behavior we have in other enqueue* methods.
    // We also need to ignore callbacks in componentWillMount. See
    // enqueueUpdates.
          if (!internalInstance) {
            return null;
          }

          if (internalInstance._pendingCallbacks) {
            internalInstance._pendingCallbacks.push(callback);
          } else {
            internalInstance._pendingCallbacks = [callback];
          }
    // TODO: The callback here is ignored when setState is called from
    // componentWillMount. Either fix it or disallow doing so completely in
    // favor of getInitialState. Alternatively, we can disallow
    // componentWillMount during server-side rendering.
          enqueueUpdate(internalInstance);
        },

        enqueueCallbackInternal(internalInstance, callback) {
          if (internalInstance._pendingCallbacks) {
            internalInstance._pendingCallbacks.push(callback);
          } else {
            internalInstance._pendingCallbacks = [callback];
          }
          enqueueUpdate(internalInstance);
        },

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */
        enqueueForceUpdate(publicInstance) {
          const internalInstance = getInternalInstanceReadyForUpdate(publicInstance, "forceUpdate");

          if (!internalInstance) {
            return;
          }

          internalInstance._pendingForceUpdate = true;

          enqueueUpdate(internalInstance);
        },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @internal
   */
        enqueueReplaceState(publicInstance, completeState) {
          const internalInstance = getInternalInstanceReadyForUpdate(publicInstance, "replaceState");

          if (!internalInstance) {
            return;
          }

          internalInstance._pendingStateQueue = [completeState];
          internalInstance._pendingReplaceState = true;

          enqueueUpdate(internalInstance);
        },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @internal
   */
        enqueueSetState(publicInstance, partialState) {
          if (process.env.NODE_ENV !== "production") {
            ReactInstrumentation.debugTool.onSetState();
            process.env.NODE_ENV !== "production" ? warning(partialState != null, "setState(...): You passed an undefined or null state object; " + "instead, use forceUpdate().") : void 0;
          }

          const internalInstance = getInternalInstanceReadyForUpdate(publicInstance, "setState");

          if (!internalInstance) {
            return;
          }

          const queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
          queue.push(partialState);

          enqueueUpdate(internalInstance);
        },

        enqueueElementInternal(internalInstance, nextElement, nextContext) {
          internalInstance._pendingElement = nextElement;
    // TODO: introduce _pendingContext instead of setting it directly.
          internalInstance._context = nextContext;
          enqueueUpdate(internalInstance);
        },

        validateCallback(callback, callerName) {
          !(!callback || typeof callback === "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", callerName, formatUnexpectedArgument(callback)) : _prodInvariant("122", callerName, formatUnexpectedArgument(callback)) : void 0;
        },

      };

      module.exports = ReactUpdateQueue;
    }).call(this, require("_process"));
  }, { "./ReactInstanceMap": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstanceMap.js", "./ReactInstrumentation": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstrumentation.js", "./ReactUpdates": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactUpdates.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const CallbackQueue = require("./CallbackQueue");
      const PooledClass = require("./PooledClass");
      const ReactFeatureFlags = require("./ReactFeatureFlags");
      const ReactReconciler = require("./ReactReconciler");
      const Transaction = require("./Transaction");

      const invariant = require("fbjs/lib/invariant");

      const dirtyComponents = [];
      let updateBatchNumber = 0;
      let asapCallbackQueue = CallbackQueue.getPooled();
      let asapEnqueued = false;

      let batchingStrategy = null;

      function ensureInjected() {
        !(ReactUpdates.ReactReconcileTransaction && batchingStrategy) ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactUpdates: must inject a reconcile transaction class and batching strategy") : _prodInvariant("123") : void 0;
      }

      const NESTED_UPDATES = {
        initialize() {
          this.dirtyComponentsLength = dirtyComponents.length;
        },
        close() {
          if (this.dirtyComponentsLength !== dirtyComponents.length) {
      // Additional updates were enqueued by componentDidUpdate handlers or
      // similar; before our own UPDATE_QUEUEING wrapper closes, we want to run
      // these new updates so that if A's componentDidUpdate calls setState on
      // B, B will update before the callback A's updater provided when calling
      // setState.
            dirtyComponents.splice(0, this.dirtyComponentsLength);
            flushBatchedUpdates();
          } else {
            dirtyComponents.length = 0;
          }
        },
      };

      const UPDATE_QUEUEING = {
        initialize() {
          this.callbackQueue.reset();
        },
        close() {
          this.callbackQueue.notifyAll();
        },
      };

      const TRANSACTION_WRAPPERS = [NESTED_UPDATES, UPDATE_QUEUEING];

      function ReactUpdatesFlushTransaction() {
        this.reinitializeTransaction();
        this.dirtyComponentsLength = null;
        this.callbackQueue = CallbackQueue.getPooled();
        this.reconcileTransaction = ReactUpdates.ReactReconcileTransaction.getPooled(
  /* useCreateElement */true);
      }

      _assign(ReactUpdatesFlushTransaction.prototype, Transaction, {
        getTransactionWrappers() {
          return TRANSACTION_WRAPPERS;
        },

        destructor() {
          this.dirtyComponentsLength = null;
          CallbackQueue.release(this.callbackQueue);
          this.callbackQueue = null;
          ReactUpdates.ReactReconcileTransaction.release(this.reconcileTransaction);
          this.reconcileTransaction = null;
        },

        perform(method, scope, a) {
    // Essentially calls `this.reconcileTransaction.perform(method, scope, a)`
    // with this transaction's wrappers around it.
          return Transaction.perform.call(this, this.reconcileTransaction.perform, this.reconcileTransaction, method, scope, a);
        },
      });

      PooledClass.addPoolingTo(ReactUpdatesFlushTransaction);

      function batchedUpdates(callback, a, b, c, d, e) {
        ensureInjected();
        return batchingStrategy.batchedUpdates(callback, a, b, c, d, e);
      }

/**
 * Array comparator for ReactComponents by mount ordering.
 *
 * @param {ReactComponent} c1 first component you're comparing
 * @param {ReactComponent} c2 second component you're comparing
 * @return {number} Return value usable by Array.prototype.sort().
 */
      function mountOrderComparator(c1, c2) {
        return c1._mountOrder - c2._mountOrder;
      }

      function runBatchedUpdates(transaction) {
        const len = transaction.dirtyComponentsLength;
        !(len === dirtyComponents.length) ? process.env.NODE_ENV !== "production" ? invariant(false, "Expected flush transaction's stored dirty-components length (%s) to match dirty-components array length (%s).", len, dirtyComponents.length) : _prodInvariant("124", len, dirtyComponents.length) : void 0;

  // Since reconciling a component higher in the owner hierarchy usually (not
  // always -- see shouldComponentUpdate()) will reconcile children, reconcile
  // them before their children by sorting the array.
        dirtyComponents.sort(mountOrderComparator);

  // Any updates enqueued while reconciling must be performed after this entire
  // batch. Otherwise, if dirtyComponents is [A, B] where A has children B and
  // C, B could update twice in a single batch if C's render enqueues an update
  // to B (since B would have already updated, we should skip it, and the only
  // way we can know to do so is by checking the batch counter).
        updateBatchNumber++;

        for (let i = 0; i < len; i++) {
    // If a component is unmounted before pending changes apply, it will still
    // be here, but we assume that it has cleared its _pendingCallbacks and
    // that performUpdateIfNecessary is a noop.
          const component = dirtyComponents[i];

    // If performUpdateIfNecessary happens to enqueue any new updates, we
    // shouldn't execute the callbacks until the next render happens, so
    // stash the callbacks first
          const callbacks = component._pendingCallbacks;
          component._pendingCallbacks = null;

          var markerName;
          if (ReactFeatureFlags.logTopLevelRenders) {
            let namedComponent = component;
      // Duck type TopLevelWrapper. This is probably always true.
            if (component._currentElement.type.isReactTopLevelWrapper) {
              namedComponent = component._renderedComponent;
            }
            markerName = `React update: ${namedComponent.getName()}`;
            console.time(markerName);
          }

          ReactReconciler.performUpdateIfNecessary(component, transaction.reconcileTransaction, updateBatchNumber);

          if (markerName) {
            console.timeEnd(markerName);
          }

          if (callbacks) {
            for (let j = 0; j < callbacks.length; j++) {
              transaction.callbackQueue.enqueue(callbacks[j], component.getPublicInstance());
            }
          }
        }
      }

      var flushBatchedUpdates = function() {
  // ReactUpdatesFlushTransaction's wrappers will clear the dirtyComponents
  // array and perform any updates enqueued by mount-ready handlers (i.e.,
  // componentDidUpdate) but we need to check here too in order to catch
  // updates enqueued by setState callbacks and asap calls.
        while (dirtyComponents.length || asapEnqueued) {
          if (dirtyComponents.length) {
            const transaction = ReactUpdatesFlushTransaction.getPooled();
            transaction.perform(runBatchedUpdates, null, transaction);
            ReactUpdatesFlushTransaction.release(transaction);
          }

          if (asapEnqueued) {
            asapEnqueued = false;
            const queue = asapCallbackQueue;
            asapCallbackQueue = CallbackQueue.getPooled();
            queue.notifyAll();
            CallbackQueue.release(queue);
          }
        }
      };

/**
 * Mark a component as needing a rerender, adding an optional callback to a
 * list of functions which will be executed once the rerender occurs.
 */
      function enqueueUpdate(component) {
        ensureInjected();

  // Various parts of our code (such as ReactCompositeComponent's
  // _renderValidatedComponent) assume that calls to render aren't nested;
  // verify that that's the case. (This is called by each top-level update
  // function, like setState, forceUpdate, etc.; creation and
  // destruction of top-level components is guarded in ReactMount.)

        if (!batchingStrategy.isBatchingUpdates) {
          batchingStrategy.batchedUpdates(enqueueUpdate, component);
          return;
        }

        dirtyComponents.push(component);
        if (component._updateBatchNumber == null) {
          component._updateBatchNumber = updateBatchNumber + 1;
        }
      }

/**
 * Enqueue a callback to be run at the end of the current batching cycle. Throws
 * if no updates are currently being performed.
 */
      function asap(callback, context) {
        !batchingStrategy.isBatchingUpdates ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactUpdates.asap: Can't enqueue an asap callback in a context whereupdates are not being batched.") : _prodInvariant("125") : void 0;
        asapCallbackQueue.enqueue(callback, context);
        asapEnqueued = true;
      }

      const ReactUpdatesInjection = {
        injectReconcileTransaction(ReconcileTransaction) {
          !ReconcileTransaction ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactUpdates: must provide a reconcile transaction class") : _prodInvariant("126") : void 0;
          ReactUpdates.ReactReconcileTransaction = ReconcileTransaction;
        },

        injectBatchingStrategy(_batchingStrategy) {
          !_batchingStrategy ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactUpdates: must provide a batching strategy") : _prodInvariant("127") : void 0;
          !(typeof _batchingStrategy.batchedUpdates === "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactUpdates: must provide a batchedUpdates() function") : _prodInvariant("128") : void 0;
          !(typeof _batchingStrategy.isBatchingUpdates === "boolean") ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactUpdates: must provide an isBatchingUpdates boolean attribute") : _prodInvariant("129") : void 0;
          batchingStrategy = _batchingStrategy;
        },
      };

      var ReactUpdates = {
  /**
   * React references `ReactReconcileTransaction` using this property in order
   * to allow dependency injection.
   *
   * @internal
   */
        ReactReconcileTransaction: null,

        batchedUpdates,
        enqueueUpdate,
        flushBatchedUpdates,
        injection: ReactUpdatesInjection,
        asap,
      };

      module.exports = ReactUpdates;
    }).call(this, require("_process"));
  }, { "./CallbackQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CallbackQueue.js", "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "./ReactFeatureFlags": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactFeatureFlags.js", "./ReactReconciler": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactReconciler.js", "./Transaction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Transaction.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactVersion.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    module.exports = "15.4.2";
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SVGDOMPropertyConfig.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const NS = {
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
    };

// We use attributes for everything SVG so let's avoid some duplication and run
// code instead.
// The following are all specified in the HTML config already so we exclude here.
// - class (as className)
// - color
// - height
// - id
// - lang
// - max
// - media
// - method
// - min
// - name
// - style
// - target
// - type
// - width
    const ATTRS = {
      "accentHeight": "accent-height",
      "accumulate": 0,
      "additive": 0,
      "alignmentBaseline": "alignment-baseline",
      "allowReorder": "allowReorder",
      "alphabetic": 0,
      "amplitude": 0,
      "arabicForm": "arabic-form",
      "ascent": 0,
      "attributeName": "attributeName",
      "attributeType": "attributeType",
      "autoReverse": "autoReverse",
      "azimuth": 0,
      "baseFrequency": "baseFrequency",
      "baseProfile": "baseProfile",
      "baselineShift": "baseline-shift",
      "bbox": 0,
      "begin": 0,
      "bias": 0,
      "by": 0,
      "calcMode": "calcMode",
      "capHeight": "cap-height",
      "clip": 0,
      "clipPath": "clip-path",
      "clipRule": "clip-rule",
      "clipPathUnits": "clipPathUnits",
      "colorInterpolation": "color-interpolation",
      "colorInterpolationFilters": "color-interpolation-filters",
      "colorProfile": "color-profile",
      "colorRendering": "color-rendering",
      "contentScriptType": "contentScriptType",
      "contentStyleType": "contentStyleType",
      "cursor": 0,
      "cx": 0,
      "cy": 0,
      "d": 0,
      "decelerate": 0,
      "descent": 0,
      "diffuseConstant": "diffuseConstant",
      "direction": 0,
      "display": 0,
      "divisor": 0,
      "dominantBaseline": "dominant-baseline",
      "dur": 0,
      "dx": 0,
      "dy": 0,
      "edgeMode": "edgeMode",
      "elevation": 0,
      "enableBackground": "enable-background",
      "end": 0,
      "exponent": 0,
      "externalResourcesRequired": "externalResourcesRequired",
      "fill": 0,
      "fillOpacity": "fill-opacity",
      "fillRule": "fill-rule",
      "filter": 0,
      "filterRes": "filterRes",
      "filterUnits": "filterUnits",
      "floodColor": "flood-color",
      "floodOpacity": "flood-opacity",
      "focusable": 0,
      "fontFamily": "font-family",
      "fontSize": "font-size",
      "fontSizeAdjust": "font-size-adjust",
      "fontStretch": "font-stretch",
      "fontStyle": "font-style",
      "fontVariant": "font-variant",
      "fontWeight": "font-weight",
      "format": 0,
      "from": 0,
      "fx": 0,
      "fy": 0,
      "g1": 0,
      "g2": 0,
      "glyphName": "glyph-name",
      "glyphOrientationHorizontal": "glyph-orientation-horizontal",
      "glyphOrientationVertical": "glyph-orientation-vertical",
      "glyphRef": "glyphRef",
      "gradientTransform": "gradientTransform",
      "gradientUnits": "gradientUnits",
      "hanging": 0,
      "horizAdvX": "horiz-adv-x",
      "horizOriginX": "horiz-origin-x",
      "ideographic": 0,
      "imageRendering": "image-rendering",
      "in": 0,
      "in2": 0,
      "intercept": 0,
      "k": 0,
      "k1": 0,
      "k2": 0,
      "k3": 0,
      "k4": 0,
      "kernelMatrix": "kernelMatrix",
      "kernelUnitLength": "kernelUnitLength",
      "kerning": 0,
      "keyPoints": "keyPoints",
      "keySplines": "keySplines",
      "keyTimes": "keyTimes",
      "lengthAdjust": "lengthAdjust",
      "letterSpacing": "letter-spacing",
      "lightingColor": "lighting-color",
      "limitingConeAngle": "limitingConeAngle",
      "local": 0,
      "markerEnd": "marker-end",
      "markerMid": "marker-mid",
      "markerStart": "marker-start",
      "markerHeight": "markerHeight",
      "markerUnits": "markerUnits",
      "markerWidth": "markerWidth",
      "mask": 0,
      "maskContentUnits": "maskContentUnits",
      "maskUnits": "maskUnits",
      "mathematical": 0,
      "mode": 0,
      "numOctaves": "numOctaves",
      "offset": 0,
      "opacity": 0,
      "operator": 0,
      "order": 0,
      "orient": 0,
      "orientation": 0,
      "origin": 0,
      "overflow": 0,
      "overlinePosition": "overline-position",
      "overlineThickness": "overline-thickness",
      "paintOrder": "paint-order",
      "panose1": "panose-1",
      "pathLength": "pathLength",
      "patternContentUnits": "patternContentUnits",
      "patternTransform": "patternTransform",
      "patternUnits": "patternUnits",
      "pointerEvents": "pointer-events",
      "points": 0,
      "pointsAtX": "pointsAtX",
      "pointsAtY": "pointsAtY",
      "pointsAtZ": "pointsAtZ",
      "preserveAlpha": "preserveAlpha",
      "preserveAspectRatio": "preserveAspectRatio",
      "primitiveUnits": "primitiveUnits",
      "r": 0,
      "radius": 0,
      "refX": "refX",
      "refY": "refY",
      "renderingIntent": "rendering-intent",
      "repeatCount": "repeatCount",
      "repeatDur": "repeatDur",
      "requiredExtensions": "requiredExtensions",
      "requiredFeatures": "requiredFeatures",
      "restart": 0,
      "result": 0,
      "rotate": 0,
      "rx": 0,
      "ry": 0,
      "scale": 0,
      "seed": 0,
      "shapeRendering": "shape-rendering",
      "slope": 0,
      "spacing": 0,
      "specularConstant": "specularConstant",
      "specularExponent": "specularExponent",
      "speed": 0,
      "spreadMethod": "spreadMethod",
      "startOffset": "startOffset",
      "stdDeviation": "stdDeviation",
      "stemh": 0,
      "stemv": 0,
      "stitchTiles": "stitchTiles",
      "stopColor": "stop-color",
      "stopOpacity": "stop-opacity",
      "strikethroughPosition": "strikethrough-position",
      "strikethroughThickness": "strikethrough-thickness",
      "string": 0,
      "stroke": 0,
      "strokeDasharray": "stroke-dasharray",
      "strokeDashoffset": "stroke-dashoffset",
      "strokeLinecap": "stroke-linecap",
      "strokeLinejoin": "stroke-linejoin",
      "strokeMiterlimit": "stroke-miterlimit",
      "strokeOpacity": "stroke-opacity",
      "strokeWidth": "stroke-width",
      "surfaceScale": "surfaceScale",
      "systemLanguage": "systemLanguage",
      "tableValues": "tableValues",
      "targetX": "targetX",
      "targetY": "targetY",
      "textAnchor": "text-anchor",
      "textDecoration": "text-decoration",
      "textRendering": "text-rendering",
      "textLength": "textLength",
      "to": 0,
      "transform": 0,
      "u1": 0,
      "u2": 0,
      "underlinePosition": "underline-position",
      "underlineThickness": "underline-thickness",
      "unicode": 0,
      "unicodeBidi": "unicode-bidi",
      "unicodeRange": "unicode-range",
      "unitsPerEm": "units-per-em",
      "vAlphabetic": "v-alphabetic",
      "vHanging": "v-hanging",
      "vIdeographic": "v-ideographic",
      "vMathematical": "v-mathematical",
      "values": 0,
      "vectorEffect": "vector-effect",
      "version": 0,
      "vertAdvY": "vert-adv-y",
      "vertOriginX": "vert-origin-x",
      "vertOriginY": "vert-origin-y",
      "viewBox": "viewBox",
      "viewTarget": "viewTarget",
      "visibility": 0,
      "widths": 0,
      "wordSpacing": "word-spacing",
      "writingMode": "writing-mode",
      "x": 0,
      "xHeight": "x-height",
      "x1": 0,
      "x2": 0,
      "xChannelSelector": "xChannelSelector",
      "xlinkActuate": "xlink:actuate",
      "xlinkArcrole": "xlink:arcrole",
      "xlinkHref": "xlink:href",
      "xlinkRole": "xlink:role",
      "xlinkShow": "xlink:show",
      "xlinkTitle": "xlink:title",
      "xlinkType": "xlink:type",
      "xmlBase": "xml:base",
      "xmlns": 0,
      "xmlnsXlink": "xmlns:xlink",
      "xmlLang": "xml:lang",
      "xmlSpace": "xml:space",
      "y": 0,
      "y1": 0,
      "y2": 0,
      "yChannelSelector": "yChannelSelector",
      "z": 0,
      "zoomAndPan": "zoomAndPan",
    };

    const SVGDOMPropertyConfig = {
      Properties: {},
      DOMAttributeNamespaces: {
        xlinkActuate: NS.xlink,
        xlinkArcrole: NS.xlink,
        xlinkHref: NS.xlink,
        xlinkRole: NS.xlink,
        xlinkShow: NS.xlink,
        xlinkTitle: NS.xlink,
        xlinkType: NS.xlink,
        xmlBase: NS.xml,
        xmlLang: NS.xml,
        xmlSpace: NS.xml,
      },
      DOMAttributeNames: {},
    };

    Object.keys(ATTRS).forEach((key) => {
      SVGDOMPropertyConfig.Properties[key] = 0;
      if (ATTRS[key]) {
        SVGDOMPropertyConfig.DOMAttributeNames[key] = ATTRS[key];
      }
    });

    module.exports = SVGDOMPropertyConfig;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SelectEventPlugin.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const EventPropagators = require("./EventPropagators");
    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
    const ReactDOMComponentTree = require("./ReactDOMComponentTree");
    const ReactInputSelection = require("./ReactInputSelection");
    const SyntheticEvent = require("./SyntheticEvent");

    const getActiveElement = require("fbjs/lib/getActiveElement");
    const isTextInputElement = require("./isTextInputElement");
    const shallowEqual = require("fbjs/lib/shallowEqual");

    const skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && "documentMode" in document && document.documentMode <= 11;

    const eventTypes = {
      select: {
        phasedRegistrationNames: {
          bubbled: "onSelect",
          captured: "onSelectCapture",
        },
        dependencies: ["topBlur", "topContextMenu", "topFocus", "topKeyDown", "topKeyUp", "topMouseDown", "topMouseUp", "topSelectionChange"],
      },
    };

    let activeElement = null;
    let activeElementInst = null;
    let lastSelection = null;
    let mouseDown = false;

// Track whether a listener exists for this plugin. If none exist, we do
// not extract events. See #3639.
    let hasListener = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @return {object}
 */
    function getSelection(node) {
      if ("selectionStart" in node && ReactInputSelection.hasSelectionCapabilities(node)) {
        return {
          start: node.selectionStart,
          end: node.selectionEnd,
        };
      } else if (window.getSelection) {
        const selection = window.getSelection();
        return {
          anchorNode: selection.anchorNode,
          anchorOffset: selection.anchorOffset,
          focusNode: selection.focusNode,
          focusOffset: selection.focusOffset,
        };
      } else if (document.selection) {
        const range = document.selection.createRange();
        return {
          parentElement: range.parentElement(),
          text: range.text,
          top: range.boundingTop,
          left: range.boundingLeft,
        };
      }
    }

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
    function constructSelectEvent(nativeEvent, nativeEventTarget) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
      if (mouseDown || activeElement == null || activeElement !== getActiveElement()) {
        return null;
      }

  // Only fire when selection has actually changed.
      const currentSelection = getSelection(activeElement);
      if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
        lastSelection = currentSelection;

        const syntheticEvent = SyntheticEvent.getPooled(eventTypes.select, activeElementInst, nativeEvent, nativeEventTarget);

        syntheticEvent.type = "select";
        syntheticEvent.target = activeElement;

        EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);

        return syntheticEvent;
      }

      return null;
    }

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
    const SelectEventPlugin = {

      eventTypes,

      extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        if (!hasListener) {
          return null;
        }

        const targetNode = targetInst ? ReactDOMComponentTree.getNodeFromInstance(targetInst) : window;

        switch (topLevelType) {
      // Track the input node that has focus.
          case "topFocus":
            if (isTextInputElement(targetNode) || targetNode.contentEditable === "true") {
              activeElement = targetNode;
              activeElementInst = targetInst;
              lastSelection = null;
            }
            break;
          case "topBlur":
            activeElement = null;
            activeElementInst = null;
            lastSelection = null;
            break;

      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
          case "topMouseDown":
            mouseDown = true;
            break;
          case "topContextMenu":
          case "topMouseUp":
            mouseDown = false;
            return constructSelectEvent(nativeEvent, nativeEventTarget);

      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't). IE's event fires out of order with respect
      // to key and input events on deletion, so we discard it.
      //
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      // This is also our approach for IE handling, for the reason above.
          case "topSelectionChange":
            if (skipSelectionChangeEvent) {
              break;
            }
      // falls through
          case "topKeyDown":
          case "topKeyUp":
            return constructSelectEvent(nativeEvent, nativeEventTarget);
        }

        return null;
      },

      didPutListener(inst, registrationName, listener) {
        if (registrationName === "onSelect") {
          hasListener = true;
        }
      },
    };

    module.exports = SelectEventPlugin;
  }, { "./EventPropagators": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPropagators.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactInputSelection": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInputSelection.js", "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js", "./isTextInputElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isTextInputElement.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js", "fbjs/lib/getActiveElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\getActiveElement.js", "fbjs/lib/shallowEqual": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\shallowEqual.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SimpleEventPlugin.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const EventListener = require("fbjs/lib/EventListener");
      const EventPropagators = require("./EventPropagators");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const SyntheticAnimationEvent = require("./SyntheticAnimationEvent");
      const SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
      const SyntheticEvent = require("./SyntheticEvent");
      const SyntheticFocusEvent = require("./SyntheticFocusEvent");
      const SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
      const SyntheticMouseEvent = require("./SyntheticMouseEvent");
      const SyntheticDragEvent = require("./SyntheticDragEvent");
      const SyntheticTouchEvent = require("./SyntheticTouchEvent");
      const SyntheticTransitionEvent = require("./SyntheticTransitionEvent");
      const SyntheticUIEvent = require("./SyntheticUIEvent");
      const SyntheticWheelEvent = require("./SyntheticWheelEvent");

      const emptyFunction = require("fbjs/lib/emptyFunction");
      const getEventCharCode = require("./getEventCharCode");
      const invariant = require("fbjs/lib/invariant");

/**
 * Turns
 * ['abort', ...]
 * into
 * eventTypes = {
 *   'abort': {
 *     phasedRegistrationNames: {
 *       bubbled: 'onAbort',
 *       captured: 'onAbortCapture',
 *     },
 *     dependencies: ['topAbort'],
 *   },
 *   ...
 * };
 * topLevelEventsToDispatchConfig = {
 *   'topAbort': { sameConfig }
 * };
 */
      const eventTypes = {};
      const topLevelEventsToDispatchConfig = {};
      ["abort", "animationEnd", "animationIteration", "animationStart", "blur", "canPlay", "canPlayThrough", "click", "contextMenu", "copy", "cut", "doubleClick", "drag", "dragEnd", "dragEnter", "dragExit", "dragLeave", "dragOver", "dragStart", "drop", "durationChange", "emptied", "encrypted", "ended", "error", "focus", "input", "invalid", "keyDown", "keyPress", "keyUp", "load", "loadedData", "loadedMetadata", "loadStart", "mouseDown", "mouseMove", "mouseOut", "mouseOver", "mouseUp", "paste", "pause", "play", "playing", "progress", "rateChange", "reset", "scroll", "seeked", "seeking", "stalled", "submit", "suspend", "timeUpdate", "touchCancel", "touchEnd", "touchMove", "touchStart", "transitionEnd", "volumeChange", "waiting", "wheel"].forEach((event) => {
        const capitalizedEvent = event[0].toUpperCase() + event.slice(1);
        const onEvent = `on${capitalizedEvent}`;
        const topEvent = `top${capitalizedEvent}`;

        const type = {
          phasedRegistrationNames: {
            bubbled: onEvent,
            captured: `${onEvent}Capture`,
          },
          dependencies: [topEvent],
        };
        eventTypes[event] = type;
        topLevelEventsToDispatchConfig[topEvent] = type;
      });

      const onClickListeners = {};

      function getDictionaryKey(inst) {
  // Prevents V8 performance issue:
  // https://github.com/facebook/react/pull/7232
        return `.${inst._rootNodeID}`;
      }

      function isInteractive(tag) {
        return tag === "button" || tag === "input" || tag === "select" || tag === "textarea";
      }

      const SimpleEventPlugin = {

        eventTypes,

        extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
          const dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
          if (!dispatchConfig) {
            return null;
          }
          let EventConstructor;
          switch (topLevelType) {
            case "topAbort":
            case "topCanPlay":
            case "topCanPlayThrough":
            case "topDurationChange":
            case "topEmptied":
            case "topEncrypted":
            case "topEnded":
            case "topError":
            case "topInput":
            case "topInvalid":
            case "topLoad":
            case "topLoadedData":
            case "topLoadedMetadata":
            case "topLoadStart":
            case "topPause":
            case "topPlay":
            case "topPlaying":
            case "topProgress":
            case "topRateChange":
            case "topReset":
            case "topSeeked":
            case "topSeeking":
            case "topStalled":
            case "topSubmit":
            case "topSuspend":
            case "topTimeUpdate":
            case "topVolumeChange":
            case "topWaiting":
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
              EventConstructor = SyntheticEvent;
              break;
            case "topKeyPress":
        // Firefox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
              if (getEventCharCode(nativeEvent) === 0) {
                return null;
              }
      /* falls through */
            case "topKeyDown":
            case "topKeyUp":
              EventConstructor = SyntheticKeyboardEvent;
              break;
            case "topBlur":
            case "topFocus":
              EventConstructor = SyntheticFocusEvent;
              break;
            case "topClick":
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
              if (nativeEvent.button === 2) {
                return null;
              }
      /* falls through */
            case "topDoubleClick":
            case "topMouseDown":
            case "topMouseMove":
            case "topMouseUp":
      // TODO: Disabled elements should not respond to mouse events
      /* falls through */
            case "topMouseOut":
            case "topMouseOver":
            case "topContextMenu":
              EventConstructor = SyntheticMouseEvent;
              break;
            case "topDrag":
            case "topDragEnd":
            case "topDragEnter":
            case "topDragExit":
            case "topDragLeave":
            case "topDragOver":
            case "topDragStart":
            case "topDrop":
              EventConstructor = SyntheticDragEvent;
              break;
            case "topTouchCancel":
            case "topTouchEnd":
            case "topTouchMove":
            case "topTouchStart":
              EventConstructor = SyntheticTouchEvent;
              break;
            case "topAnimationEnd":
            case "topAnimationIteration":
            case "topAnimationStart":
              EventConstructor = SyntheticAnimationEvent;
              break;
            case "topTransitionEnd":
              EventConstructor = SyntheticTransitionEvent;
              break;
            case "topScroll":
              EventConstructor = SyntheticUIEvent;
              break;
            case "topWheel":
              EventConstructor = SyntheticWheelEvent;
              break;
            case "topCopy":
            case "topCut":
            case "topPaste":
              EventConstructor = SyntheticClipboardEvent;
              break;
          }
          !EventConstructor ? process.env.NODE_ENV !== "production" ? invariant(false, "SimpleEventPlugin: Unhandled event type, `%s`.", topLevelType) : _prodInvariant("86", topLevelType) : void 0;
          const event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
          EventPropagators.accumulateTwoPhaseDispatches(event);
          return event;
        },

        didPutListener(inst, registrationName, listener) {
    // Mobile Safari does not fire properly bubble click events on
    // non-interactive elements, which means delegated click listeners do not
    // fire. The workaround for this bug involves attaching an empty click
    // listener on the target node.
    // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
          if (registrationName === "onClick" && !isInteractive(inst._tag)) {
            const key = getDictionaryKey(inst);
            const node = ReactDOMComponentTree.getNodeFromInstance(inst);
            if (!onClickListeners[key]) {
              onClickListeners[key] = EventListener.listen(node, "click", emptyFunction);
            }
          }
        },

        willDeleteListener(inst, registrationName) {
          if (registrationName === "onClick" && !isInteractive(inst._tag)) {
            const key = getDictionaryKey(inst);
            onClickListeners[key].remove();
            delete onClickListeners[key];
          }
        },

      };

      module.exports = SimpleEventPlugin;
    }).call(this, require("_process"));
  }, { "./EventPropagators": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\EventPropagators.js", "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./SyntheticAnimationEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticAnimationEvent.js", "./SyntheticClipboardEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticClipboardEvent.js", "./SyntheticDragEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticDragEvent.js", "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js", "./SyntheticFocusEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticFocusEvent.js", "./SyntheticKeyboardEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticKeyboardEvent.js", "./SyntheticMouseEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticMouseEvent.js", "./SyntheticTouchEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticTouchEvent.js", "./SyntheticTransitionEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticTransitionEvent.js", "./SyntheticUIEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticUIEvent.js", "./SyntheticWheelEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticWheelEvent.js", "./getEventCharCode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventCharCode.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/EventListener": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\EventListener.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticAnimationEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/css3-animations/#AnimationEvent-interface
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEvent
 */
    const AnimationEventInterface = {
      animationName: null,
      elapsedTime: null,
      pseudoElement: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
    function SyntheticAnimationEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticEvent.augmentClass(SyntheticAnimationEvent, AnimationEventInterface);

    module.exports = SyntheticAnimationEvent;
  }, { "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticClipboardEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
    const ClipboardEventInterface = {
      clipboardData(event) {
        return "clipboardData" in event ? event.clipboardData : window.clipboardData;
      },
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);

    module.exports = SyntheticClipboardEvent;
  }, { "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticCompositionEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
    const CompositionEventInterface = {
      data: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticEvent.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);

    module.exports = SyntheticCompositionEvent;
  }, { "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticDragEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
    const DragEventInterface = {
      dataTransfer: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

    module.exports = SyntheticDragEvent;
  }, { "./SyntheticMouseEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticMouseEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const PooledClass = require("./PooledClass");

      const emptyFunction = require("fbjs/lib/emptyFunction");
      const warning = require("fbjs/lib/warning");

      let didWarnForAddedNewProperty = false;
      const isProxySupported = typeof Proxy === "function";

      const shouldBeReleasedProperties = ["dispatchConfig", "_targetInst", "nativeEvent", "isDefaultPrevented", "isPropagationStopped", "_dispatchListeners", "_dispatchInstances"];

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
      const EventInterface = {
        type: null,
        target: null,
  // currentTarget is set when dispatching; no use in copying it here
        currentTarget: emptyFunction.thatReturnsNull,
        eventPhase: null,
        bubbles: null,
        cancelable: null,
        timeStamp(event) {
          return event.timeStamp || Date.now();
        },
        defaultPrevented: null,
        isTrusted: null,
      };

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {*} targetInst Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @param {DOMEventTarget} nativeEventTarget Target node.
 */
      function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
        if (process.env.NODE_ENV !== "production") {
    // these have a getter/setter for warnings
          delete this.nativeEvent;
          delete this.preventDefault;
          delete this.stopPropagation;
        }

        this.dispatchConfig = dispatchConfig;
        this._targetInst = targetInst;
        this.nativeEvent = nativeEvent;

        const Interface = this.constructor.Interface;
        for (const propName in Interface) {
          if (!Interface.hasOwnProperty(propName)) {
            continue;
          }
          if (process.env.NODE_ENV !== "production") {
            delete this[propName]; // this has a getter/setter for warnings
          }
          const normalize = Interface[propName];
          if (normalize) {
            this[propName] = normalize(nativeEvent);
          } else if (propName === "target") {
            this.target = nativeEventTarget;
          } else {
            this[propName] = nativeEvent[propName];
          }
        }

        const defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
        if (defaultPrevented) {
          this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
        } else {
          this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
        }
        this.isPropagationStopped = emptyFunction.thatReturnsFalse;
        return this;
      }

      _assign(SyntheticEvent.prototype, {

        preventDefault() {
          this.defaultPrevented = true;
          const event = this.nativeEvent;
          if (!event) {
            return;
          }

          if (event.preventDefault) {
            event.preventDefault();
          } else if (typeof event.returnValue !== "unknown") {
      // eslint-disable-line valid-typeof
            event.returnValue = false;
          }
          this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
        },

        stopPropagation() {
          const event = this.nativeEvent;
          if (!event) {
            return;
          }

          if (event.stopPropagation) {
            event.stopPropagation();
          } else if (typeof event.cancelBubble !== "unknown") {
      // eslint-disable-line valid-typeof
      // The ChangeEventPlugin registers a "propertychange" event for
      // IE. This event does not support bubbling or cancelling, and
      // any references to cancelBubble throw "Member not found".  A
      // typeof check of "unknown" circumvents this issue (and is also
      // IE specific).
            event.cancelBubble = true;
          }

          this.isPropagationStopped = emptyFunction.thatReturnsTrue;
        },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
        persist() {
          this.isPersistent = emptyFunction.thatReturnsTrue;
        },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
        isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
        destructor() {
          const Interface = this.constructor.Interface;
          for (const propName in Interface) {
            if (process.env.NODE_ENV !== "production") {
              Object.defineProperty(this, propName, getPooledWarningPropertyDefinition(propName, Interface[propName]));
            } else {
              this[propName] = null;
            }
          }
          for (let i = 0; i < shouldBeReleasedProperties.length; i++) {
            this[shouldBeReleasedProperties[i]] = null;
          }
          if (process.env.NODE_ENV !== "production") {
            Object.defineProperty(this, "nativeEvent", getPooledWarningPropertyDefinition("nativeEvent", null));
            Object.defineProperty(this, "preventDefault", getPooledWarningPropertyDefinition("preventDefault", emptyFunction));
            Object.defineProperty(this, "stopPropagation", getPooledWarningPropertyDefinition("stopPropagation", emptyFunction));
          }
        },

      });

      SyntheticEvent.Interface = EventInterface;

      if (process.env.NODE_ENV !== "production") {
        if (isProxySupported) {
    /* eslint-disable no-func-assign */
          SyntheticEvent = new Proxy(SyntheticEvent, {
            construct(target, args) {
              return this.apply(target, Object.create(target.prototype), args);
            },
            apply(constructor, that, args) {
              return new Proxy(constructor.apply(that, args), {
              set(target, prop, value) {
                if (prop !== "isPersistent" && !target.constructor.Interface.hasOwnProperty(prop) && shouldBeReleasedProperties.indexOf(prop) === -1) {
                  process.env.NODE_ENV !== "production" ? warning(didWarnForAddedNewProperty || target.isPersistent(), "This synthetic event is reused for performance reasons. If you're " + "seeing this, you're adding a new property in the synthetic event object. " + "The property is never released. See " + "https://fb.me/react-event-pooling for more information.") : void 0;
                  didWarnForAddedNewProperty = true;
                }
                target[prop] = value;
                return true;
              },
            });
            },
          });
    /* eslint-enable no-func-assign */
        }
      }
/**
 * Helper to reduce boilerplate when creating subclasses.
 *
 * @param {function} Class
 * @param {?object} Interface
 */
      SyntheticEvent.augmentClass = function(Class, Interface) {
        const Super = this;

        const E = function() {};
        E.prototype = Super.prototype;
        const prototype = new E();

        _assign(prototype, Class.prototype);
        Class.prototype = prototype;
        Class.prototype.constructor = Class;

        Class.Interface = _assign({}, Super.Interface, Interface);
        Class.augmentClass = Super.augmentClass;

        PooledClass.addPoolingTo(Class, PooledClass.fourArgumentPooler);
      };

      PooledClass.addPoolingTo(SyntheticEvent, PooledClass.fourArgumentPooler);

      module.exports = SyntheticEvent;

/**
  * Helper to nullify syntheticEvent instance properties when destructing
  *
  * @param {object} SyntheticEvent
  * @param {String} propName
  * @return {object} defineProperty object
  */
      function getPooledWarningPropertyDefinition(propName, getVal) {
        const isFunction = typeof getVal === "function";
        return {
          configurable: true,
          set,
          get,
        };

        function set(val) {
          const action = isFunction ? "setting the method" : "setting the property";
          warn(action, "This is effectively a no-op");
          return val;
        }

        function get() {
          const action = isFunction ? "accessing the method" : "accessing the property";
          const result = isFunction ? "This is a no-op function" : "This is set to null";
          warn(action, result);
          return getVal;
        }

        function warn(action, result) {
          const warningCondition = false;
          process.env.NODE_ENV !== "production" ? warning(warningCondition, "This synthetic event is reused for performance reasons. If you're seeing this, " + "you're %s `%s` on a released/nullified synthetic event. %s. " + "If you must keep the original synthetic event around, use event.persist(). " + "See https://fb.me/react-event-pooling for more information.", action, propName, result) : void 0;
        }
      }
    }).call(this, require("_process"));
  }, { "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\PooledClass.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticFocusEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticUIEvent = require("./SyntheticUIEvent");

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
    const FocusEventInterface = {
      relatedTarget: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

    module.exports = SyntheticFocusEvent;
  }, { "./SyntheticUIEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticUIEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticInputEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
 *      /#events-inputevents
 */
    const InputEventInterface = {
      data: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticEvent.augmentClass(SyntheticInputEvent, InputEventInterface);

    module.exports = SyntheticInputEvent;
  }, { "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticKeyboardEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticUIEvent = require("./SyntheticUIEvent");

    const getEventCharCode = require("./getEventCharCode");
    const getEventKey = require("./getEventKey");
    const getEventModifierState = require("./getEventModifierState");

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
    const KeyboardEventInterface = {
      key: getEventKey,
      location: null,
      ctrlKey: null,
      shiftKey: null,
      altKey: null,
      metaKey: null,
      repeat: null,
      locale: null,
      getModifierState: getEventModifierState,
  // Legacy Interface
      charCode(event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated, but its replacement is not yet final and not
    // implemented in any major browser. Only KeyPress has charCode.
        if (event.type === "keypress") {
          return getEventCharCode(event);
        }
        return 0;
      },
      keyCode(event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
        if (event.type === "keydown" || event.type === "keyup") {
          return event.keyCode;
        }
        return 0;
      },
      which(event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event.
        if (event.type === "keypress") {
          return getEventCharCode(event);
        }
        if (event.type === "keydown" || event.type === "keyup") {
          return event.keyCode;
        }
        return 0;
      },
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticKeyboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticUIEvent.augmentClass(SyntheticKeyboardEvent, KeyboardEventInterface);

    module.exports = SyntheticKeyboardEvent;
  }, { "./SyntheticUIEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticUIEvent.js", "./getEventCharCode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventCharCode.js", "./getEventKey": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventKey.js", "./getEventModifierState": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventModifierState.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticMouseEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticUIEvent = require("./SyntheticUIEvent");
    const ViewportMetrics = require("./ViewportMetrics");

    const getEventModifierState = require("./getEventModifierState");

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
    const MouseEventInterface = {
      screenX: null,
      screenY: null,
      clientX: null,
      clientY: null,
      ctrlKey: null,
      shiftKey: null,
      altKey: null,
      metaKey: null,
      getModifierState: getEventModifierState,
      button(event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
        const button = event.button;
        if ("which" in event) {
          return button;
        }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
        return button === 2 ? 2 : button === 4 ? 1 : 0;
      },
      buttons: null,
      relatedTarget(event) {
        return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
      },
  // "Proprietary" Interface.
      pageX(event) {
        return "pageX" in event ? event.pageX : event.clientX + ViewportMetrics.currentScrollLeft;
      },
      pageY(event) {
        return "pageY" in event ? event.pageY : event.clientY + ViewportMetrics.currentScrollTop;
      },
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticMouseEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

    module.exports = SyntheticMouseEvent;
  }, { "./SyntheticUIEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticUIEvent.js", "./ViewportMetrics": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ViewportMetrics.js", "./getEventModifierState": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventModifierState.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticTouchEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticUIEvent = require("./SyntheticUIEvent");

    const getEventModifierState = require("./getEventModifierState");

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
    const TouchEventInterface = {
      touches: null,
      targetTouches: null,
      changedTouches: null,
      altKey: null,
      metaKey: null,
      ctrlKey: null,
      shiftKey: null,
      getModifierState: getEventModifierState,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
    function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

    module.exports = SyntheticTouchEvent;
  }, { "./SyntheticUIEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticUIEvent.js", "./getEventModifierState": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventModifierState.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticTransitionEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticEvent = require("./SyntheticEvent");

/**
 * @interface Event
 * @see http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-events-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent
 */
    const TransitionEventInterface = {
      propertyName: null,
      elapsedTime: null,
      pseudoElement: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
    function SyntheticTransitionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticEvent.augmentClass(SyntheticTransitionEvent, TransitionEventInterface);

    module.exports = SyntheticTransitionEvent;
  }, { "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticUIEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticEvent = require("./SyntheticEvent");

    const getEventTarget = require("./getEventTarget");

/**
 * @interface UIEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
    const UIEventInterface = {
      view(event) {
        if (event.view) {
          return event.view;
        }

        const target = getEventTarget(event);
        if (target.window === target) {
      // target is a window object
          return target;
        }

        const doc = target.ownerDocument;
    // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
        if (doc) {
          return doc.defaultView || doc.parentWindow;
        }
        return window;
      },
      detail(event) {
        return event.detail || 0;
      },
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
    function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);

    module.exports = SyntheticUIEvent;
  }, { "./SyntheticEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticEvent.js", "./getEventTarget": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventTarget.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticWheelEvent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const SyntheticMouseEvent = require("./SyntheticMouseEvent");

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
    const WheelEventInterface = {
      deltaX(event) {
        return "deltaX" in event ? event.deltaX :
    // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
    "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
      },
      deltaY(event) {
        return "deltaY" in event ? event.deltaY :
    // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
    "wheelDeltaY" in event ? -event.wheelDeltaY :
    // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
    "wheelDelta" in event ? -event.wheelDelta : 0;
      },
      deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
      deltaMode: null,
    };

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticMouseEvent}
 */
    function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
      return SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
    }

    SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);

    module.exports = SyntheticWheelEvent;
  }, { "./SyntheticMouseEvent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\SyntheticMouseEvent.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\Transaction.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

      const OBSERVED_ERROR = {};

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM updates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
      const TransactionImpl = {
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
        reinitializeTransaction() {
          this.transactionWrappers = this.getTransactionWrappers();
          if (this.wrapperInitData) {
            this.wrapperInitData.length = 0;
          } else {
            this.wrapperInitData = [];
          }
          this._isInTransaction = false;
        },

        _isInTransaction: false,

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
        getTransactionWrappers: null,

        isInTransaction() {
          return !!this._isInTransaction;
        },

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked. The optional arguments helps prevent the need
   * to bind in many cases.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} a Argument to pass to the method.
   * @param {Object?=} b Argument to pass to the method.
   * @param {Object?=} c Argument to pass to the method.
   * @param {Object?=} d Argument to pass to the method.
   * @param {Object?=} e Argument to pass to the method.
   * @param {Object?=} f Argument to pass to the method.
   *
   * @return {*} Return value from `method`.
   */
        perform(method, scope, a, b, c, d, e, f) {
          this.isInTransaction() ? process.env.NODE_ENV !== "production" ? invariant(false, "Transaction.perform(...): Cannot initialize a transaction when there is already an outstanding transaction.") : _prodInvariant("27") : void 0;
          let errorThrown;
          let ret;
          try {
            this._isInTransaction = true;
      // Catching errors makes debugging more difficult, so we start with
      // errorThrown set to true before setting it to false after calling
      // close -- if it's still set to true in the finally block, it means
      // one of these calls threw.
            errorThrown = true;
            this.initializeAll(0);
            ret = method.call(scope, a, b, c, d, e, f);
            errorThrown = false;
          } finally {
            try {
              if (errorThrown) {
          // If `method` throws, prefer to show that stack trace over any thrown
          // by invoking `closeAll`.
              try {
                this.closeAll(0);
              } catch (err) {}
            } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
              this.closeAll(0);
            }
            } finally {
              this._isInTransaction = false;
            }
          }
          return ret;
        },

        initializeAll(startIndex) {
          const transactionWrappers = this.transactionWrappers;
          for (let i = startIndex; i < transactionWrappers.length; i++) {
            const wrapper = transactionWrappers[i];
            try {
        // Catching errors makes debugging more difficult, so we start with the
        // OBSERVED_ERROR state before overwriting it with the real return value
        // of initialize -- if it's still set to OBSERVED_ERROR in the finally
        // block, it means wrapper.initialize threw.
              this.wrapperInitData[i] = OBSERVED_ERROR;
              this.wrapperInitData[i] = wrapper.initialize ? wrapper.initialize.call(this) : null;
            } finally {
              if (this.wrapperInitData[i] === OBSERVED_ERROR) {
          // The initializer for wrapper i threw an error; initialize the
          // remaining wrappers but silence any exceptions from them to ensure
          // that the first error is the one to bubble up.
              try {
                this.initializeAll(i + 1);
              } catch (err) {}
            }
            }
          }
        },

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
        closeAll(startIndex) {
          !this.isInTransaction() ? process.env.NODE_ENV !== "production" ? invariant(false, "Transaction.closeAll(): Cannot close transaction when none are open.") : _prodInvariant("28") : void 0;
          const transactionWrappers = this.transactionWrappers;
          for (let i = startIndex; i < transactionWrappers.length; i++) {
            const wrapper = transactionWrappers[i];
            const initData = this.wrapperInitData[i];
            var errorThrown;
            try {
        // Catching errors makes debugging more difficult, so we start with
        // errorThrown set to true before setting it to false after calling
        // close -- if it's still set to true in the finally block, it means
        // wrapper.close threw.
              errorThrown = true;
              if (initData !== OBSERVED_ERROR && wrapper.close) {
              wrapper.close.call(this, initData);
            }
              errorThrown = false;
            } finally {
              if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
              try {
                this.closeAll(i + 1);
              } catch (e) {}
            }
            }
          }
          this.wrapperInitData.length = 0;
        },
      };

      module.exports = TransactionImpl;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ViewportMetrics.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    var ViewportMetrics = {

      currentScrollLeft: 0,

      currentScrollTop: 0,

      refreshScrollValues(scrollPosition) {
        ViewportMetrics.currentScrollLeft = scrollPosition.x;
        ViewportMetrics.currentScrollTop = scrollPosition.y;
      },

    };

    module.exports = ViewportMetrics;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\accumulateInto.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

/**
 * Accumulates items that must not be null or undefined into the first one. This
 * is used to conserve memory by avoiding array allocations, and thus sacrifices
 * API cleanness. Since `current` can be null before being passed in and not
 * null after this function, make sure to assign it back to `current`:
 *
 * `a = accumulateInto(a, b);`
 *
 * This API should be sparingly used. Try `accumulate` for something cleaner.
 *
 * @return {*|array<*>} An accumulation of items.
 */

      function accumulateInto(current, next) {
        !(next != null) ? process.env.NODE_ENV !== "production" ? invariant(false, "accumulateInto(...): Accumulated items must not be null or undefined.") : _prodInvariant("30") : void 0;

        if (current == null) {
          return next;
        }

  // Both are not empty. Warning: Never call x.concat(y) when you are not
  // certain that x is an Array (x could be a string with concat method).
        if (Array.isArray(current)) {
          if (Array.isArray(next)) {
            current.push(...next);
            return current;
          }
          current.push(next);
          return current;
        }

        if (Array.isArray(next)) {
    // A bit too dangerous to mutate `next`.
          return [current].concat(next);
        }

        return [current, next];
      }

      module.exports = accumulateInto;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\adler32.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


    const MOD = 65521;

// adler32 is not cryptographically strong, and is only used to sanity check that
// markup generated on the server matches the markup generated on the client.
// This implementation (a modified version of the SheetJS version) has been optimized
// for our use case, at the expense of conforming to the adler32 specification
// for non-ascii inputs.
    function adler32(data) {
      let a = 1;
      let b = 0;
      let i = 0;
      const l = data.length;
      const m = l & ~0x3;
      while (i < m) {
        const n = Math.min(i + 4096, m);
        for (; i < n; i += 4) {
          b += (a += data.charCodeAt(i)) + (a += data.charCodeAt(i + 1)) + (a += data.charCodeAt(i + 2)) + (a += data.charCodeAt(i + 3));
        }
        a %= MOD;
        b %= MOD;
      }
      for (; i < l; i++) {
        b += a += data.charCodeAt(i);
      }
      a %= MOD;
      b %= MOD;
      return a | b << 16;
    }

    module.exports = adler32;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\checkReactTypeSpec.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
      const ReactPropTypesSecret = require("./ReactPropTypesSecret");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      let ReactComponentTreeHook;

      if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") {
  // Temporary hack.
  // Inline requires don't work well with Jest:
  // https://github.com/facebook/react/issues/7240
  // Remove the inline requires when we don't need them anymore:
  // https://github.com/facebook/react/pull/7178
        ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
      }

      const loggedTypeFailures = {};

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?object} element The React element that is being type-checked
 * @param {?number} debugID The React component instance that is being type-checked
 * @private
 */
      function checkReactTypeSpec(typeSpecs, values, location, componentName, element, debugID) {
        for (const typeSpecName in typeSpecs) {
          if (typeSpecs.hasOwnProperty(typeSpecName)) {
            var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
            try {
        // This is intentionally an invariant that gets caught. It's the same
        // behavior as without this statement except with a better message.
              !(typeof typeSpecs[typeSpecName] === "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "%s: %s type `%s` is invalid; it must be a function, usually from React.PropTypes.", componentName || "React class", ReactPropTypeLocationNames[location], typeSpecName) : _prodInvariant("84", componentName || "React class", ReactPropTypeLocationNames[location], typeSpecName) : void 0;
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            process.env.NODE_ENV !== "production" ? warning(!error || error instanceof Error, "%s: type specification of %s `%s` is invalid; the type checker " + "function must return `null` or an `Error` but returned a %s. " + "You may have forgotten to pass an argument to the type checker " + "creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and " + "shape all require an argument).", componentName || "React class", ReactPropTypeLocationNames[location], typeSpecName, typeof error) : void 0;
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
              loggedTypeFailures[error.message] = true;

              let componentStackInfo = "";

              if (process.env.NODE_ENV !== "production") {
                if (!ReactComponentTreeHook) {
                ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
              }
                if (debugID !== null) {
                componentStackInfo = ReactComponentTreeHook.getStackAddendumByID(debugID);
              } else if (element !== null) {
                componentStackInfo = ReactComponentTreeHook.getCurrentStackAddendum(element);
              }
              }

              process.env.NODE_ENV !== "production" ? warning(false, "Failed %s type: %s%s", location, error.message, componentStackInfo) : void 0;
            }
          }
        }
      }

      module.exports = checkReactTypeSpec;
    }).call(this, require("_process"));
  }, { "./ReactPropTypeLocationNames": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactPropTypeLocationNames.js", "./ReactPropTypesSecret": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactPropTypesSecret.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\createMicrosoftUnsafeLocalFunction.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/* globals MSApp */


/**
 * Create a function which has 'unsafe' privileges (required by windows8 apps)
 */

    const createMicrosoftUnsafeLocalFunction = function(func) {
      if (typeof MSApp !== "undefined" && MSApp.execUnsafeLocalFunction) {
        return function(arg0, arg1, arg2, arg3) {
          MSApp.execUnsafeLocalFunction(() => {
            return func(arg0, arg1, arg2, arg3);
          });
        };
      }
      return func;
    };

    module.exports = createMicrosoftUnsafeLocalFunction;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\dangerousStyleValue.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const CSSProperty = require("./CSSProperty");
      const warning = require("fbjs/lib/warning");

      const isUnitlessNumber = CSSProperty.isUnitlessNumber;
      const styleWarnings = {};

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @param {ReactDOMComponent} component
 * @return {string} Normalized style value with dimensions applied.
 */
      function dangerousStyleValue(name, value, component) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

        const isEmpty = value == null || typeof value === "boolean" || value === "";
        if (isEmpty) {
          return "";
        }

        const isNonNumeric = isNaN(value);
        if (isNonNumeric || value === 0 || isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
          return `${value}`; // cast to string
        }

        if (typeof value === "string") {
          if (process.env.NODE_ENV !== "production") {
      // Allow '0' to pass through without warning. 0 is already special and
      // doesn't require units, so we don't need to warn about it.
            if (component && value !== "0") {
              const owner = component._currentElement._owner;
              const ownerName = owner ? owner.getName() : null;
              if (ownerName && !styleWarnings[ownerName]) {
              styleWarnings[ownerName] = {};
            }
              let warned = false;
              if (ownerName) {
              const warnings = styleWarnings[ownerName];
              warned = warnings[name];
              if (!warned) {
                warnings[name] = true;
              }
            }
              if (!warned) {
              process.env.NODE_ENV !== "production" ? warning(false, "a `%s` tag (owner: `%s`) was passed a numeric string value " + "for CSS property `%s` (value: `%s`) which will be treated " + "as a unitless number in a future version of React.", component._currentElement.type, ownerName || "unknown", name, value) : void 0;
            }
            }
          }
          value = value.trim();
        }
        return `${value}px`;
      }

      module.exports = dangerousStyleValue;
    }).call(this, require("_process"));
  }, { "./CSSProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\CSSProperty.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\escapeTextContentForBrowser.js": [function(require, module, exports) {
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Based on the escape-html library, which is used under the MIT License below:
 *
 * Copyright (c) 2012-2013 TJ Holowaychuk
 * Copyright (c) 2015 Andreas Lubbe
 * Copyright (c) 2015 Tiancheng "Timothy" Gu
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */


// code copied and modified from escape-html
/**
 * Module variables.
 * @private
 */

    const matchHtmlRegExp = /["'&<>]/;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

    function escapeHtml(string) {
      const str = `${string}`;
      const match = matchHtmlRegExp.exec(str);

      if (!match) {
        return str;
      }

      let escape;
      let html = "";
      let index = 0;
      let lastIndex = 0;

      for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
          case 34:
        // "
            escape = "&quot;";
            break;
          case 38:
        // &
            escape = "&amp;";
            break;
          case 39:
        // '
            escape = "&#x27;"; // modified from escape-html; used to be '&#39'
            break;
          case 60:
        // <
            escape = "&lt;";
            break;
          case 62:
        // >
            escape = "&gt;";
            break;
          default:
            continue;
        }

        if (lastIndex !== index) {
          html += str.substring(lastIndex, index);
        }

        lastIndex = index + 1;
        html += escape;
      }

      return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
    }
// end code copied and modified from escape-html


/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
    function escapeTextContentForBrowser(text) {
      if (typeof text === "boolean" || typeof text === "number") {
    // this shortcircuit helps perf for types that we know will never have
    // special characters, especially given that this function is used often
    // for numeric dom ids.
        return `${text}`;
      }
      return escapeHtml(text);
    }

    module.exports = escapeTextContentForBrowser;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\findDOMNode.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactCurrentOwner = require("react/lib/ReactCurrentOwner");
      const ReactDOMComponentTree = require("./ReactDOMComponentTree");
      const ReactInstanceMap = require("./ReactInstanceMap");

      const getHostComponentFromComposite = require("./getHostComponentFromComposite");
      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

/**
 * Returns the DOM node rendered by this element.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#reactdom.finddomnode
 *
 * @param {ReactComponent|DOMElement} componentOrElement
 * @return {?DOMElement} The root node of this element.
 */
      function findDOMNode(componentOrElement) {
        if (process.env.NODE_ENV !== "production") {
          const owner = ReactCurrentOwner.current;
          if (owner !== null) {
            process.env.NODE_ENV !== "production" ? warning(owner._warnedAboutRefsInRender, "%s is accessing findDOMNode inside its render(). " + "render() should be a pure function of props and state. It should " + "never access something that requires stale data from the previous " + "render, such as refs. Move this logic to componentDidMount and " + "componentDidUpdate instead.", owner.getName() || "A component") : void 0;
            owner._warnedAboutRefsInRender = true;
          }
        }
        if (componentOrElement == null) {
          return null;
        }
        if (componentOrElement.nodeType === 1) {
          return componentOrElement;
        }

        let inst = ReactInstanceMap.get(componentOrElement);
        if (inst) {
          inst = getHostComponentFromComposite(inst);
          return inst ? ReactDOMComponentTree.getNodeFromInstance(inst) : null;
        }

        if (typeof componentOrElement.render === "function") {
          !false ? process.env.NODE_ENV !== "production" ? invariant(false, "findDOMNode was called on an unmounted component.") : _prodInvariant("44") : void 0;
        } else {
          !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Element appears to be neither ReactComponent nor DOMNode (keys: %s)", Object.keys(componentOrElement)) : _prodInvariant("45", Object.keys(componentOrElement)) : void 0;
        }
      }

      module.exports = findDOMNode;
    }).call(this, require("_process"));
  }, { "./ReactDOMComponentTree": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactDOMComponentTree.js", "./ReactInstanceMap": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactInstanceMap.js", "./getHostComponentFromComposite": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getHostComponentFromComposite.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\flattenChildren.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const KeyEscapeUtils = require("./KeyEscapeUtils");
      const traverseAllChildren = require("./traverseAllChildren");
      const warning = require("fbjs/lib/warning");

      let ReactComponentTreeHook;

      if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") {
  // Temporary hack.
  // Inline requires don't work well with Jest:
  // https://github.com/facebook/react/issues/7240
  // Remove the inline requires when we don't need them anymore:
  // https://github.com/facebook/react/pull/7178
        ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
      }

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 * @param {number=} selfDebugID Optional debugID of the current internal instance.
 */
      function flattenSingleChildIntoContext(traverseContext, child, name, selfDebugID) {
  // We found a component instance.
        if (traverseContext && typeof traverseContext === "object") {
          const result = traverseContext;
          const keyUnique = result[name] === undefined;
          if (process.env.NODE_ENV !== "production") {
            if (!ReactComponentTreeHook) {
              ReactComponentTreeHook = require("react/lib/ReactComponentTreeHook");
            }
            if (!keyUnique) {
              process.env.NODE_ENV !== "production" ? warning(false, "flattenChildren(...): Encountered two children with the same key, " + "`%s`. Child keys must be unique; when two children share a key, only " + "the first child will be used.%s", KeyEscapeUtils.unescape(name), ReactComponentTreeHook.getStackAddendumByID(selfDebugID)) : void 0;
            }
          }
          if (keyUnique && child != null) {
            result[name] = child;
          }
        }
      }

/**
 * Flattens children that are typically specified as `props.children`. Any null
 * children will not be included in the resulting object.
 * @return {!object} flattened children keyed by name.
 */
      function flattenChildren(children, selfDebugID) {
        if (children == null) {
          return children;
        }
        const result = {};

        if (process.env.NODE_ENV !== "production") {
          traverseAllChildren(children, (traverseContext, child, name) => {
            return flattenSingleChildIntoContext(traverseContext, child, name, selfDebugID);
          }, result);
        } else {
          traverseAllChildren(children, flattenSingleChildIntoContext, result);
        }
        return result;
      }

      module.exports = flattenChildren;
    }).call(this, require("_process"));
  }, { "./KeyEscapeUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\KeyEscapeUtils.js", "./traverseAllChildren": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\traverseAllChildren.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\forEachAccumulated.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


/**
 * @param {array} arr an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 */

    function forEachAccumulated(arr, cb, scope) {
      if (Array.isArray(arr)) {
        arr.forEach(cb, scope);
      } else if (arr) {
        cb.call(scope, arr);
      }
    }

    module.exports = forEachAccumulated;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventCharCode.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {number} Normalized `charCode` property.
 */

    function getEventCharCode(nativeEvent) {
      let charCode;
      const keyCode = nativeEvent.keyCode;

      if ("charCode" in nativeEvent) {
        charCode = nativeEvent.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
        if (charCode === 0 && keyCode === 13) {
          charCode = 13;
        }
      } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
        charCode = keyCode;
      }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
      if (charCode >= 32 || charCode === 13) {
        return charCode;
      }

      return 0;
    }

    module.exports = getEventCharCode;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventKey.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const getEventCharCode = require("./getEventCharCode");

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
    const normalizeKey = {
      "Esc": "Escape",
      "Spacebar": " ",
      "Left": "ArrowLeft",
      "Up": "ArrowUp",
      "Right": "ArrowRight",
      "Down": "ArrowDown",
      "Del": "Delete",
      "Win": "OS",
      "Menu": "ContextMenu",
      "Apps": "ContextMenu",
      "Scroll": "ScrollLock",
      "MozPrintableKey": "Unidentified",
    };

/**
 * Translation from legacy `keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
    const translateToKey = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    };

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
    function getEventKey(nativeEvent) {
      if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
        const key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if (key !== "Unidentified") {
          return key;
        }
      }

  // Browser does not implement `key`, polyfill as much of it as we can.
      if (nativeEvent.type === "keypress") {
        const charCode = getEventCharCode(nativeEvent);

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
        return charCode === 13 ? "Enter" : String.fromCharCode(charCode);
      }
      if (nativeEvent.type === "keydown" || nativeEvent.type === "keyup") {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
        return translateToKey[nativeEvent.keyCode] || "Unidentified";
      }
      return "";
    }

    module.exports = getEventKey;
  }, { "./getEventCharCode": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventCharCode.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventModifierState.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

    const modifierKeyToProp = {
      "Alt": "altKey",
      "Control": "ctrlKey",
      "Meta": "metaKey",
      "Shift": "shiftKey",
    };

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
    function modifierStateGetter(keyArg) {
      const syntheticEvent = this;
      const nativeEvent = syntheticEvent.nativeEvent;
      if (nativeEvent.getModifierState) {
        return nativeEvent.getModifierState(keyArg);
      }
      const keyProp = modifierKeyToProp[keyArg];
      return keyProp ? !!nativeEvent[keyProp] : false;
    }

    function getEventModifierState(nativeEvent) {
      return modifierStateGetter;
    }

    module.exports = getEventModifierState;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getEventTarget.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */

    function getEventTarget(nativeEvent) {
      let target = nativeEvent.target || nativeEvent.srcElement || window;

  // Normalize SVG <use> element events #4963
      if (target.correspondingUseElement) {
        target = target.correspondingUseElement;
      }

  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
      return target.nodeType === 3 ? target.parentNode : target;
    }

    module.exports = getEventTarget;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getHostComponentFromComposite.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ReactNodeTypes = require("./ReactNodeTypes");

    function getHostComponentFromComposite(inst) {
      let type;

      while ((type = inst._renderedNodeType) === ReactNodeTypes.COMPOSITE) {
        inst = inst._renderedComponent;
      }

      if (type === ReactNodeTypes.HOST) {
        return inst._renderedComponent;
      } else if (type === ReactNodeTypes.EMPTY) {
        return null;
      }
    }

    module.exports = getHostComponentFromComposite;
  }, { "./ReactNodeTypes": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactNodeTypes.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getIteratorFn.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


/* global Symbol */

    const ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
    const FAUX_ITERATOR_SYMBOL = "@@iterator"; // Before Symbol spec.

/**
 * Returns the iterator method function contained on the iterable object.
 *
 * Be sure to invoke the function with the iterable as context:
 *
 *     var iteratorFn = getIteratorFn(myIterable);
 *     if (iteratorFn) {
 *       var iterator = iteratorFn.call(myIterable);
 *       ...
 *     }
 *
 * @param {?object} maybeIterable
 * @return {?function}
 */
    function getIteratorFn(maybeIterable) {
      const iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
      if (typeof iteratorFn === "function") {
        return iteratorFn;
      }
    }

    module.exports = getIteratorFn;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getNextDebugID.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


    let nextDebugID = 1;

    function getNextDebugID() {
      return nextDebugID++;
    }

    module.exports = getNextDebugID;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getNodeForCharacterOffset.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */

    function getLeafNode(node) {
      while (node && node.firstChild) {
        node = node.firstChild;
      }
      return node;
    }

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
    function getSiblingNode(node) {
      while (node) {
        if (node.nextSibling) {
          return node.nextSibling;
        }
        node = node.parentNode;
      }
    }

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
    function getNodeForCharacterOffset(root, offset) {
      let node = getLeafNode(root);
      let nodeStart = 0;
      let nodeEnd = 0;

      while (node) {
        if (node.nodeType === 3) {
          nodeEnd = nodeStart + node.textContent.length;

          if (nodeStart <= offset && nodeEnd >= offset) {
            return {
              node,
              offset: offset - nodeStart,
            };
          }

          nodeStart = nodeEnd;
        }

        node = getLeafNode(getSiblingNode(node));
      }
    }

    module.exports = getNodeForCharacterOffset;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getTextContentAccessor.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

    let contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
    function getTextContentAccessor() {
      if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
        contentKey = "textContent" in document.documentElement ? "textContent" : "innerText";
      }
      return contentKey;
    }

    module.exports = getTextContentAccessor;
  }, { "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getVendorPrefixedEventName.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

/**
 * Generate a mapping of standard vendor prefixes using the defined style property and event name.
 *
 * @param {string} styleProp
 * @param {string} eventName
 * @returns {object}
 */
    function makePrefixMap(styleProp, eventName) {
      const prefixes = {};

      prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
      prefixes[`Webkit${styleProp}`] = `webkit${eventName}`;
      prefixes[`Moz${styleProp}`] = `moz${eventName}`;
      prefixes[`ms${styleProp}`] = `MS${eventName}`;
      prefixes[`O${styleProp}`] = `o${eventName.toLowerCase()}`;

      return prefixes;
    }

/**
 * A list of event names to a configurable list of vendor prefixes.
 */
    const vendorPrefixes = {
      animationend: makePrefixMap("Animation", "AnimationEnd"),
      animationiteration: makePrefixMap("Animation", "AnimationIteration"),
      animationstart: makePrefixMap("Animation", "AnimationStart"),
      transitionend: makePrefixMap("Transition", "TransitionEnd"),
    };

/**
 * Event names that have already been detected and prefixed (if applicable).
 */
    const prefixedEventNames = {};

/**
 * Element to check for prefixes on.
 */
    let style = {};

/**
 * Bootstrap if a DOM exists.
 */
    if (ExecutionEnvironment.canUseDOM) {
      style = document.createElement("div").style;

  // On some platforms, in particular some releases of Android 4.x,
  // the un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are usable, and if not remove them from the map.
      if (!("AnimationEvent" in window)) {
        delete vendorPrefixes.animationend.animation;
        delete vendorPrefixes.animationiteration.animation;
        delete vendorPrefixes.animationstart.animation;
      }

  // Same as above
      if (!("TransitionEvent" in window)) {
        delete vendorPrefixes.transitionend.transition;
      }
    }

/**
 * Attempts to determine the correct vendor prefixed event name.
 *
 * @param {string} eventName
 * @returns {string}
 */
    function getVendorPrefixedEventName(eventName) {
      if (prefixedEventNames[eventName]) {
        return prefixedEventNames[eventName];
      } else if (!vendorPrefixes[eventName]) {
        return eventName;
      }

      const prefixMap = vendorPrefixes[eventName];

      for (const styleProp in prefixMap) {
        if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
          return prefixedEventNames[eventName] = prefixMap[styleProp];
        }
      }

      return "";
    }

    module.exports = getVendorPrefixedEventName;
  }, { "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\instantiateReactComponent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const ReactCompositeComponent = require("./ReactCompositeComponent");
      const ReactEmptyComponent = require("./ReactEmptyComponent");
      const ReactHostComponent = require("./ReactHostComponent");

      const getNextDebugID = require("./getNextDebugID");
      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

// To avoid a cyclic dependency, we create the final class in this module
      const ReactCompositeComponentWrapper = function(element) {
        this.construct(element);
      };
      _assign(ReactCompositeComponentWrapper.prototype, ReactCompositeComponent, {
        _instantiateReactComponent: instantiateReactComponent,
      });

      function getDeclarationErrorAddendum(owner) {
        if (owner) {
          const name = owner.getName();
          if (name) {
            return ` Check the render method of \`${name}\`.`;
          }
        }
        return "";
      }

/**
 * Check if the type reference is a known internal type. I.e. not a user
 * provided composite type.
 *
 * @param {function} type
 * @return {boolean} Returns true if this is a valid internal type.
 */
      function isInternalComponentType(type) {
        return typeof type === "function" && typeof type.prototype !== "undefined" && typeof type.prototype.mountComponent === "function" && typeof type.prototype.receiveComponent === "function";
      }

/**
 * Given a ReactNode, create an instance that will actually be mounted.
 *
 * @param {ReactNode} node
 * @param {boolean} shouldHaveDebugID
 * @return {object} A new instance of the element's constructor.
 * @protected
 */
      function instantiateReactComponent(node, shouldHaveDebugID) {
        let instance;

        if (node === null || node === false) {
          instance = ReactEmptyComponent.create(instantiateReactComponent);
        } else if (typeof node === "object") {
          const element = node;
          const type = element.type;
          if (typeof type !== "function" && typeof type !== "string") {
            let info = "";
            if (process.env.NODE_ENV !== "production") {
              if (type === undefined || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file " + "it's defined in.";
            }
            }
            info += getDeclarationErrorAddendum(element._owner);
            !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", type == null ? type : typeof type, info) : _prodInvariant("130", type == null ? type : typeof type, info) : void 0;
          }

    // Special case string values
          if (typeof element.type === "string") {
            instance = ReactHostComponent.createInternalComponent(element);
          } else if (isInternalComponentType(element.type)) {
      // This is temporarily available for custom components that are not string
      // representations. I.e. ART. Once those are updated to use the string
      // representation, we can drop this code path.
            instance = new element.type(element);

      // We renamed this. Allow the old name for compat. :(
            if (!instance.getHostNode) {
            instance.getHostNode = instance.getNativeNode;
          }
          } else {
            instance = new ReactCompositeComponentWrapper(element);
          }
        } else if (typeof node === "string" || typeof node === "number") {
          instance = ReactHostComponent.createInstanceForText(node);
        } else {
          !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Encountered invalid React node of type %s", typeof node) : _prodInvariant("131", typeof node) : void 0;
        }

        if (process.env.NODE_ENV !== "production") {
          process.env.NODE_ENV !== "production" ? warning(typeof instance.mountComponent === "function" && typeof instance.receiveComponent === "function" && typeof instance.getHostNode === "function" && typeof instance.unmountComponent === "function", "Only React Components can be mounted.") : void 0;
        }

  // These two fields are used by the DOM and ART diffing algorithms
  // respectively. Instead of using expandos on components, we should be
  // storing the state needed by the diffing algorithms elsewhere.
        instance._mountIndex = 0;
        instance._mountImage = null;

        if (process.env.NODE_ENV !== "production") {
          instance._debugID = shouldHaveDebugID ? getNextDebugID() : 0;
        }

  // Internal instances should fully constructed at this point, so they should
  // not get any new fields added to them at this point.
        if (process.env.NODE_ENV !== "production") {
          if (Object.preventExtensions) {
            Object.preventExtensions(instance);
          }
        }

        return instance;
      }

      module.exports = instantiateReactComponent;
    }).call(this, require("_process"));
  }, { "./ReactCompositeComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactCompositeComponent.js", "./ReactEmptyComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactEmptyComponent.js", "./ReactHostComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactHostComponent.js", "./getNextDebugID": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getNextDebugID.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isEventSupported.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");

    let useHasFeature;
    if (ExecutionEnvironment.canUseDOM) {
      useHasFeature = document.implementation && document.implementation.hasFeature &&
  // always returns true in newer browsers as per the standard.
  // @see http://dom.spec.whatwg.org/#dom-domimplementation-hasfeature
  document.implementation.hasFeature("", "") !== true;
    }

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
    function isEventSupported(eventNameSuffix, capture) {
      if (!ExecutionEnvironment.canUseDOM || capture && !("addEventListener" in document)) {
        return false;
      }

      const eventName = `on${eventNameSuffix}`;
      let isSupported = eventName in document;

      if (!isSupported) {
        const element = document.createElement("div");
        element.setAttribute(eventName, "return;");
        isSupported = typeof element[eventName] === "function";
      }

      if (!isSupported && useHasFeature && eventNameSuffix === "wheel") {
    // This is the only way to test support for the `wheel` event in IE9+.
        isSupported = document.implementation.hasFeature("Events.wheel", "3.0");
      }

      return isSupported;
    }

    module.exports = isEventSupported;
  }, { "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\isTextInputElement.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */

    const supportedInputTypes = {
      "color": true,
      "date": true,
      "datetime": true,
      "datetime-local": true,
      "email": true,
      "month": true,
      "number": true,
      "password": true,
      "range": true,
      "search": true,
      "tel": true,
      "text": true,
      "time": true,
      "url": true,
      "week": true,
    };

    function isTextInputElement(elem) {
      const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

      if (nodeName === "input") {
        return !!supportedInputTypes[elem.type];
      }

      if (nodeName === "textarea") {
        return true;
      }

      return false;
    }

    module.exports = isTextInputElement;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\quoteAttributeValueForBrowser.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const escapeTextContentForBrowser = require("./escapeTextContentForBrowser");

/**
 * Escapes attribute value to prevent scripting attacks.
 *
 * @param {*} value Value to escape.
 * @return {string} An escaped string.
 */
    function quoteAttributeValueForBrowser(value) {
      return `"${escapeTextContentForBrowser(value)}"`;
    }

    module.exports = quoteAttributeValueForBrowser;
  }, { "./escapeTextContentForBrowser": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\escapeTextContentForBrowser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js": [function(require, module, exports) {
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


/**
 * WARNING: DO NOT manually require this module.
 * This is a replacement for `invariant(...)` used by the error code system
 * and will _only_ be required by the corresponding babel pass.
 * It always throws.
 */

    function reactProdInvariant(code) {
      const argCount = arguments.length - 1;

      let message = `Minified React error #${code}; visit ` + `http://facebook.github.io/react/docs/error-decoder.html?invariant=${code}`;

      for (let argIdx = 0; argIdx < argCount; argIdx++) {
        message += `&args[]=${encodeURIComponent(arguments[argIdx + 1])}`;
      }

      message += " for the full message or use the non-minified dev environment" + " for full errors and additional helpful warnings.";

      const error = new Error(message);
      error.name = "Invariant Violation";
      error.framesToPop = 1; // we don't care about reactProdInvariant's own frame

      throw error;
    }

    module.exports = reactProdInvariant;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\renderSubtreeIntoContainer.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ReactMount = require("./ReactMount");

    module.exports = ReactMount.renderSubtreeIntoContainer;
  }, { "./ReactMount": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactMount.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setInnerHTML.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
    const DOMNamespaces = require("./DOMNamespaces");

    const WHITESPACE_TEST = /^[ \r\n\t\f]/;
    const NONVISIBLE_TEST = /<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/;

    const createMicrosoftUnsafeLocalFunction = require("./createMicrosoftUnsafeLocalFunction");

// SVG temp container for IE lacking innerHTML
    let reusableSVGContainer;

/**
 * Set the innerHTML property of a node, ensuring that whitespace is preserved
 * even in IE8.
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
    let setInnerHTML = createMicrosoftUnsafeLocalFunction((node, html) => {
  // IE does not have innerHTML for SVG nodes, so instead we inject the
  // new markup in a temp node and then move the child nodes across into
  // the target node
      if (node.namespaceURI === DOMNamespaces.svg && !("innerHTML" in node)) {
        reusableSVGContainer = reusableSVGContainer || document.createElement("div");
        reusableSVGContainer.innerHTML = `<svg>${html}</svg>`;
        const svgNode = reusableSVGContainer.firstChild;
        while (svgNode.firstChild) {
          node.appendChild(svgNode.firstChild);
        }
      } else {
        node.innerHTML = html;
      }
    });

    if (ExecutionEnvironment.canUseDOM) {
  // IE8: When updating a just created node with innerHTML only leading
  // whitespace is removed. When updating an existing node with innerHTML
  // whitespace in root TextNodes is also collapsed.
  // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html

  // Feature detection; only IE8 is known to behave improperly like this.
      let testElement = document.createElement("div");
      testElement.innerHTML = " ";
      if (testElement.innerHTML === "") {
        setInnerHTML = function(node, html) {
      // Magic theory: IE8 supposedly differentiates between added and updated
      // nodes when processing innerHTML, innerHTML on updated nodes suffers
      // from worse whitespace behavior. Re-adding a node like this triggers
      // the initial and more favorable whitespace behavior.
      // TODO: What to do on a detached node?
          if (node.parentNode) {
            node.parentNode.replaceChild(node, node);
          }

      // We also implement a workaround for non-visible tags disappearing into
      // thin air on IE8, this only happens if there is no visible text
      // in-front of the non-visible tags. Piggyback on the whitespace fix
      // and simply check if any non-visible tags appear in the source.
          if (WHITESPACE_TEST.test(html) || html[0] === "<" && NONVISIBLE_TEST.test(html)) {
        // Recover leading whitespace by temporarily prepending any character.
        // \uFEFF has the potential advantage of being zero-width/invisible.
        // UglifyJS drops U+FEFF chars when parsing, so use String.fromCharCode
        // in hopes that this is preserved even if "\uFEFF" is transformed to
        // the actual Unicode character (by Babel, for example).
        // https://github.com/mishoo/UglifyJS2/blob/v2.4.20/lib/parse.js#L216
            node.innerHTML = String.fromCharCode(0xFEFF) + html;

        // deleteData leaves an empty `TextNode` which offsets the index of all
        // children. Definitely want to avoid this.
            const textNode = node.firstChild;
            if (textNode.data.length === 1) {
              node.removeChild(textNode);
            } else {
              textNode.deleteData(0, 1);
            }
          } else {
            node.innerHTML = html;
          }
        };
      }
      testElement = null;
    }

    module.exports = setInnerHTML;
  }, { "./DOMNamespaces": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\DOMNamespaces.js", "./createMicrosoftUnsafeLocalFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\createMicrosoftUnsafeLocalFunction.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setTextContent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
    const escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
    const setInnerHTML = require("./setInnerHTML");

/**
 * Set the textContent property of a node, ensuring that whitespace is preserved
 * even in IE8. innerText is a poor substitute for textContent and, among many
 * issues, inserts <br> instead of the literal newline chars. innerHTML behaves
 * as it should.
 *
 * @param {DOMElement} node
 * @param {string} text
 * @internal
 */
    let setTextContent = function(node, text) {
      if (text) {
        const firstChild = node.firstChild;

        if (firstChild && firstChild === node.lastChild && firstChild.nodeType === 3) {
          firstChild.nodeValue = text;
          return;
        }
      }
      node.textContent = text;
    };

    if (ExecutionEnvironment.canUseDOM) {
      if (!("textContent" in document.documentElement)) {
        setTextContent = function(node, text) {
          if (node.nodeType === 3) {
            node.nodeValue = text;
            return;
          }
          setInnerHTML(node, escapeTextContentForBrowser(text));
        };
      }
    }

    module.exports = setTextContent;
  }, { "./escapeTextContentForBrowser": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\escapeTextContentForBrowser.js", "./setInnerHTML": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\setInnerHTML.js", "fbjs/lib/ExecutionEnvironment": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\ExecutionEnvironment.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\shouldUpdateReactComponent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


/**
 * Given a `prevElement` and `nextElement`, determines if the existing
 * instance should be updated as opposed to being destroyed or replaced by a new
 * instance. Both arguments are elements. This ensures that this logic can
 * operate on stateless trees without any backing instance.
 *
 * @param {?object} prevElement
 * @param {?object} nextElement
 * @return {boolean} True if the existing instance should be updated.
 * @protected
 */

    function shouldUpdateReactComponent(prevElement, nextElement) {
      const prevEmpty = prevElement === null || prevElement === false;
      const nextEmpty = nextElement === null || nextElement === false;
      if (prevEmpty || nextEmpty) {
        return prevEmpty === nextEmpty;
      }

      const prevType = typeof prevElement;
      const nextType = typeof nextElement;
      if (prevType === "string" || prevType === "number") {
        return nextType === "string" || nextType === "number";
      }
      return nextType === "object" && prevElement.type === nextElement.type && prevElement.key === nextElement.key;
    }

    module.exports = shouldUpdateReactComponent;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\traverseAllChildren.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactCurrentOwner = require("react/lib/ReactCurrentOwner");
      const REACT_ELEMENT_TYPE = require("./ReactElementSymbol");

      const getIteratorFn = require("./getIteratorFn");
      const invariant = require("fbjs/lib/invariant");
      const KeyEscapeUtils = require("./KeyEscapeUtils");
      const warning = require("fbjs/lib/warning");

      const SEPARATOR = ".";
      const SUBSEPARATOR = ":";

/**
 * This is inlined from ReactElement since this file is shared between
 * isomorphic and renderers. We could extract this to a
 *
 */

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

      let didWarnAboutMaps = false;

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
      function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
        if (component && typeof component === "object" && component.key != null) {
    // Explicit key
          return KeyEscapeUtils.escape(component.key);
        }
  // Implicit key determined by the index in the set
        return index.toString(36);
      }

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
      function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
        const type = typeof children;

        if (type === "undefined" || type === "boolean") {
    // All of the above are perceived as null.
          children = null;
        }

        if (children === null || type === "string" || type === "number" ||
  // The following is inlined from ReactElement. This means we can optimize
  // some checks. React Fiber also inlines this logic for similar purposes.
  type === "object" && children.$$typeof === REACT_ELEMENT_TYPE) {
          callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === "" ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
          return 1;
        }

        let child;
        let nextName;
        let subtreeCount = 0; // Count of children found in the current subtree.
        const nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;

        if (Array.isArray(children)) {
          for (let i = 0; i < children.length; i++) {
            child = children[i];
            nextName = nextNamePrefix + getComponentKey(child, i);
            subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
          }
        } else {
          const iteratorFn = getIteratorFn(children);
          if (iteratorFn) {
            const iterator = iteratorFn.call(children);
            let step;
            if (iteratorFn !== children.entries) {
              let ii = 0;
              while (!(step = iterator.next()).done) {
              child = step.value;
              nextName = nextNamePrefix + getComponentKey(child, ii++);
              subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
            }
            } else {
              if (process.env.NODE_ENV !== "production") {
              let mapsAsChildrenAddendum = "";
              if (ReactCurrentOwner.current) {
                const mapsAsChildrenOwnerName = ReactCurrentOwner.current.getName();
                if (mapsAsChildrenOwnerName) {
                  mapsAsChildrenAddendum = ` Check the render method of \`${mapsAsChildrenOwnerName}\`.`;
                }
              }
              process.env.NODE_ENV !== "production" ? warning(didWarnAboutMaps, "Using Maps as children is not yet fully supported. It is an " + "experimental feature that might be removed. Convert it to a " + "sequence / iterable of keyed ReactElements instead.%s", mapsAsChildrenAddendum) : void 0;
              didWarnAboutMaps = true;
            }
        // Iterator will provide entry [k,v] tuples rather than values.
              while (!(step = iterator.next()).done) {
              const entry = step.value;
              if (entry) {
                child = entry[1];
                nextName = nextNamePrefix + KeyEscapeUtils.escape(entry[0]) + SUBSEPARATOR + getComponentKey(child, 0);
                subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
              }
            }
            }
          } else if (type === "object") {
            let addendum = "";
            if (process.env.NODE_ENV !== "production") {
            addendum = " If you meant to render a collection of children, use an array " + "instead or wrap the object using createFragment(object) from the " + "React add-ons.";
            if (children._isReactElement) {
              addendum = " It looks like you're using an element created by a different " + "version of React. Make sure to use only one copy of React.";
            }
            if (ReactCurrentOwner.current) {
              const name = ReactCurrentOwner.current.getName();
              if (name) {
                addendum += ` Check the render method of \`${name}\`.`;
              }
            }
          }
            const childrenString = String(children);
            !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Objects are not valid as a React child (found: %s).%s", childrenString === "[object Object]" ? `object with keys {${Object.keys(children).join(", ")}}` : childrenString, addendum) : _prodInvariant("31", childrenString === "[object Object]" ? `object with keys {${Object.keys(children).join(", ")}}` : childrenString, addendum) : void 0;
          }
        }

        return subtreeCount;
      }

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
      function traverseAllChildren(children, callback, traverseContext) {
        if (children == null) {
          return 0;
        }

        return traverseAllChildrenImpl(children, "", callback, traverseContext);
      }

      module.exports = traverseAllChildren;
    }).call(this, require("_process"));
  }, { "./KeyEscapeUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\KeyEscapeUtils.js", "./ReactElementSymbol": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactElementSymbol.js", "./getIteratorFn": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getIteratorFn.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "react/lib/ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\validateDOMNesting.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const emptyFunction = require("fbjs/lib/emptyFunction");
      const warning = require("fbjs/lib/warning");

      let validateDOMNesting = emptyFunction;

      if (process.env.NODE_ENV !== "production") {
  // This validation code was written based on the HTML5 parsing spec:
  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-scope
  //
  // Note: this does not catch all invalid nesting, nor does it try to (as it's
  // not clear what practical benefit doing so provides); instead, we warn only
  // for cases where the parser will give a parse tree differing from what React
  // intended. For example, <b><div></div></b> is invalid but we don't warn
  // because it still parses correctly; we do warn for other cases like nested
  // <p> tags where the beginning of the second element implicitly closes the
  // first, causing a confusing mess.

  // https://html.spec.whatwg.org/multipage/syntax.html#special
        const specialTags = ["address", "applet", "area", "article", "aside", "base", "basefont", "bgsound", "blockquote", "body", "br", "button", "caption", "center", "col", "colgroup", "dd", "details", "dir", "div", "dl", "dt", "embed", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "iframe", "img", "input", "isindex", "li", "link", "listing", "main", "marquee", "menu", "menuitem", "meta", "nav", "noembed", "noframes", "noscript", "object", "ol", "p", "param", "plaintext", "pre", "script", "section", "select", "source", "style", "summary", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "title", "tr", "track", "ul", "wbr", "xmp"];

  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-scope
        const inScopeTags = ["applet", "caption", "html", "table", "td", "th", "marquee", "object", "template",

  // https://html.spec.whatwg.org/multipage/syntax.html#html-integration-point
  // TODO: Distinguish by namespace here -- for <title>, including it here
  // errs on the side of fewer warnings
          "foreignObject", "desc", "title"];

  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-button-scope
        const buttonScopeTags = inScopeTags.concat(["button"]);

  // https://html.spec.whatwg.org/multipage/syntax.html#generate-implied-end-tags
        const impliedEndTags = ["dd", "dt", "li", "option", "optgroup", "p", "rp", "rt"];

        const emptyAncestorInfo = {
          current: null,

          formTag: null,
          aTagInScope: null,
          buttonTagInScope: null,
          nobrTagInScope: null,
          pTagInButtonScope: null,

          listItemTagAutoclosing: null,
          dlItemTagAutoclosing: null,
        };

        const updatedAncestorInfo = function(oldInfo, tag, instance) {
          const ancestorInfo = _assign({}, oldInfo || emptyAncestorInfo);
          const info = { tag, instance };

          if (inScopeTags.indexOf(tag) !== -1) {
            ancestorInfo.aTagInScope = null;
            ancestorInfo.buttonTagInScope = null;
            ancestorInfo.nobrTagInScope = null;
          }
          if (buttonScopeTags.indexOf(tag) !== -1) {
            ancestorInfo.pTagInButtonScope = null;
          }

    // See rules for 'li', 'dd', 'dt' start tags in
    // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
          if (specialTags.indexOf(tag) !== -1 && tag !== "address" && tag !== "div" && tag !== "p") {
            ancestorInfo.listItemTagAutoclosing = null;
            ancestorInfo.dlItemTagAutoclosing = null;
          }

          ancestorInfo.current = info;

          if (tag === "form") {
            ancestorInfo.formTag = info;
          }
          if (tag === "a") {
            ancestorInfo.aTagInScope = info;
          }
          if (tag === "button") {
            ancestorInfo.buttonTagInScope = info;
          }
          if (tag === "nobr") {
            ancestorInfo.nobrTagInScope = info;
          }
          if (tag === "p") {
            ancestorInfo.pTagInButtonScope = info;
          }
          if (tag === "li") {
            ancestorInfo.listItemTagAutoclosing = info;
          }
          if (tag === "dd" || tag === "dt") {
            ancestorInfo.dlItemTagAutoclosing = info;
          }

          return ancestorInfo;
        };

  /**
   * Returns whether
   */
        const isTagValidWithParent = function(tag, parentTag) {
    // First, let's check if we're in an unusual parsing mode...
          switch (parentTag) {
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
            case "select":
              return tag === "option" || tag === "optgroup" || tag === "#text";
            case "optgroup":
              return tag === "option" || tag === "#text";
      // Strictly speaking, seeing an <option> doesn't mean we're in a <select>
      // but
            case "option":
              return tag === "#text";

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
      // No special behavior since these rules fall back to "in body" mode for
      // all except special table nodes which cause bad parsing behavior anyway.

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
            case "tr":
              return tag === "th" || tag === "td" || tag === "style" || tag === "script" || tag === "template";

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
            case "tbody":
            case "thead":
            case "tfoot":
              return tag === "tr" || tag === "style" || tag === "script" || tag === "template";

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
            case "colgroup":
              return tag === "col" || tag === "template";

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
            case "table":
              return tag === "caption" || tag === "colgroup" || tag === "tbody" || tag === "tfoot" || tag === "thead" || tag === "style" || tag === "script" || tag === "template";

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
            case "head":
              return tag === "base" || tag === "basefont" || tag === "bgsound" || tag === "link" || tag === "meta" || tag === "title" || tag === "noscript" || tag === "noframes" || tag === "style" || tag === "script" || tag === "template";

      // https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
            case "html":
              return tag === "head" || tag === "body";
            case "#document":
              return tag === "html";
          }

    // Probably in the "in body" parsing mode, so we outlaw only tag combos
    // where the parsing rules cause implicit opens or closes to be added.
    // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
          switch (tag) {
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              return parentTag !== "h1" && parentTag !== "h2" && parentTag !== "h3" && parentTag !== "h4" && parentTag !== "h5" && parentTag !== "h6";

            case "rp":
            case "rt":
              return impliedEndTags.indexOf(parentTag) === -1;

            case "body":
            case "caption":
            case "col":
            case "colgroup":
            case "frame":
            case "head":
            case "html":
            case "tbody":
            case "td":
            case "tfoot":
            case "th":
            case "thead":
            case "tr":
        // These tags are only valid with a few parents that have special child
        // parsing rules -- if we're down here, then none of those matched and
        // so we allow it only if we don't know what the parent is, as all other
        // cases are invalid.
              return parentTag == null;
          }

          return true;
        };

  /**
   * Returns whether
   */
        const findInvalidAncestorForTag = function(tag, ancestorInfo) {
          switch (tag) {
            case "address":
            case "article":
            case "aside":
            case "blockquote":
            case "center":
            case "details":
            case "dialog":
            case "dir":
            case "div":
            case "dl":
            case "fieldset":
            case "figcaption":
            case "figure":
            case "footer":
            case "header":
            case "hgroup":
            case "main":
            case "menu":
            case "nav":
            case "ol":
            case "p":
            case "section":
            case "summary":
            case "ul":

            case "pre":
            case "listing":

            case "table":

            case "hr":

            case "xmp":

            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              return ancestorInfo.pTagInButtonScope;

            case "form":
              return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;

            case "li":
              return ancestorInfo.listItemTagAutoclosing;

            case "dd":
            case "dt":
              return ancestorInfo.dlItemTagAutoclosing;

            case "button":
              return ancestorInfo.buttonTagInScope;

            case "a":
        // Spec says something about storing a list of markers, but it sounds
        // equivalent to this check.
              return ancestorInfo.aTagInScope;

            case "nobr":
              return ancestorInfo.nobrTagInScope;
          }

          return null;
        };

  /**
   * Given a ReactCompositeComponent instance, return a list of its recursive
   * owners, starting at the root and ending with the instance itself.
   */
        const findOwnerStack = function(instance) {
          if (!instance) {
            return [];
          }

          const stack = [];
          do {
            stack.push(instance);
          } while (instance = instance._currentElement._owner);
          stack.reverse();
          return stack;
        };

        const didWarn = {};

        validateDOMNesting = function(childTag, childText, childInstance, ancestorInfo) {
          ancestorInfo = ancestorInfo || emptyAncestorInfo;
          const parentInfo = ancestorInfo.current;
          const parentTag = parentInfo && parentInfo.tag;

          if (childText != null) {
            process.env.NODE_ENV !== "production" ? warning(childTag == null, "validateDOMNesting: when childText is passed, childTag should be null") : void 0;
            childTag = "#text";
          }

          const invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
          const invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
          const problematic = invalidParent || invalidAncestor;

          if (problematic) {
            const ancestorTag = problematic.tag;
            const ancestorInstance = problematic.instance;

            const childOwner = childInstance && childInstance._currentElement._owner;
            const ancestorOwner = ancestorInstance && ancestorInstance._currentElement._owner;

            const childOwners = findOwnerStack(childOwner);
            const ancestorOwners = findOwnerStack(ancestorOwner);

            const minStackLen = Math.min(childOwners.length, ancestorOwners.length);
            let i;

            let deepestCommon = -1;
            for (i = 0; i < minStackLen; i++) {
              if (childOwners[i] === ancestorOwners[i]) {
              deepestCommon = i;
            } else {
              break;
            }
            }

            const UNKNOWN = "(unknown)";
            const childOwnerNames = childOwners.slice(deepestCommon + 1).map((inst) => {
              return inst.getName() || UNKNOWN;
            });
            const ancestorOwnerNames = ancestorOwners.slice(deepestCommon + 1).map((inst) => {
              return inst.getName() || UNKNOWN;
            });
            const ownerInfo = [].concat(
      // If the parent and child instances have a common owner ancestor, start
      // with that -- otherwise we just start with the parent's owners.
      deepestCommon !== -1 ? childOwners[deepestCommon].getName() || UNKNOWN : [], ancestorOwnerNames, ancestorTag,
      // If we're warning about an invalid (non-parent) ancestry, add '...'
      invalidAncestor ? ["..."] : [], childOwnerNames, childTag).join(" > ");

            const warnKey = `${!!invalidParent}|${childTag}|${ancestorTag}|${ownerInfo}`;
            if (didWarn[warnKey]) {
              return;
            }
            didWarn[warnKey] = true;

            let tagDisplayName = childTag;
            let whitespaceInfo = "";
            if (childTag === "#text") {
              if (/\S/.test(childText)) {
              tagDisplayName = "Text nodes";
            } else {
              tagDisplayName = "Whitespace text nodes";
              whitespaceInfo = " Make sure you don't have any extra whitespace between tags on " + "each line of your source code.";
            }
            } else {
              tagDisplayName = `<${childTag}>`;
            }

            if (invalidParent) {
              let info = "";
              if (ancestorTag === "table" && childTag === "tr") {
              info += " Add a <tbody> to your code to match the DOM tree generated by " + "the browser.";
            }
              process.env.NODE_ENV !== "production" ? warning(false, "validateDOMNesting(...): %s cannot appear as a child of <%s>.%s " + "See %s.%s", tagDisplayName, ancestorTag, whitespaceInfo, ownerInfo, info) : void 0;
            } else {
              process.env.NODE_ENV !== "production" ? warning(false, "validateDOMNesting(...): %s cannot appear as a descendant of " + "<%s>. See %s.", tagDisplayName, ancestorTag, ownerInfo) : void 0;
            }
          }
        };

        validateDOMNesting.updatedAncestorInfo = updatedAncestorInfo;

  // For testing
        validateDOMNesting.isTagValidInContext = function(tag, ancestorInfo) {
          ancestorInfo = ancestorInfo || emptyAncestorInfo;
          const parentInfo = ancestorInfo.current;
          const parentTag = parentInfo && parentInfo.tag;
          return isTagValidWithParent(tag, parentTag) && !findInvalidAncestorForTag(tag, ancestorInfo);
        };
      }

      module.exports = validateDOMNesting;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\KeyEscapeUtils.js": [function(require, module, exports) {
    arguments[4]["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\KeyEscapeUtils.js"][0].apply(exports, arguments);
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\PooledClass.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const invariant = require("fbjs/lib/invariant");

/**
 * Static poolers. Several custom versions for each potential number of
 * arguments. A completely generic pooler is easy to implement, but would
 * require accessing the `arguments` object. In each of these, `this` refers to
 * the Class itself, not an instance. If any others are needed, simply add them
 * here, or in their own files.
 */
      const oneArgumentPooler = function(copyFieldsFrom) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, copyFieldsFrom);
          return instance;
        }
        return new Klass(copyFieldsFrom);
      };

      const twoArgumentPooler = function(a1, a2) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, a1, a2);
          return instance;
        }
        return new Klass(a1, a2);
      };

      const threeArgumentPooler = function(a1, a2, a3) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, a1, a2, a3);
          return instance;
        }
        return new Klass(a1, a2, a3);
      };

      const fourArgumentPooler = function(a1, a2, a3, a4) {
        const Klass = this;
        if (Klass.instancePool.length) {
          const instance = Klass.instancePool.pop();
          Klass.call(instance, a1, a2, a3, a4);
          return instance;
        }
        return new Klass(a1, a2, a3, a4);
      };

      const standardReleaser = function(instance) {
        const Klass = this;
        !(instance instanceof Klass) ? process.env.NODE_ENV !== "production" ? invariant(false, "Trying to release an instance into a pool of a different type.") : _prodInvariant("25") : void 0;
        instance.destructor();
        if (Klass.instancePool.length < Klass.poolSize) {
          Klass.instancePool.push(instance);
        }
      };

      const DEFAULT_POOL_SIZE = 10;
      const DEFAULT_POOLER = oneArgumentPooler;

/**
 * Augments `CopyConstructor` to be a poolable class, augmenting only the class
 * itself (statically) not adding any prototypical fields. Any CopyConstructor
 * you give this may have a `poolSize` property, and will look for a
 * prototypical `destructor` on instances.
 *
 * @param {Function} CopyConstructor Constructor that can be used to reset.
 * @param {Function} pooler Customizable pooler.
 */
      const addPoolingTo = function(CopyConstructor, pooler) {
  // Casting as any so that flow ignores the actual implementation and trusts
  // it to match the type we declared
        const NewKlass = CopyConstructor;
        NewKlass.instancePool = [];
        NewKlass.getPooled = pooler || DEFAULT_POOLER;
        if (!NewKlass.poolSize) {
          NewKlass.poolSize = DEFAULT_POOL_SIZE;
        }
        NewKlass.release = standardReleaser;
        return NewKlass;
      };

      const PooledClass = {
        addPoolingTo,
        oneArgumentPooler,
        twoArgumentPooler,
        threeArgumentPooler,
        fourArgumentPooler,
      };

      module.exports = PooledClass;
    }).call(this, require("_process"));
  }, { "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const ReactChildren = require("./ReactChildren");
      const ReactComponent = require("./ReactComponent");
      const ReactPureComponent = require("./ReactPureComponent");
      const ReactClass = require("./ReactClass");
      const ReactDOMFactories = require("./ReactDOMFactories");
      const ReactElement = require("./ReactElement");
      const ReactPropTypes = require("./ReactPropTypes");
      const ReactVersion = require("./ReactVersion");

      const onlyChild = require("./onlyChild");
      const warning = require("fbjs/lib/warning");

      let createElement = ReactElement.createElement;
      let createFactory = ReactElement.createFactory;
      let cloneElement = ReactElement.cloneElement;

      if (process.env.NODE_ENV !== "production") {
        const ReactElementValidator = require("./ReactElementValidator");
        createElement = ReactElementValidator.createElement;
        createFactory = ReactElementValidator.createFactory;
        cloneElement = ReactElementValidator.cloneElement;
      }

      let __spread = _assign;

      if (process.env.NODE_ENV !== "production") {
        let warned = false;
        __spread = function() {
          process.env.NODE_ENV !== "production" ? warning(warned, "React.__spread is deprecated and should not be used. Use " + "Object.assign directly or another helper function with similar " + "semantics. You may be seeing this warning due to your compiler. " + "See https://fb.me/react-spread-deprecation for more details.") : void 0;
          warned = true;
          return _assign(...arguments);
        };
      }

      const React = {

  // Modern

        Children: {
          map: ReactChildren.map,
          forEach: ReactChildren.forEach,
          count: ReactChildren.count,
          toArray: ReactChildren.toArray,
          only: onlyChild,
        },

        Component: ReactComponent,
        PureComponent: ReactPureComponent,

        createElement,
        cloneElement,
        isValidElement: ReactElement.isValidElement,

  // Classic

        PropTypes: ReactPropTypes,
        createClass: ReactClass.createClass,
        createFactory,
        createMixin(mixin) {
    // Currently a noop. Will be used to validate and trace mixins.
          return mixin;
        },

  // This looks DOM specific but these are actually isomorphic helpers
  // since they are just generating DOM strings.
        DOM: ReactDOMFactories,

        version: ReactVersion,

  // Deprecated hook for JSX spread, don't use this for anything.
        __spread,
      };

      module.exports = React;
    }).call(this, require("_process"));
  }, { "./ReactChildren": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactChildren.js", "./ReactClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactClass.js", "./ReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponent.js", "./ReactDOMFactories": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactDOMFactories.js", "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./ReactElementValidator": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElementValidator.js", "./ReactPropTypes": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypes.js", "./ReactPureComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPureComponent.js", "./ReactVersion": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactVersion.js", "./onlyChild": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\onlyChild.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactChildren.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const PooledClass = require("./PooledClass");
    const ReactElement = require("./ReactElement");

    const emptyFunction = require("fbjs/lib/emptyFunction");
    const traverseAllChildren = require("./traverseAllChildren");

    const twoArgumentPooler = PooledClass.twoArgumentPooler;
    const fourArgumentPooler = PooledClass.fourArgumentPooler;

    const userProvidedKeyEscapeRegex = /\/+/g;
    function escapeUserProvidedKey(text) {
      return (`${text}`).replace(userProvidedKeyEscapeRegex, "$&/");
    }

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * traversal. Allows avoiding binding callbacks.
 *
 * @constructor ForEachBookKeeping
 * @param {!function} forEachFunction Function to perform traversal with.
 * @param {?*} forEachContext Context to perform context with.
 */
    function ForEachBookKeeping(forEachFunction, forEachContext) {
      this.func = forEachFunction;
      this.context = forEachContext;
      this.count = 0;
    }
    ForEachBookKeeping.prototype.destructor = function() {
      this.func = null;
      this.context = null;
      this.count = 0;
    };
    PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);

    function forEachSingleChild(bookKeeping, child, name) {
      let func = bookKeeping.func,
        context = bookKeeping.context;

      func.call(context, child, bookKeeping.count++);
    }

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.foreach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
    function forEachChildren(children, forEachFunc, forEachContext) {
      if (children == null) {
        return children;
      }
      const traverseContext = ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
      traverseAllChildren(children, forEachSingleChild, traverseContext);
      ForEachBookKeeping.release(traverseContext);
    }

/**
 * PooledClass representing the bookkeeping associated with performing a child
 * mapping. Allows avoiding binding callbacks.
 *
 * @constructor MapBookKeeping
 * @param {!*} mapResult Object containing the ordered map of results.
 * @param {!function} mapFunction Function to perform mapping with.
 * @param {?*} mapContext Context to perform mapping with.
 */
    function MapBookKeeping(mapResult, keyPrefix, mapFunction, mapContext) {
      this.result = mapResult;
      this.keyPrefix = keyPrefix;
      this.func = mapFunction;
      this.context = mapContext;
      this.count = 0;
    }
    MapBookKeeping.prototype.destructor = function() {
      this.result = null;
      this.keyPrefix = null;
      this.func = null;
      this.context = null;
      this.count = 0;
    };
    PooledClass.addPoolingTo(MapBookKeeping, fourArgumentPooler);

    function mapSingleChildIntoContext(bookKeeping, child, childKey) {
      let result = bookKeeping.result,
        keyPrefix = bookKeeping.keyPrefix,
        func = bookKeeping.func,
        context = bookKeeping.context;


      let mappedChild = func.call(context, child, bookKeeping.count++);
      if (Array.isArray(mappedChild)) {
        mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
      } else if (mappedChild != null) {
        if (ReactElement.isValidElement(mappedChild)) {
          mappedChild = ReactElement.cloneAndReplaceKey(mappedChild,
      // Keep both the (mapped) and old keys if they differ, just as
      // traverseAllChildren used to do for objects as children
      keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? `${escapeUserProvidedKey(mappedChild.key)}/` : "") + childKey);
        }
        result.push(mappedChild);
      }
    }

    function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
      let escapedPrefix = "";
      if (prefix != null) {
        escapedPrefix = `${escapeUserProvidedKey(prefix)}/`;
      }
      const traverseContext = MapBookKeeping.getPooled(array, escapedPrefix, func, context);
      traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
      MapBookKeeping.release(traverseContext);
    }

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.map
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
    function mapChildren(children, func, context) {
      if (children == null) {
        return children;
      }
      const result = [];
      mapIntoWithKeyPrefixInternal(children, result, null, func, context);
      return result;
    }

    function forEachSingleChildDummy(traverseContext, child, name) {
      return null;
    }

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.count
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
    function countChildren(children, context) {
      return traverseAllChildren(children, forEachSingleChildDummy, null);
    }

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.toarray
 */
    function toArray(children) {
      const result = [];
      mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
      return result;
    }

    const ReactChildren = {
      forEach: forEachChildren,
      map: mapChildren,
      mapIntoWithKeyPrefixInternal,
      count: countChildren,
      toArray,
    };

    module.exports = ReactChildren;
  }, { "./PooledClass": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\PooledClass.js", "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./traverseAllChildren": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\traverseAllChildren.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactClass.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      let _prodInvariant = require("./reactProdInvariant"),
        _assign = require("object-assign");

      const ReactComponent = require("./ReactComponent");
      const ReactElement = require("./ReactElement");
      const ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
      const ReactNoopUpdateQueue = require("./ReactNoopUpdateQueue");

      const emptyObject = require("fbjs/lib/emptyObject");
      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      const MIXINS_KEY = "mixins";

// Helper function to allow the creation of anonymous functions which do not
// have .name set to the name of the variable being assigned to.
      function identity(fn) {
        return fn;
      }

/**
 * Policies that describe methods in `ReactClassInterface`.
 */


      const injectedMixins = [];

/**
 * Composite components are higher-level components that compose other composite
 * or host components.
 *
 * To create a new type of `ReactClass`, pass a specification of
 * your new class to `React.createClass`. The only requirement of your class
 * specification is that you implement a `render` method.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return <div>Hello World</div>;
 *     }
 *   });
 *
 * The class specification supports a specific protocol of methods that have
 * special meaning (e.g. `render`). See `ReactClassInterface` for
 * more the comprehensive protocol. Any other properties and methods in the
 * class specification will be available on the prototype.
 *
 * @interface ReactClassInterface
 * @internal
 */
      const ReactClassInterface = {

  /**
   * An array of Mixin objects to include when defining your component.
   *
   * @type {array}
   * @optional
   */
        mixins: "DEFINE_MANY",

  /**
   * An object containing properties and methods that should be defined on
   * the component's constructor instead of its prototype (static methods).
   *
   * @type {object}
   * @optional
   */
        statics: "DEFINE_MANY",

  /**
   * Definition of prop types for this component.
   *
   * @type {object}
   * @optional
   */
        propTypes: "DEFINE_MANY",

  /**
   * Definition of context types for this component.
   *
   * @type {object}
   * @optional
   */
        contextTypes: "DEFINE_MANY",

  /**
   * Definition of context types this component sets for its children.
   *
   * @type {object}
   * @optional
   */
        childContextTypes: "DEFINE_MANY",

  // ==== Definition methods ====

  /**
   * Invoked when the component is mounted. Values in the mapping will be set on
   * `this.props` if that prop is not specified (i.e. using an `in` check).
   *
   * This method is invoked before `getInitialState` and therefore cannot rely
   * on `this.state` or use `this.setState`.
   *
   * @return {object}
   * @optional
   */
        getDefaultProps: "DEFINE_MANY_MERGED",

  /**
   * Invoked once before the component is mounted. The return value will be used
   * as the initial value of `this.state`.
   *
   *   getInitialState: function() {
   *     return {
   *       isOn: false,
   *       fooBaz: new BazFoo()
   *     }
   *   }
   *
   * @return {object}
   * @optional
   */
        getInitialState: "DEFINE_MANY_MERGED",

  /**
   * @return {object}
   * @optional
   */
        getChildContext: "DEFINE_MANY_MERGED",

  /**
   * Uses props from `this.props` and state from `this.state` to render the
   * structure of the component.
   *
   * No guarantees are made about when or how often this method is invoked, so
   * it must not have side effects.
   *
   *   render: function() {
   *     var name = this.props.name;
   *     return <div>Hello, {name}!</div>;
   *   }
   *
   * @return {ReactComponent}
   * @nosideeffects
   * @required
   */
        render: "DEFINE_ONCE",

  // ==== Delegate methods ====

  /**
   * Invoked when the component is initially created and about to be mounted.
   * This may have side effects, but any external subscriptions or data created
   * by this method must be cleaned up in `componentWillUnmount`.
   *
   * @optional
   */
        componentWillMount: "DEFINE_MANY",

  /**
   * Invoked when the component has been mounted and has a DOM representation.
   * However, there is no guarantee that the DOM node is in the document.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been mounted (initialized and rendered) for the first time.
   *
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
        componentDidMount: "DEFINE_MANY",

  /**
   * Invoked before the component receives new props.
   *
   * Use this as an opportunity to react to a prop transition by updating the
   * state using `this.setState`. Current props are accessed via `this.props`.
   *
   *   componentWillReceiveProps: function(nextProps, nextContext) {
   *     this.setState({
   *       likesIncreasing: nextProps.likeCount > this.props.likeCount
   *     });
   *   }
   *
   * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
   * transition may cause a state change, but the opposite is not true. If you
   * need it, you are probably looking for `componentWillUpdate`.
   *
   * @param {object} nextProps
   * @optional
   */
        componentWillReceiveProps: "DEFINE_MANY",

  /**
   * Invoked while deciding if the component should be updated as a result of
   * receiving new props, state and/or context.
   *
   * Use this as an opportunity to `return false` when you're certain that the
   * transition to the new props/state/context will not require a component
   * update.
   *
   *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
   *     return !equal(nextProps, this.props) ||
   *       !equal(nextState, this.state) ||
   *       !equal(nextContext, this.context);
   *   }
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @return {boolean} True if the component should update.
   * @optional
   */
        shouldComponentUpdate: "DEFINE_ONCE",

  /**
   * Invoked when the component is about to update due to a transition from
   * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
   * and `nextContext`.
   *
   * Use this as an opportunity to perform preparation before an update occurs.
   *
   * NOTE: You **cannot** use `this.setState()` in this method.
   *
   * @param {object} nextProps
   * @param {?object} nextState
   * @param {?object} nextContext
   * @param {ReactReconcileTransaction} transaction
   * @optional
   */
        componentWillUpdate: "DEFINE_MANY",

  /**
   * Invoked when the component's DOM representation has been updated.
   *
   * Use this as an opportunity to operate on the DOM when the component has
   * been updated.
   *
   * @param {object} prevProps
   * @param {?object} prevState
   * @param {?object} prevContext
   * @param {DOMElement} rootNode DOM element representing the component.
   * @optional
   */
        componentDidUpdate: "DEFINE_MANY",

  /**
   * Invoked when the component is about to be removed from its parent and have
   * its DOM representation destroyed.
   *
   * Use this as an opportunity to deallocate any external resources.
   *
   * NOTE: There is no `componentDidUnmount` since your component will have been
   * destroyed by that point.
   *
   * @optional
   */
        componentWillUnmount: "DEFINE_MANY",

  // ==== Advanced methods ====

  /**
   * Updates the component's currently mounted DOM representation.
   *
   * By default, this implements React's rendering and reconciliation algorithm.
   * Sophisticated clients may wish to override this.
   *
   * @param {ReactReconcileTransaction} transaction
   * @internal
   * @overridable
   */
        updateComponent: "OVERRIDE_BASE",

      };

/**
 * Mapping from class specification keys to special processing functions.
 *
 * Although these are declared like instance properties in the specification
 * when defining classes using `React.createClass`, they are actually static
 * and are accessible on the constructor instead of the prototype. Despite
 * being static, they must be defined outside of the "statics" key under
 * which all other static methods are defined.
 */
      const RESERVED_SPEC_KEYS = {
        displayName(Constructor, displayName) {
          Constructor.displayName = displayName;
        },
        mixins(Constructor, mixins) {
          if (mixins) {
            for (let i = 0; i < mixins.length; i++) {
              mixSpecIntoComponent(Constructor, mixins[i]);
            }
          }
        },
        childContextTypes(Constructor, childContextTypes) {
          if (process.env.NODE_ENV !== "production") {
            validateTypeDef(Constructor, childContextTypes, "childContext");
          }
          Constructor.childContextTypes = _assign({}, Constructor.childContextTypes, childContextTypes);
        },
        contextTypes(Constructor, contextTypes) {
          if (process.env.NODE_ENV !== "production") {
            validateTypeDef(Constructor, contextTypes, "context");
          }
          Constructor.contextTypes = _assign({}, Constructor.contextTypes, contextTypes);
        },
  /**
   * Special case getDefaultProps which should move into statics but requires
   * automatic merging.
   */
        getDefaultProps(Constructor, getDefaultProps) {
          if (Constructor.getDefaultProps) {
            Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
          } else {
            Constructor.getDefaultProps = getDefaultProps;
          }
        },
        propTypes(Constructor, propTypes) {
          if (process.env.NODE_ENV !== "production") {
            validateTypeDef(Constructor, propTypes, "prop");
          }
          Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
        },
        statics(Constructor, statics) {
          mixStaticSpecIntoComponent(Constructor, statics);
        },
        autobind() {} };

      function validateTypeDef(Constructor, typeDef, location) {
        for (const propName in typeDef) {
          if (typeDef.hasOwnProperty(propName)) {
      // use a warning instead of an invariant so components
      // don't show up in prod but only in __DEV__
            process.env.NODE_ENV !== "production" ? warning(typeof typeDef[propName] === "function", "%s: %s type `%s` is invalid; it must be a function, usually from " + "React.PropTypes.", Constructor.displayName || "ReactClass", ReactPropTypeLocationNames[location], propName) : void 0;
          }
        }
      }

      function validateMethodOverride(isAlreadyDefined, name) {
        const specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;

  // Disallow overriding of base class methods unless explicitly allowed.
        if (ReactClassMixin.hasOwnProperty(name)) {
          !(specPolicy === "OVERRIDE_BASE") ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClassInterface: You are attempting to override `%s` from your class specification. Ensure that your method names do not overlap with React methods.", name) : _prodInvariant("73", name) : void 0;
        }

  // Disallow defining methods more than once unless explicitly allowed.
        if (isAlreadyDefined) {
          !(specPolicy === "DEFINE_MANY" || specPolicy === "DEFINE_MANY_MERGED") ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClassInterface: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.", name) : _prodInvariant("74", name) : void 0;
        }
      }

/**
 * Mixin helper which handles policy validation and reserved
 * specification keys when building React classes.
 */
      function mixSpecIntoComponent(Constructor, spec) {
        if (!spec) {
          if (process.env.NODE_ENV !== "production") {
            const typeofSpec = typeof spec;
            const isMixinValid = typeofSpec === "object" && spec !== null;

            process.env.NODE_ENV !== "production" ? warning(isMixinValid, "%s: You're attempting to include a mixin that is either null " + "or not an object. Check the mixins included by the component, " + "as well as any mixins they include themselves. " + "Expected object but got %s.", Constructor.displayName || "ReactClass", spec === null ? null : typeofSpec) : void 0;
          }

          return;
        }

        !(typeof spec !== "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClass: You're attempting to use a component class or function as a mixin. Instead, just use a regular object.") : _prodInvariant("75") : void 0;
        ReactElement.isValidElement(spec) ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClass: You're attempting to use a component as a mixin. Instead, just use a regular object.") : _prodInvariant("76") : void 0;

        const proto = Constructor.prototype;
        const autoBindPairs = proto.__reactAutoBindPairs;

  // By handling mixins before any other properties, we ensure the same
  // chaining order is applied to methods with DEFINE_MANY policy, whether
  // mixins are listed before or after these methods in the spec.
        if (spec.hasOwnProperty(MIXINS_KEY)) {
          RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
        }

        for (const name in spec) {
          if (!spec.hasOwnProperty(name)) {
            continue;
          }

          if (name === MIXINS_KEY) {
      // We have already handled mixins in a special case above.
            continue;
          }

          const property = spec[name];
          const isAlreadyDefined = proto.hasOwnProperty(name);
          validateMethodOverride(isAlreadyDefined, name);

          if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
            RESERVED_SPEC_KEYS[name](Constructor, property);
          } else {
      // Setup methods on prototype:
      // The following member methods should not be automatically bound:
      // 1. Expected ReactClass methods (in the "interface").
      // 2. Overridden methods (that were mixed in).
            const isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
            const isFunction = typeof property === "function";
            const shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;

            if (shouldAutoBind) {
              autoBindPairs.push(name, property);
              proto[name] = property;
            } else if (isAlreadyDefined) {
            const specPolicy = ReactClassInterface[name];

          // These cases should already be caught by validateMethodOverride.
            !(isReactClassMethod && (specPolicy === "DEFINE_MANY_MERGED" || specPolicy === "DEFINE_MANY")) ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClass: Unexpected spec policy %s for key %s when mixing in component specs.", specPolicy, name) : _prodInvariant("77", specPolicy, name) : void 0;

          // For methods which are defined more than once, call the existing
          // methods before calling the new property, merging if appropriate.
            if (specPolicy === "DEFINE_MANY_MERGED") {
              proto[name] = createMergedResultFunction(proto[name], property);
            } else if (specPolicy === "DEFINE_MANY") {
              proto[name] = createChainedFunction(proto[name], property);
            }
          } else {
            proto[name] = property;
            if (process.env.NODE_ENV !== "production") {
            // Add verbose displayName to the function, which helps when looking
            // at profiling tools.
              if (typeof property === "function" && spec.displayName) {
                proto[name].displayName = `${spec.displayName}_${name}`;
              }
            }
          }
          }
        }
      }

      function mixStaticSpecIntoComponent(Constructor, statics) {
        if (!statics) {
          return;
        }
        for (const name in statics) {
          const property = statics[name];
          if (!statics.hasOwnProperty(name)) {
            continue;
          }

          const isReserved = name in RESERVED_SPEC_KEYS;
          isReserved ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClass: You are attempting to define a reserved property, `%s`, that shouldn't be on the \"statics\" key. Define it as an instance property instead; it will still be accessible on the constructor.", name) : _prodInvariant("78", name) : void 0;

          const isInherited = name in Constructor;
          isInherited ? process.env.NODE_ENV !== "production" ? invariant(false, "ReactClass: You are attempting to define `%s` on your component more than once. This conflict may be due to a mixin.", name) : _prodInvariant("79", name) : void 0;
          Constructor[name] = property;
        }
      }

/**
 * Merge two objects, but throw if both contain the same key.
 *
 * @param {object} one The first object, which is mutated.
 * @param {object} two The second object
 * @return {object} one after it has been mutated to contain everything in two.
 */
      function mergeIntoWithNoDuplicateKeys(one, two) {
        !(one && two && typeof one === "object" && typeof two === "object") ? process.env.NODE_ENV !== "production" ? invariant(false, "mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.") : _prodInvariant("80") : void 0;

        for (const key in two) {
          if (two.hasOwnProperty(key)) {
            !(one[key] === undefined) ? process.env.NODE_ENV !== "production" ? invariant(false, "mergeIntoWithNoDuplicateKeys(): Tried to merge two objects with the same key: `%s`. This conflict may be due to a mixin; in particular, this may be caused by two getInitialState() or getDefaultProps() methods returning objects with clashing keys.", key) : _prodInvariant("81", key) : void 0;
            one[key] = two[key];
          }
        }
        return one;
      }

/**
 * Creates a function that invokes two functions and merges their return values.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
      function createMergedResultFunction(one, two) {
        return function mergedResult() {
          const a = one.apply(this, arguments);
          const b = two.apply(this, arguments);
          if (a == null) {
            return b;
          } else if (b == null) {
            return a;
          }
          const c = {};
          mergeIntoWithNoDuplicateKeys(c, a);
          mergeIntoWithNoDuplicateKeys(c, b);
          return c;
        };
      }

/**
 * Creates a function that invokes two functions and ignores their return vales.
 *
 * @param {function} one Function to invoke first.
 * @param {function} two Function to invoke second.
 * @return {function} Function that invokes the two argument functions.
 * @private
 */
      function createChainedFunction(one, two) {
        return function chainedFunction() {
          one.apply(this, arguments);
          two.apply(this, arguments);
        };
      }

/**
 * Binds a method to the component.
 *
 * @param {object} component Component whose method is going to be bound.
 * @param {function} method Method to be bound.
 * @return {function} The bound method.
 */
      function bindAutoBindMethod(component, method) {
        const boundMethod = method.bind(component);
        if (process.env.NODE_ENV !== "production") {
          boundMethod.__reactBoundContext = component;
          boundMethod.__reactBoundMethod = method;
          boundMethod.__reactBoundArguments = null;
          const componentName = component.constructor.displayName;
          const _bind = boundMethod.bind;
          boundMethod.bind = function(newThis) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }

      // User is trying to bind() an autobound method; we effectively will
      // ignore the value of "this" that the user is trying to use, so
      // let's warn.
            if (newThis !== component && newThis !== null) {
              process.env.NODE_ENV !== "production" ? warning(false, "bind(): React component methods may only be bound to the " + "component instance. See %s", componentName) : void 0;
            } else if (!args.length) {
            process.env.NODE_ENV !== "production" ? warning(false, "bind(): You are binding a component method to the component. " + "React does this for you automatically in a high-performance " + "way, so you can safely remove this call. See %s", componentName) : void 0;
            return boundMethod;
          }
            const reboundMethod = _bind.apply(boundMethod, arguments);
            reboundMethod.__reactBoundContext = component;
            reboundMethod.__reactBoundMethod = method;
            reboundMethod.__reactBoundArguments = args;
            return reboundMethod;
          };
        }
        return boundMethod;
      }

/**
 * Binds all auto-bound methods in a component.
 *
 * @param {object} component Component whose method is going to be bound.
 */
      function bindAutoBindMethods(component) {
        const pairs = component.__reactAutoBindPairs;
        for (let i = 0; i < pairs.length; i += 2) {
          const autoBindKey = pairs[i];
          const method = pairs[i + 1];
          component[autoBindKey] = bindAutoBindMethod(component, method);
        }
      }

/**
 * Add more to the ReactClass base class. These are all legacy features and
 * therefore not already part of the modern ReactComponent.
 */
      var ReactClassMixin = {

  /**
   * TODO: This will be deprecated because state should always keep a consistent
   * type signature and the only use case for this, is to avoid that.
   */
        replaceState(newState, callback) {
          this.updater.enqueueReplaceState(this, newState);
          if (callback) {
            this.updater.enqueueCallback(this, callback, "replaceState");
          }
        },

  /**
   * Checks whether or not this composite component is mounted.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
        isMounted() {
          return this.updater.isMounted(this);
        },
      };

      const ReactClassComponent = function() {};
      _assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);

/**
 * Module for creating composite components.
 *
 * @class ReactClass
 */
      const ReactClass = {

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
        createClass(spec) {
    // To keep our warnings more understandable, we'll use a little hack here to
    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
    // unnecessarily identify a class without displayName as 'Constructor'.
          var Constructor = identity(function(props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

            if (process.env.NODE_ENV !== "production") {
              process.env.NODE_ENV !== "production" ? warning(this instanceof Constructor, "Something is calling a React component directly. Use a factory or " + "JSX instead. See: https://fb.me/react-legacyfactory") : void 0;
            }

      // Wire up auto-binding
            if (this.__reactAutoBindPairs.length) {
              bindAutoBindMethods(this);
            }

            this.props = props;
            this.context = context;
            this.refs = emptyObject;
            this.updater = updater || ReactNoopUpdateQueue;

            this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

            let initialState = this.getInitialState ? this.getInitialState() : null;
            if (process.env.NODE_ENV !== "production") {
        // We allow auto-mocks to proceed as if they're returning null.
              if (initialState === undefined && this.getInitialState._isMockFunction) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
              initialState = null;
            }
            }
            !(typeof initialState === "object" && !Array.isArray(initialState)) ? process.env.NODE_ENV !== "production" ? invariant(false, "%s.getInitialState(): must return an object or null", Constructor.displayName || "ReactCompositeComponent") : _prodInvariant("82", Constructor.displayName || "ReactCompositeComponent") : void 0;

            this.state = initialState;
          });
          Constructor.prototype = new ReactClassComponent();
          Constructor.prototype.constructor = Constructor;
          Constructor.prototype.__reactAutoBindPairs = [];

          injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

          mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged.
          if (Constructor.getDefaultProps) {
            Constructor.defaultProps = Constructor.getDefaultProps();
          }

          if (process.env.NODE_ENV !== "production") {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
            if (Constructor.getDefaultProps) {
              Constructor.getDefaultProps.isReactClassApproved = {};
            }
            if (Constructor.prototype.getInitialState) {
              Constructor.prototype.getInitialState.isReactClassApproved = {};
            }
          }

          !Constructor.prototype.render ? process.env.NODE_ENV !== "production" ? invariant(false, "createClass(...): Class specification must implement a `render` method.") : _prodInvariant("83") : void 0;

          if (process.env.NODE_ENV !== "production") {
            process.env.NODE_ENV !== "production" ? warning(!Constructor.prototype.componentShouldUpdate, "%s has a method called " + "componentShouldUpdate(). Did you mean shouldComponentUpdate()? " + "The name is phrased as a question because the function is " + "expected to return a value.", spec.displayName || "A component") : void 0;
            process.env.NODE_ENV !== "production" ? warning(!Constructor.prototype.componentWillRecieveProps, "%s has a method called " + "componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", spec.displayName || "A component") : void 0;
          }

    // Reduce time spent doing lookups by setting these on the prototype.
          for (const methodName in ReactClassInterface) {
            if (!Constructor.prototype[methodName]) {
              Constructor.prototype[methodName] = null;
            }
          }

          return Constructor;
        },

        injection: {
          injectMixin(mixin) {
            injectedMixins.push(mixin);
          },
        },

      };

      module.exports = ReactClass;
    }).call(this, require("_process"));
  }, { "./ReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponent.js", "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./ReactNoopUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactNoopUpdateQueue.js", "./ReactPropTypeLocationNames": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypeLocationNames.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyObject": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyObject.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponent.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactNoopUpdateQueue = require("./ReactNoopUpdateQueue");

      const canDefineProperty = require("./canDefineProperty");
      const emptyObject = require("fbjs/lib/emptyObject");
      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

/**
 * Base class helpers for the updating state of a component.
 */
      function ReactComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
        this.updater = updater || ReactNoopUpdateQueue;
      }

      ReactComponent.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
      ReactComponent.prototype.setState = function(partialState, callback) {
        !(typeof partialState === "object" || typeof partialState === "function" || partialState == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "setState(...): takes an object of state variables to update or a function which returns an object of state variables.") : _prodInvariant("85") : void 0;
        this.updater.enqueueSetState(this, partialState);
        if (callback) {
          this.updater.enqueueCallback(this, callback, "setState");
        }
      };

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
      ReactComponent.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this);
        if (callback) {
          this.updater.enqueueCallback(this, callback, "forceUpdate");
        }
      };

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
      if (process.env.NODE_ENV !== "production") {
        const deprecatedAPIs = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in " + "componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see " + "https://github.com/facebook/react/issues/3236)."],
        };
        const defineDeprecationWarning = function(methodName, info) {
          if (canDefineProperty) {
            Object.defineProperty(ReactComponent.prototype, methodName, {
              get() {
                process.env.NODE_ENV !== "production" ? warning(false, "%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]) : void 0;
                return undefined;
              },
            });
          }
        };
        for (const fnName in deprecatedAPIs) {
          if (deprecatedAPIs.hasOwnProperty(fnName)) {
            defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
          }
        }
      }

      module.exports = ReactComponent;
    }).call(this, require("_process"));
  }, { "./ReactNoopUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactNoopUpdateQueue.js", "./canDefineProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\canDefineProperty.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyObject": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyObject.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactCurrentOwner = require("./ReactCurrentOwner");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      function isNative(fn) {
  // Based on isNative() from Lodash
        const funcToString = Function.prototype.toString;
        const hasOwnProperty = Object.prototype.hasOwnProperty;
        const reIsNative = RegExp(`^${funcToString
  // Take an example native function source for comparison
  .call(hasOwnProperty)
  // Strip regex characters so we can use it for regex
  .replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
  // Remove hasOwnProperty from the template to make it generic
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?")}$`);
        try {
          const source = funcToString.call(fn);
          return reIsNative.test(source);
        } catch (err) {
          return false;
        }
      }

      const canUseCollections =
// Array.from
typeof Array.from === "function" &&
// Map
typeof Map === "function" && isNative(Map) &&
// Map.prototype.keys
Map.prototype != null && typeof Map.prototype.keys === "function" && isNative(Map.prototype.keys) &&
// Set
typeof Set === "function" && isNative(Set) &&
// Set.prototype.keys
Set.prototype != null && typeof Set.prototype.keys === "function" && isNative(Set.prototype.keys);

      let setItem;
      let getItem;
      let removeItem;
      let getItemIDs;
      let addRoot;
      let removeRoot;
      let getRootIDs;

      if (canUseCollections) {
        const itemMap = new Map();
        const rootIDSet = new Set();

        setItem = function(id, item) {
          itemMap.set(id, item);
        };
        getItem = function(id) {
          return itemMap.get(id);
        };
        removeItem = function(id) {
          itemMap.delete(id);
        };
        getItemIDs = function() {
          return Array.from(itemMap.keys());
        };

        addRoot = function(id) {
          rootIDSet.add(id);
        };
        removeRoot = function(id) {
          rootIDSet.delete(id);
        };
        getRootIDs = function() {
          return Array.from(rootIDSet.keys());
        };
      } else {
        const itemByKey = {};
        const rootByKey = {};

  // Use non-numeric keys to prevent V8 performance issues:
  // https://github.com/facebook/react/pull/7232
        const getKeyFromID = function(id) {
          return `.${id}`;
        };
        const getIDFromKey = function(key) {
          return parseInt(key.substr(1), 10);
        };

        setItem = function(id, item) {
          const key = getKeyFromID(id);
          itemByKey[key] = item;
        };
        getItem = function(id) {
          const key = getKeyFromID(id);
          return itemByKey[key];
        };
        removeItem = function(id) {
          const key = getKeyFromID(id);
          delete itemByKey[key];
        };
        getItemIDs = function() {
          return Object.keys(itemByKey).map(getIDFromKey);
        };

        addRoot = function(id) {
          const key = getKeyFromID(id);
          rootByKey[key] = true;
        };
        removeRoot = function(id) {
          const key = getKeyFromID(id);
          delete rootByKey[key];
        };
        getRootIDs = function() {
          return Object.keys(rootByKey).map(getIDFromKey);
        };
      }

      const unmountedIDs = [];

      function purgeDeep(id) {
        const item = getItem(id);
        if (item) {
          const childIDs = item.childIDs;

          removeItem(id);
          childIDs.forEach(purgeDeep);
        }
      }

      function describeComponentFrame(name, source, ownerName) {
        return `\n    in ${name || "Unknown"}${source ? ` (at ${source.fileName.replace(/^.*[\\\/]/, "")}:${source.lineNumber})` : ownerName ? ` (created by ${ownerName})` : ""}`;
      }

      function getDisplayName(element) {
        if (element == null) {
          return "#empty";
        } else if (typeof element === "string" || typeof element === "number") {
          return "#text";
        } else if (typeof element.type === "string") {
          return element.type;
        }
        return element.type.displayName || element.type.name || "Unknown";
      }

      function describeID(id) {
        const name = ReactComponentTreeHook.getDisplayName(id);
        const element = ReactComponentTreeHook.getElement(id);
        const ownerID = ReactComponentTreeHook.getOwnerID(id);
        let ownerName;
        if (ownerID) {
          ownerName = ReactComponentTreeHook.getDisplayName(ownerID);
        }
        process.env.NODE_ENV !== "production" ? warning(element, "ReactComponentTreeHook: Missing React element for debugID %s when " + "building stack", id) : void 0;
        return describeComponentFrame(name, element && element._source, ownerName);
      }

      var ReactComponentTreeHook = {
        onSetChildren(id, nextChildIDs) {
          const item = getItem(id);
          !item ? process.env.NODE_ENV !== "production" ? invariant(false, "Item must have been set") : _prodInvariant("144") : void 0;
          item.childIDs = nextChildIDs;

          for (let i = 0; i < nextChildIDs.length; i++) {
            const nextChildID = nextChildIDs[i];
            const nextChild = getItem(nextChildID);
            !nextChild ? process.env.NODE_ENV !== "production" ? invariant(false, "Expected hook events to fire for the child before its parent includes it in onSetChildren().") : _prodInvariant("140") : void 0;
            !(nextChild.childIDs != null || typeof nextChild.element !== "object" || nextChild.element == null) ? process.env.NODE_ENV !== "production" ? invariant(false, "Expected onSetChildren() to fire for a container child before its parent includes it in onSetChildren().") : _prodInvariant("141") : void 0;
            !nextChild.isMounted ? process.env.NODE_ENV !== "production" ? invariant(false, "Expected onMountComponent() to fire for the child before its parent includes it in onSetChildren().") : _prodInvariant("71") : void 0;
            if (nextChild.parentID == null) {
              nextChild.parentID = id;
        // TODO: This shouldn't be necessary but mounting a new root during in
        // componentWillMount currently causes not-yet-mounted components to
        // be purged from our tree data so their parent id is missing.
            }
            !(nextChild.parentID === id) ? process.env.NODE_ENV !== "production" ? invariant(false, "Expected onBeforeMountComponent() parent and onSetChildren() to be consistent (%s has parents %s and %s).", nextChildID, nextChild.parentID, id) : _prodInvariant("142", nextChildID, nextChild.parentID, id) : void 0;
          }
        },
        onBeforeMountComponent(id, element, parentID) {
          const item = {
            element,
            parentID,
            text: null,
            childIDs: [],
            isMounted: false,
            updateCount: 0,
          };
          setItem(id, item);
        },
        onBeforeUpdateComponent(id, element) {
          const item = getItem(id);
          if (!item || !item.isMounted) {
      // We may end up here as a result of setState() in componentWillUnmount().
      // In this case, ignore the element.
            return;
          }
          item.element = element;
        },
        onMountComponent(id) {
          const item = getItem(id);
          !item ? process.env.NODE_ENV !== "production" ? invariant(false, "Item must have been set") : _prodInvariant("144") : void 0;
          item.isMounted = true;
          const isRoot = item.parentID === 0;
          if (isRoot) {
            addRoot(id);
          }
        },
        onUpdateComponent(id) {
          const item = getItem(id);
          if (!item || !item.isMounted) {
      // We may end up here as a result of setState() in componentWillUnmount().
      // In this case, ignore the element.
            return;
          }
          item.updateCount++;
        },
        onUnmountComponent(id) {
          const item = getItem(id);
          if (item) {
      // We need to check if it exists.
      // `item` might not exist if it is inside an error boundary, and a sibling
      // error boundary child threw while mounting. Then this instance never
      // got a chance to mount, but it still gets an unmounting event during
      // the error boundary cleanup.
            item.isMounted = false;
            const isRoot = item.parentID === 0;
            if (isRoot) {
              removeRoot(id);
            }
          }
          unmountedIDs.push(id);
        },
        purgeUnmountedComponents() {
          if (ReactComponentTreeHook._preventPurging) {
      // Should only be used for testing.
            return;
          }

          for (let i = 0; i < unmountedIDs.length; i++) {
            const id = unmountedIDs[i];
            purgeDeep(id);
          }
          unmountedIDs.length = 0;
        },
        isMounted(id) {
          const item = getItem(id);
          return item ? item.isMounted : false;
        },
        getCurrentStackAddendum(topElement) {
          let info = "";
          if (topElement) {
            const name = getDisplayName(topElement);
            const owner = topElement._owner;
            info += describeComponentFrame(name, topElement._source, owner && owner.getName());
          }

          const currentOwner = ReactCurrentOwner.current;
          const id = currentOwner && currentOwner._debugID;

          info += ReactComponentTreeHook.getStackAddendumByID(id);
          return info;
        },
        getStackAddendumByID(id) {
          let info = "";
          while (id) {
            info += describeID(id);
            id = ReactComponentTreeHook.getParentID(id);
          }
          return info;
        },
        getChildIDs(id) {
          const item = getItem(id);
          return item ? item.childIDs : [];
        },
        getDisplayName(id) {
          const element = ReactComponentTreeHook.getElement(id);
          if (!element) {
            return null;
          }
          return getDisplayName(element);
        },
        getElement(id) {
          const item = getItem(id);
          return item ? item.element : null;
        },
        getOwnerID(id) {
          const element = ReactComponentTreeHook.getElement(id);
          if (!element || !element._owner) {
            return null;
          }
          return element._owner._debugID;
        },
        getParentID(id) {
          const item = getItem(id);
          return item ? item.parentID : null;
        },
        getSource(id) {
          const item = getItem(id);
          const element = item ? item.element : null;
          const source = element != null ? element._source : null;
          return source;
        },
        getText(id) {
          const element = ReactComponentTreeHook.getElement(id);
          if (typeof element === "string") {
            return element;
          } else if (typeof element === "number") {
            return `${element}`;
          }
          return null;
        },
        getUpdateCount(id) {
          const item = getItem(id);
          return item ? item.updateCount : 0;
        },


        getRootIDs,
        getRegisteredIDs: getItemIDs,
      };

      module.exports = ReactComponentTreeHook;
    }).call(this, require("_process"));
  }, { "./ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
    const ReactCurrentOwner = {

  /**
   * @internal
   * @type {ReactComponent}
   */
      current: null,

    };

    module.exports = ReactCurrentOwner;
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactDOMFactories.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const ReactElement = require("./ReactElement");

/**
 * Create a factory that creates HTML tag elements.
 *
 * @private
 */
      let createDOMFactory = ReactElement.createFactory;
      if (process.env.NODE_ENV !== "production") {
        const ReactElementValidator = require("./ReactElementValidator");
        createDOMFactory = ReactElementValidator.createFactory;
      }

/**
 * Creates a mapping from supported HTML tags to `ReactDOMComponent` classes.
 * This is also accessible via `React.DOM`.
 *
 * @public
 */
      const ReactDOMFactories = {
        "a": createDOMFactory("a"),
        "abbr": createDOMFactory("abbr"),
        "address": createDOMFactory("address"),
        "area": createDOMFactory("area"),
        "article": createDOMFactory("article"),
        "aside": createDOMFactory("aside"),
        "audio": createDOMFactory("audio"),
        "b": createDOMFactory("b"),
        "base": createDOMFactory("base"),
        "bdi": createDOMFactory("bdi"),
        "bdo": createDOMFactory("bdo"),
        "big": createDOMFactory("big"),
        "blockquote": createDOMFactory("blockquote"),
        "body": createDOMFactory("body"),
        "br": createDOMFactory("br"),
        "button": createDOMFactory("button"),
        "canvas": createDOMFactory("canvas"),
        "caption": createDOMFactory("caption"),
        "cite": createDOMFactory("cite"),
        "code": createDOMFactory("code"),
        "col": createDOMFactory("col"),
        "colgroup": createDOMFactory("colgroup"),
        "data": createDOMFactory("data"),
        "datalist": createDOMFactory("datalist"),
        "dd": createDOMFactory("dd"),
        "del": createDOMFactory("del"),
        "details": createDOMFactory("details"),
        "dfn": createDOMFactory("dfn"),
        "dialog": createDOMFactory("dialog"),
        "div": createDOMFactory("div"),
        "dl": createDOMFactory("dl"),
        "dt": createDOMFactory("dt"),
        "em": createDOMFactory("em"),
        "embed": createDOMFactory("embed"),
        "fieldset": createDOMFactory("fieldset"),
        "figcaption": createDOMFactory("figcaption"),
        "figure": createDOMFactory("figure"),
        "footer": createDOMFactory("footer"),
        "form": createDOMFactory("form"),
        "h1": createDOMFactory("h1"),
        "h2": createDOMFactory("h2"),
        "h3": createDOMFactory("h3"),
        "h4": createDOMFactory("h4"),
        "h5": createDOMFactory("h5"),
        "h6": createDOMFactory("h6"),
        "head": createDOMFactory("head"),
        "header": createDOMFactory("header"),
        "hgroup": createDOMFactory("hgroup"),
        "hr": createDOMFactory("hr"),
        "html": createDOMFactory("html"),
        "i": createDOMFactory("i"),
        "iframe": createDOMFactory("iframe"),
        "img": createDOMFactory("img"),
        "input": createDOMFactory("input"),
        "ins": createDOMFactory("ins"),
        "kbd": createDOMFactory("kbd"),
        "keygen": createDOMFactory("keygen"),
        "label": createDOMFactory("label"),
        "legend": createDOMFactory("legend"),
        "li": createDOMFactory("li"),
        "link": createDOMFactory("link"),
        "main": createDOMFactory("main"),
        "map": createDOMFactory("map"),
        "mark": createDOMFactory("mark"),
        "menu": createDOMFactory("menu"),
        "menuitem": createDOMFactory("menuitem"),
        "meta": createDOMFactory("meta"),
        "meter": createDOMFactory("meter"),
        "nav": createDOMFactory("nav"),
        "noscript": createDOMFactory("noscript"),
        "object": createDOMFactory("object"),
        "ol": createDOMFactory("ol"),
        "optgroup": createDOMFactory("optgroup"),
        "option": createDOMFactory("option"),
        "output": createDOMFactory("output"),
        "p": createDOMFactory("p"),
        "param": createDOMFactory("param"),
        "picture": createDOMFactory("picture"),
        "pre": createDOMFactory("pre"),
        "progress": createDOMFactory("progress"),
        "q": createDOMFactory("q"),
        "rp": createDOMFactory("rp"),
        "rt": createDOMFactory("rt"),
        "ruby": createDOMFactory("ruby"),
        "s": createDOMFactory("s"),
        "samp": createDOMFactory("samp"),
        "script": createDOMFactory("script"),
        "section": createDOMFactory("section"),
        "select": createDOMFactory("select"),
        "small": createDOMFactory("small"),
        "source": createDOMFactory("source"),
        "span": createDOMFactory("span"),
        "strong": createDOMFactory("strong"),
        "style": createDOMFactory("style"),
        "sub": createDOMFactory("sub"),
        "summary": createDOMFactory("summary"),
        "sup": createDOMFactory("sup"),
        "table": createDOMFactory("table"),
        "tbody": createDOMFactory("tbody"),
        "td": createDOMFactory("td"),
        "textarea": createDOMFactory("textarea"),
        "tfoot": createDOMFactory("tfoot"),
        "th": createDOMFactory("th"),
        "thead": createDOMFactory("thead"),
        "time": createDOMFactory("time"),
        "title": createDOMFactory("title"),
        "tr": createDOMFactory("tr"),
        "track": createDOMFactory("track"),
        "u": createDOMFactory("u"),
        "ul": createDOMFactory("ul"),
        "var": createDOMFactory("var"),
        "video": createDOMFactory("video"),
        "wbr": createDOMFactory("wbr"),

  // SVG
        "circle": createDOMFactory("circle"),
        "clipPath": createDOMFactory("clipPath"),
        "defs": createDOMFactory("defs"),
        "ellipse": createDOMFactory("ellipse"),
        "g": createDOMFactory("g"),
        "image": createDOMFactory("image"),
        "line": createDOMFactory("line"),
        "linearGradient": createDOMFactory("linearGradient"),
        "mask": createDOMFactory("mask"),
        "path": createDOMFactory("path"),
        "pattern": createDOMFactory("pattern"),
        "polygon": createDOMFactory("polygon"),
        "polyline": createDOMFactory("polyline"),
        "radialGradient": createDOMFactory("radialGradient"),
        "rect": createDOMFactory("rect"),
        "stop": createDOMFactory("stop"),
        "svg": createDOMFactory("svg"),
        "text": createDOMFactory("text"),
        "tspan": createDOMFactory("tspan"),
      };

      module.exports = ReactDOMFactories;
    }).call(this, require("_process"));
  }, { "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./ReactElementValidator": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElementValidator.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _assign = require("object-assign");

      const ReactCurrentOwner = require("./ReactCurrentOwner");

      const warning = require("fbjs/lib/warning");
      const canDefineProperty = require("./canDefineProperty");
      const hasOwnProperty = Object.prototype.hasOwnProperty;

      const REACT_ELEMENT_TYPE = require("./ReactElementSymbol");

      const RESERVED_PROPS = {
        key: true,
        ref: true,
        __self: true,
        __source: true,
      };

      let specialPropKeyWarningShown,
        specialPropRefWarningShown;

      function hasValidRef(config) {
        if (process.env.NODE_ENV !== "production") {
          if (hasOwnProperty.call(config, "ref")) {
            const getter = Object.getOwnPropertyDescriptor(config, "ref").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.ref !== undefined;
      }

      function hasValidKey(config) {
        if (process.env.NODE_ENV !== "production") {
          if (hasOwnProperty.call(config, "key")) {
            const getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.key !== undefined;
      }

      function defineKeyPropWarningGetter(props, displayName) {
        const warnAboutAccessingKey = function() {
          if (!specialPropKeyWarningShown) {
            specialPropKeyWarningShown = true;
            process.env.NODE_ENV !== "production" ? warning(false, "%s: `key` is not a prop. Trying to access it will result " + "in `undefined` being returned. If you need to access the same " + "value within the child component, you should pass it as a different " + "prop. (https://fb.me/react-special-props)", displayName) : void 0;
          }
        };
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true,
        });
      }

      function defineRefPropWarningGetter(props, displayName) {
        const warnAboutAccessingRef = function() {
          if (!specialPropRefWarningShown) {
            specialPropRefWarningShown = true;
            process.env.NODE_ENV !== "production" ? warning(false, "%s: `ref` is not a prop. Trying to access it will result " + "in `undefined` being returned. If you need to access the same " + "value within the child component, you should pass it as a different " + "prop. (https://fb.me/react-special-props)", displayName) : void 0;
          }
        };
        warnAboutAccessingRef.isReactWarning = true;
        Object.defineProperty(props, "ref", {
          get: warnAboutAccessingRef,
          configurable: true,
        });
      }

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, no instanceof check
 * will work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
      const ReactElement = function(type, key, ref, self, source, owner, props) {
        const element = {
    // This tag allow us to uniquely identify this as a React Element
          $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
          type,
          key,
          ref,
          props,

    // Record the component responsible for creating this element.
          _owner: owner,
        };

        if (process.env.NODE_ENV !== "production") {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
          element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
          if (canDefineProperty) {
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false,
            });
      // self and source are DEV only properties.
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self,
            });
      // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source,
            });
          } else {
            element._store.validated = false;
            element._self = self;
            element._source = source;
          }
          if (Object.freeze) {
            Object.freeze(element.props);
            Object.freeze(element);
          }
        }

        return element;
      };

/**
 * Create and return a new ReactElement of the given type.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.createelement
 */
      ReactElement.createElement = function(type, config, children) {
        let propName;

  // Reserved names are extracted
        const props = {};

        let key = null;
        let ref = null;
        let self = null;
        let source = null;

        if (config != null) {
          if (hasValidRef(config)) {
            ref = config.ref;
          }
          if (hasValidKey(config)) {
            key = `${config.key}`;
          }

          self = config.__self === undefined ? null : config.__self;
          source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
          for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
              props[propName] = config[propName];
            }
          }
        }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
        const childrenLength = arguments.length - 2;
        if (childrenLength === 1) {
          props.children = children;
        } else if (childrenLength > 1) {
          const childArray = Array(childrenLength);
          for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
          }
          if (process.env.NODE_ENV !== "production") {
            if (Object.freeze) {
            Object.freeze(childArray);
          }
          }
          props.children = childArray;
        }

  // Resolve default props
        if (type && type.defaultProps) {
          const defaultProps = type.defaultProps;
          for (propName in defaultProps) {
            if (props[propName] === undefined) {
              props[propName] = defaultProps[propName];
            }
          }
        }
        if (process.env.NODE_ENV !== "production") {
          if (key || ref) {
            if (typeof props.$$typeof === "undefined" || props.$$typeof !== REACT_ELEMENT_TYPE) {
              const displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
              defineKeyPropWarningGetter(props, displayName);
            }
              if (ref) {
              defineRefPropWarningGetter(props, displayName);
            }
            }
          }
        }
        return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
      };

/**
 * Return a function that produces ReactElements of a given type.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.createfactory
 */
      ReactElement.createFactory = function(type) {
        const factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
        factory.type = type;
        return factory;
      };

      ReactElement.cloneAndReplaceKey = function(oldElement, newKey) {
        const newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

        return newElement;
      };

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.cloneelement
 */
      ReactElement.cloneElement = function(element, config, children) {
        let propName;

  // Original props are copied
        const props = _assign({}, element.props);

  // Reserved names are extracted
        let key = element.key;
        let ref = element.ref;
  // Self is preserved since the owner is preserved.
        const self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
        const source = element._source;

  // Owner will be preserved, unless ref is overridden
        let owner = element._owner;

        if (config != null) {
          if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
            ref = config.ref;
            owner = ReactCurrentOwner.current;
          }
          if (hasValidKey(config)) {
            key = `${config.key}`;
          }

    // Remaining properties override existing props
          let defaultProps;
          if (element.type && element.type.defaultProps) {
            defaultProps = element.type.defaultProps;
          }
          for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
              if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
              props[propName] = defaultProps[propName];
            } else {
              props[propName] = config[propName];
            }
            }
          }
        }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
        const childrenLength = arguments.length - 2;
        if (childrenLength === 1) {
          props.children = children;
        } else if (childrenLength > 1) {
          const childArray = Array(childrenLength);
          for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
          }
          props.children = childArray;
        }

        return ReactElement(element.type, key, ref, self, source, owner, props);
      };

/**
 * Verifies the object is a ReactElement.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
      ReactElement.isValidElement = function(object) {
        return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      };

      module.exports = ReactElement;
    }).call(this, require("_process"));
  }, { "./ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js", "./ReactElementSymbol": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElementSymbol.js", "./canDefineProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\canDefineProperty.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElementSymbol.js": [function(require, module, exports) {
    arguments[4]["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactElementSymbol.js"][0].apply(exports, arguments);
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElementValidator.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2014-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/**
 * ReactElementValidator provides a wrapper around a element factory
 * which validates the props passed to the element. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */


      const ReactCurrentOwner = require("./ReactCurrentOwner");
      const ReactComponentTreeHook = require("./ReactComponentTreeHook");
      const ReactElement = require("./ReactElement");

      const checkReactTypeSpec = require("./checkReactTypeSpec");

      const canDefineProperty = require("./canDefineProperty");
      const getIteratorFn = require("./getIteratorFn");
      const warning = require("fbjs/lib/warning");

      function getDeclarationErrorAddendum() {
        if (ReactCurrentOwner.current) {
          const name = ReactCurrentOwner.current.getName();
          if (name) {
            return ` Check the render method of \`${name}\`.`;
          }
        }
        return "";
      }

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
      const ownerHasKeyUseWarning = {};

      function getCurrentComponentErrorInfo(parentType) {
        let info = getDeclarationErrorAddendum();

        if (!info) {
          const parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
          if (parentName) {
            info = ` Check the top-level render call using <${parentName}>.`;
          }
        }
        return info;
      }

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
      function validateExplicitKey(element, parentType) {
        if (!element._store || element._store.validated || element.key != null) {
          return;
        }
        element._store.validated = true;

        const memoizer = ownerHasKeyUseWarning.uniqueKey || (ownerHasKeyUseWarning.uniqueKey = {});

        const currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
        if (memoizer[currentComponentErrorInfo]) {
          return;
        }
        memoizer[currentComponentErrorInfo] = true;

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
        let childOwner = "";
        if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
    // Give the component that originally created this child.
          childOwner = ` It was passed a child from ${element._owner.getName()}.`;
        }

        process.env.NODE_ENV !== "production" ? warning(false, "Each child in an array or iterator should have a unique \"key\" prop." + "%s%s See https://fb.me/react-warning-keys for more information.%s", currentComponentErrorInfo, childOwner, ReactComponentTreeHook.getCurrentStackAddendum(element)) : void 0;
      }

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
      function validateChildKeys(node, parentType) {
        if (typeof node !== "object") {
          return;
        }
        if (Array.isArray(node)) {
          for (let i = 0; i < node.length; i++) {
            const child = node[i];
            if (ReactElement.isValidElement(child)) {
              validateExplicitKey(child, parentType);
            }
          }
        } else if (ReactElement.isValidElement(node)) {
    // This element was passed in a valid location.
          if (node._store) {
            node._store.validated = true;
          }
        } else if (node) {
          const iteratorFn = getIteratorFn(node);
    // Entry iterators provide implicit keys.
          if (iteratorFn) {
          if (iteratorFn !== node.entries) {
            const iterator = iteratorFn.call(node);
            let step;
            while (!(step = iterator.next()).done) {
              if (ReactElement.isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
            }
          }
        }
        }
      }

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
      function validatePropTypes(element) {
        const componentClass = element.type;
        if (typeof componentClass !== "function") {
          return;
        }
        const name = componentClass.displayName || componentClass.name;
        if (componentClass.propTypes) {
          checkReactTypeSpec(componentClass.propTypes, element.props, "prop", name, element, null);
        }
        if (typeof componentClass.getDefaultProps === "function") {
          process.env.NODE_ENV !== "production" ? warning(componentClass.getDefaultProps.isReactClassApproved, "getDefaultProps is only used on classic React.createClass " + "definitions. Use a static property named `defaultProps` instead.") : void 0;
        }
      }

      var ReactElementValidator = {

        createElement(type, props, children) {
          const validType = typeof type === "string" || typeof type === "function";
    // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.
          if (!validType) {
            if (typeof type !== "function" && typeof type !== "string") {
              let info = "";
              if (type === undefined || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file " + "it's defined in.";
            }
              info += getDeclarationErrorAddendum();
              process.env.NODE_ENV !== "production" ? warning(false, "React.createElement: type is invalid -- expected a string (for " + "built-in components) or a class/function (for composite " + "components) but got: %s.%s", type == null ? type : typeof type, info) : void 0;
            }
          }

          const element = ReactElement.createElement.apply(this, arguments);

    // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.
          if (element == null) {
            return element;
          }

    // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)
          if (validType) {
            for (let i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }

          validatePropTypes(element);

          return element;
        },

        createFactory(type) {
          const validatedFactory = ReactElementValidator.createElement.bind(null, type);
    // Legacy hook TODO: Warn if this is accessed
          validatedFactory.type = type;

          if (process.env.NODE_ENV !== "production") {
            if (canDefineProperty) {
              Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get() {
                process.env.NODE_ENV !== "production" ? warning(false, "Factory.type is deprecated. Access the class directly " + "before passing it to createFactory.") : void 0;
                Object.defineProperty(this, "type", {
                  value: type,
                });
                return type;
              },
            });
            }
          }

          return validatedFactory;
        },

        cloneElement(element, props, children) {
          const newElement = ReactElement.cloneElement.apply(this, arguments);
          for (let i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        },

      };

      module.exports = ReactElementValidator;
    }).call(this, require("_process"));
  }, { "./ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js", "./ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js", "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./canDefineProperty": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\canDefineProperty.js", "./checkReactTypeSpec": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\checkReactTypeSpec.js", "./getIteratorFn": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\getIteratorFn.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactNoopUpdateQueue.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const warning = require("fbjs/lib/warning");

      function warnNoop(publicInstance, callerName) {
        if (process.env.NODE_ENV !== "production") {
          const constructor = publicInstance.constructor;
          process.env.NODE_ENV !== "production" ? warning(false, "%s(...): Can only update a mounted or mounting component. " + "This usually means you called %s() on an unmounted component. " + "This is a no-op. Please check the code for the %s component.", callerName, callerName, constructor && (constructor.displayName || constructor.name) || "ReactClass") : void 0;
        }
      }

/**
 * This is the abstract API for an update queue.
 */
      const ReactNoopUpdateQueue = {

  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
        isMounted(publicInstance) {
          return false;
        },

  /**
   * Enqueue a callback that will be executed after all the pending updates
   * have processed.
   *
   * @param {ReactClass} publicInstance The instance to use as `this` context.
   * @param {?function} callback Called after state is updated.
   * @internal
   */
        enqueueCallback(publicInstance, callback) {},

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @internal
   */
        enqueueForceUpdate(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @internal
   */
        enqueueReplaceState(publicInstance, completeState) {
          warnNoop(publicInstance, "replaceState");
        },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @internal
   */
        enqueueSetState(publicInstance, partialState) {
          warnNoop(publicInstance, "setState");
        },
      };

      module.exports = ReactNoopUpdateQueue;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypeLocationNames.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      let ReactPropTypeLocationNames = {};

      if (process.env.NODE_ENV !== "production") {
        ReactPropTypeLocationNames = {
          prop: "prop",
          context: "context",
          childContext: "child context",
        };
      }

      module.exports = ReactPropTypeLocationNames;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypes.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const ReactElement = require("./ReactElement");
      const ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
      const ReactPropTypesSecret = require("./ReactPropTypesSecret");

      const emptyFunction = require("fbjs/lib/emptyFunction");
      const getIteratorFn = require("./getIteratorFn");
      const warning = require("fbjs/lib/warning");

/**
 * Collection of methods that allow declaration and validation of props that are
 * supplied to React components. Example usage:
 *
 *   var Props = require('ReactPropTypes');
 *   var MyArticle = React.createClass({
 *     propTypes: {
 *       // An optional string prop named "description".
 *       description: Props.string,
 *
 *       // A required enum prop named "category".
 *       category: Props.oneOf(['News','Photos']).isRequired,
 *
 *       // A prop named "dialog" that requires an instance of Dialog.
 *       dialog: Props.instanceOf(Dialog).isRequired
 *     },
 *     render: function() { ... }
 *   });
 *
 * A more formal specification of how these methods are used:
 *
 *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
 *   decl := ReactPropTypes.{type}(.isRequired)?
 *
 * Each and every declaration produces a function with the same signature. This
 * allows the creation of custom validation functions. For example:
 *
 *  var MyLink = React.createClass({
 *    propTypes: {
 *      // An optional string or URI prop named "href".
 *      href: function(props, propName, componentName) {
 *        var propValue = props[propName];
 *        if (propValue != null && typeof propValue !== 'string' &&
 *            !(propValue instanceof URI)) {
 *          return new Error(
 *            'Expected a string or an URI for ' + propName + ' in ' +
 *            componentName
 *          );
 *        }
 *      }
 *    },
 *    render: function() {...}
 *  });
 *
 * @internal
 */

      const ANONYMOUS = "<<anonymous>>";

      const ReactPropTypes = {
        array: createPrimitiveTypeChecker("array"),
        bool: createPrimitiveTypeChecker("boolean"),
        func: createPrimitiveTypeChecker("function"),
        number: createPrimitiveTypeChecker("number"),
        object: createPrimitiveTypeChecker("object"),
        string: createPrimitiveTypeChecker("string"),
        symbol: createPrimitiveTypeChecker("symbol"),

        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
      };

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
/* eslint-disable no-self-compare*/
      function is(x, y) {
  // SameValue algorithm
        if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
          return x !== 0 || 1 / x === 1 / y;
        }
    // Step 6.a: NaN == NaN
        return x !== x && y !== y;
      }
/* eslint-enable no-self-compare*/

/**
 * We use an Error-like object for backward compatibility as people may call
 * PropTypes directly and inspect their output. However we don't use real
 * Errors anymore. We don't inspect their stack anyway, and creating them
 * is prohibitively expensive if they are created too often, such as what
 * happens in oneOfType() for any type before the one that matched.
 */
      function PropTypeError(message) {
        this.message = message;
        this.stack = "";
      }
// Make `instanceof Error` still work for returned errors.
      PropTypeError.prototype = Error.prototype;

      function createChainableTypeChecker(validate) {
        if (process.env.NODE_ENV !== "production") {
          var manualPropTypeCallCache = {};
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;
          if (process.env.NODE_ENV !== "production") {
            if (secret !== ReactPropTypesSecret && typeof console !== "undefined") {
              const cacheKey = `${componentName}:${propName}`;
              if (!manualPropTypeCallCache[cacheKey]) {
              process.env.NODE_ENV !== "production" ? warning(false, "You are manually calling a React.PropTypes validation " + "function for the `%s` prop on `%s`. This is deprecated " + "and will not work in production with the next major version. " + "You may be seeing this warning due to a third-party PropTypes " + "library. See https://fb.me/react-warning-dont-call-proptypes " + "for details.", propFullName, componentName) : void 0;
              manualPropTypeCallCache[cacheKey] = true;
            }
            }
          }
          if (props[propName] == null) {
            const locationName = ReactPropTypeLocationNames[location];
            if (isRequired) {
              if (props[propName] === null) {
              return new PropTypeError(`The ${locationName} \`${propFullName}\` is marked as required ` + `in \`${componentName}\`, but its value is \`null\`.`);
            }
              return new PropTypeError(`The ${locationName} \`${propFullName}\` is marked as required in ` + `\`${componentName}\`, but its value is \`undefined\`.`);
            }
            return null;
          }
          return validate(props, propName, componentName, location, propFullName);
        }

        const chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);

        return chainedCheckType;
      }

      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
          const propValue = props[propName];
          const propType = getPropType(propValue);
          if (propType !== expectedType) {
            const locationName = ReactPropTypeLocationNames[location];
      // `propValue` being instance of, say, date/regexp, pass the 'object'
      // check, but we can offer a more precise error message here rather than
      // 'of type `object`'.
            const preciseType = getPreciseType(propValue);

            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of type ` + `\`${preciseType}\` supplied to \`${componentName}\`, expected ` + `\`${expectedType}\`.`);
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunction.thatReturns(null));
      }

      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError(`Property \`${propFullName}\` of component \`${componentName}\` has invalid PropType notation inside arrayOf.`);
          }
          const propValue = props[propName];
          if (!Array.isArray(propValue)) {
            const locationName = ReactPropTypeLocationNames[location];
            const propType = getPropType(propValue);
            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of type ` + `\`${propType}\` supplied to \`${componentName}\`, expected an array.`);
          }
          for (let i = 0; i < propValue.length; i++) {
            const error = typeChecker(propValue, i, componentName, location, `${propFullName}[${i}]`, ReactPropTypesSecret);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          const propValue = props[propName];
          if (!ReactElement.isValidElement(propValue)) {
            const locationName = ReactPropTypeLocationNames[location];
            const propType = getPropType(propValue);
            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of type ` + `\`${propType}\` supplied to \`${componentName}\`, expected a single ReactElement.`);
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            const locationName = ReactPropTypeLocationNames[location];
            const expectedClassName = expectedClass.name || ANONYMOUS;
            const actualClassName = getClassName(props[propName]);
            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of type ` + `\`${actualClassName}\` supplied to \`${componentName}\`, expected ` + `instance of \`${expectedClassName}\`.`);
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          process.env.NODE_ENV !== "production" ? warning(false, "Invalid argument supplied to oneOf, expected an instance of array.") : void 0;
          return emptyFunction.thatReturnsNull;
        }

        function validate(props, propName, componentName, location, propFullName) {
          const propValue = props[propName];
          for (let i = 0; i < expectedValues.length; i++) {
            if (is(propValue, expectedValues[i])) {
              return null;
            }
          }

          const locationName = ReactPropTypeLocationNames[location];
          const valuesString = JSON.stringify(expectedValues);
          return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of value \`${propValue}\` ` + `supplied to \`${componentName}\`, expected one of ${valuesString}.`);
        }
        return createChainableTypeChecker(validate);
      }

      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError(`Property \`${propFullName}\` of component \`${componentName}\` has invalid PropType notation inside objectOf.`);
          }
          const propValue = props[propName];
          const propType = getPropType(propValue);
          if (propType !== "object") {
            const locationName = ReactPropTypeLocationNames[location];
            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of type ` + `\`${propType}\` supplied to \`${componentName}\`, expected an object.`);
          }
          for (const key in propValue) {
            if (propValue.hasOwnProperty(key)) {
              const error = typeChecker(propValue, key, componentName, location, `${propFullName}.${key}`, ReactPropTypesSecret);
              if (error instanceof Error) {
              return error;
            }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          process.env.NODE_ENV !== "production" ? warning(false, "Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
          return emptyFunction.thatReturnsNull;
        }

        function validate(props, propName, componentName, location, propFullName) {
          for (let i = 0; i < arrayOfTypeCheckers.length; i++) {
            const checker = arrayOfTypeCheckers[i];
            if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
              return null;
            }
          }

          const locationName = ReactPropTypeLocationNames[location];
          return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` supplied to ` + `\`${componentName}\`.`);
        }
        return createChainableTypeChecker(validate);
      }

      function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          if (!isNode(props[propName])) {
            const locationName = ReactPropTypeLocationNames[location];
            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` supplied to ` + `\`${componentName}\`, expected a ReactNode.`);
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          const propValue = props[propName];
          const propType = getPropType(propValue);
          if (propType !== "object") {
            const locationName = ReactPropTypeLocationNames[location];
            return new PropTypeError(`Invalid ${locationName} \`${propFullName}\` of type \`${propType}\` ` + `supplied to \`${componentName}\`, expected \`object\`.`);
          }
          for (const key in shapeTypes) {
            const checker = shapeTypes[key];
            if (!checker) {
              continue;
            }
            const error = checker(propValue, key, componentName, location, `${propFullName}.${key}`, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }

      function isNode(propValue) {
        switch (typeof propValue) {
          case "number":
          case "string":
          case "undefined":
            return true;
          case "boolean":
            return !propValue;
          case "object":
            if (Array.isArray(propValue)) {
              return propValue.every(isNode);
            }
            if (propValue === null || ReactElement.isValidElement(propValue)) {
              return true;
            }

            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              const iterator = iteratorFn.call(propValue);
              let step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                if (!isNode(step.value)) {
                  return false;
                }
              }
              } else {
          // Iterator will provide entry [k,v] tuples rather than values.
                while (!(step = iterator.next()).done) {
                const entry = step.value;
                if (entry) {
                  if (!isNode(entry[1])) {
                    return false;
                  }
                }
              }
              }
            } else {
              return false;
            }

            return true;
          default:
            return false;
        }
      }

      function isSymbol(propType, propValue) {
  // Native Symbol.
        if (propType === "symbol") {
          return true;
        }

  // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
        if (propValue["@@toStringTag"] === "Symbol") {
          return true;
        }

  // Fallback for non-spec compliant Symbols which are polyfilled.
        if (typeof Symbol === "function" && propValue instanceof Symbol) {
          return true;
        }

        return false;
      }

// Equivalent of `typeof` but with special handling for array and regexp.
      function getPropType(propValue) {
        const propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return "array";
        }
        if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
          return "object";
        }
        if (isSymbol(propType, propValue)) {
          return "symbol";
        }
        return propType;
      }

// This handles more types than `getPropType`. Only used for error messages.
// See `createPrimitiveTypeChecker`.
      function getPreciseType(propValue) {
        const propType = getPropType(propValue);
        if (propType === "object") {
          if (propValue instanceof Date) {
            return "date";
          } else if (propValue instanceof RegExp) {
            return "regexp";
          }
        }
        return propType;
      }

// Returns class name of the object, if any.
      function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }

      module.exports = ReactPropTypes;
    }).call(this, require("_process"));
  }, { "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./ReactPropTypeLocationNames": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypeLocationNames.js", "./ReactPropTypesSecret": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypesSecret.js", "./getIteratorFn": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\getIteratorFn.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/emptyFunction": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyFunction.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypesSecret.js": [function(require, module, exports) {
    arguments[4]["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactPropTypesSecret.js"][0].apply(exports, arguments);
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPureComponent.js": [function(require, module, exports) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


    const _assign = require("object-assign");

    const ReactComponent = require("./ReactComponent");
    const ReactNoopUpdateQueue = require("./ReactNoopUpdateQueue");

    const emptyObject = require("fbjs/lib/emptyObject");

/**
 * Base class helpers for the updating state of a component.
 */
    function ReactPureComponent(props, context, updater) {
  // Duplicated from ReactComponent.
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
      this.updater = updater || ReactNoopUpdateQueue;
    }

    function ComponentDummy() {}
    ComponentDummy.prototype = ReactComponent.prototype;
    ReactPureComponent.prototype = new ComponentDummy();
    ReactPureComponent.prototype.constructor = ReactPureComponent;
// Avoid an extra prototype jump for these methods.
    _assign(ReactPureComponent.prototype, ReactComponent.prototype);
    ReactPureComponent.prototype.isPureReactComponent = true;

    module.exports = ReactPureComponent;
  }, { "./ReactComponent": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponent.js", "./ReactNoopUpdateQueue": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactNoopUpdateQueue.js", "fbjs/lib/emptyObject": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\emptyObject.js", "object-assign": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\object-assign\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactVersion.js": [function(require, module, exports) {
    arguments[4]["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\ReactVersion.js"][0].apply(exports, arguments);
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\canDefineProperty.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *
 */


      let canDefineProperty = false;
      if (process.env.NODE_ENV !== "production") {
        try {
    // $FlowFixMe https://github.com/facebook/flow/issues/285
          Object.defineProperty({}, "x", { get() {} });
          canDefineProperty = true;
        } catch (x) {
    // IE will fail on defineProperty
        }
      }

      module.exports = canDefineProperty;
    }).call(this, require("_process"));
  }, { "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\checkReactTypeSpec.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
      const ReactPropTypesSecret = require("./ReactPropTypesSecret");

      const invariant = require("fbjs/lib/invariant");
      const warning = require("fbjs/lib/warning");

      let ReactComponentTreeHook;

      if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") {
  // Temporary hack.
  // Inline requires don't work well with Jest:
  // https://github.com/facebook/react/issues/7240
  // Remove the inline requires when we don't need them anymore:
  // https://github.com/facebook/react/pull/7178
        ReactComponentTreeHook = require("./ReactComponentTreeHook");
      }

      const loggedTypeFailures = {};

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?object} element The React element that is being type-checked
 * @param {?number} debugID The React component instance that is being type-checked
 * @private
 */
      function checkReactTypeSpec(typeSpecs, values, location, componentName, element, debugID) {
        for (const typeSpecName in typeSpecs) {
          if (typeSpecs.hasOwnProperty(typeSpecName)) {
            var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
            try {
        // This is intentionally an invariant that gets caught. It's the same
        // behavior as without this statement except with a better message.
              !(typeof typeSpecs[typeSpecName] === "function") ? process.env.NODE_ENV !== "production" ? invariant(false, "%s: %s type `%s` is invalid; it must be a function, usually from React.PropTypes.", componentName || "React class", ReactPropTypeLocationNames[location], typeSpecName) : _prodInvariant("84", componentName || "React class", ReactPropTypeLocationNames[location], typeSpecName) : void 0;
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            process.env.NODE_ENV !== "production" ? warning(!error || error instanceof Error, "%s: type specification of %s `%s` is invalid; the type checker " + "function must return `null` or an `Error` but returned a %s. " + "You may have forgotten to pass an argument to the type checker " + "creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and " + "shape all require an argument).", componentName || "React class", ReactPropTypeLocationNames[location], typeSpecName, typeof error) : void 0;
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
              loggedTypeFailures[error.message] = true;

              let componentStackInfo = "";

              if (process.env.NODE_ENV !== "production") {
              if (!ReactComponentTreeHook) {
                ReactComponentTreeHook = require("./ReactComponentTreeHook");
              }
              if (debugID !== null) {
                componentStackInfo = ReactComponentTreeHook.getStackAddendumByID(debugID);
              } else if (element !== null) {
                componentStackInfo = ReactComponentTreeHook.getCurrentStackAddendum(element);
              }
            }

              process.env.NODE_ENV !== "production" ? warning(false, "Failed %s type: %s%s", location, error.message, componentStackInfo) : void 0;
            }
          }
        }
      }

      module.exports = checkReactTypeSpec;
    }).call(this, require("_process"));
  }, { "./ReactComponentTreeHook": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactComponentTreeHook.js", "./ReactPropTypeLocationNames": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypeLocationNames.js", "./ReactPropTypesSecret": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactPropTypesSecret.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\getIteratorFn.js": [function(require, module, exports) {
    arguments[4]["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\getIteratorFn.js"][0].apply(exports, arguments);
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\onlyChild.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactElement = require("./ReactElement");

      const invariant = require("fbjs/lib/invariant");

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#react.children.only
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
      function onlyChild(children) {
        !ReactElement.isValidElement(children) ? process.env.NODE_ENV !== "production" ? invariant(false, "React.Children.only expected to receive a single React element child.") : _prodInvariant("143") : void 0;
        return children;
      }

      module.exports = onlyChild;
    }).call(this, require("_process"));
  }, { "./ReactElement": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElement.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js": [function(require, module, exports) {
    arguments[4]["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\lib\\reactProdInvariant.js"][0].apply(exports, arguments);
  }, {}],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\traverseAllChildren.js": [function(require, module, exports) {
    (function(process) {
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */


      const _prodInvariant = require("./reactProdInvariant");

      const ReactCurrentOwner = require("./ReactCurrentOwner");
      const REACT_ELEMENT_TYPE = require("./ReactElementSymbol");

      const getIteratorFn = require("./getIteratorFn");
      const invariant = require("fbjs/lib/invariant");
      const KeyEscapeUtils = require("./KeyEscapeUtils");
      const warning = require("fbjs/lib/warning");

      const SEPARATOR = ".";
      const SUBSEPARATOR = ":";

/**
 * This is inlined from ReactElement since this file is shared between
 * isomorphic and renderers. We could extract this to a
 *
 */

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

      let didWarnAboutMaps = false;

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
      function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
        if (component && typeof component === "object" && component.key != null) {
    // Explicit key
          return KeyEscapeUtils.escape(component.key);
        }
  // Implicit key determined by the index in the set
        return index.toString(36);
      }

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
      function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
        const type = typeof children;

        if (type === "undefined" || type === "boolean") {
    // All of the above are perceived as null.
          children = null;
        }

        if (children === null || type === "string" || type === "number" ||
  // The following is inlined from ReactElement. This means we can optimize
  // some checks. React Fiber also inlines this logic for similar purposes.
  type === "object" && children.$$typeof === REACT_ELEMENT_TYPE) {
          callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === "" ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
          return 1;
        }

        let child;
        let nextName;
        let subtreeCount = 0; // Count of children found in the current subtree.
        const nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;

        if (Array.isArray(children)) {
          for (let i = 0; i < children.length; i++) {
            child = children[i];
            nextName = nextNamePrefix + getComponentKey(child, i);
            subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
          }
        } else {
          const iteratorFn = getIteratorFn(children);
          if (iteratorFn) {
            const iterator = iteratorFn.call(children);
            let step;
            if (iteratorFn !== children.entries) {
              let ii = 0;
              while (!(step = iterator.next()).done) {
              child = step.value;
              nextName = nextNamePrefix + getComponentKey(child, ii++);
              subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
            }
            } else {
              if (process.env.NODE_ENV !== "production") {
              let mapsAsChildrenAddendum = "";
              if (ReactCurrentOwner.current) {
                const mapsAsChildrenOwnerName = ReactCurrentOwner.current.getName();
                if (mapsAsChildrenOwnerName) {
                  mapsAsChildrenAddendum = ` Check the render method of \`${mapsAsChildrenOwnerName}\`.`;
                }
              }
              process.env.NODE_ENV !== "production" ? warning(didWarnAboutMaps, "Using Maps as children is not yet fully supported. It is an " + "experimental feature that might be removed. Convert it to a " + "sequence / iterable of keyed ReactElements instead.%s", mapsAsChildrenAddendum) : void 0;
              didWarnAboutMaps = true;
            }
        // Iterator will provide entry [k,v] tuples rather than values.
              while (!(step = iterator.next()).done) {
              const entry = step.value;
              if (entry) {
                child = entry[1];
                nextName = nextNamePrefix + KeyEscapeUtils.escape(entry[0]) + SUBSEPARATOR + getComponentKey(child, 0);
                subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
              }
            }
            }
          } else if (type === "object") {
            let addendum = "";
            if (process.env.NODE_ENV !== "production") {
            addendum = " If you meant to render a collection of children, use an array " + "instead or wrap the object using createFragment(object) from the " + "React add-ons.";
            if (children._isReactElement) {
              addendum = " It looks like you're using an element created by a different " + "version of React. Make sure to use only one copy of React.";
            }
            if (ReactCurrentOwner.current) {
              const name = ReactCurrentOwner.current.getName();
              if (name) {
                addendum += ` Check the render method of \`${name}\`.`;
              }
            }
          }
            const childrenString = String(children);
            !false ? process.env.NODE_ENV !== "production" ? invariant(false, "Objects are not valid as a React child (found: %s).%s", childrenString === "[object Object]" ? `object with keys {${Object.keys(children).join(", ")}}` : childrenString, addendum) : _prodInvariant("31", childrenString === "[object Object]" ? `object with keys {${Object.keys(children).join(", ")}}` : childrenString, addendum) : void 0;
          }
        }

        return subtreeCount;
      }

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
      function traverseAllChildren(children, callback, traverseContext) {
        if (children == null) {
          return 0;
        }

        return traverseAllChildrenImpl(children, "", callback, traverseContext);
      }

      module.exports = traverseAllChildren;
    }).call(this, require("_process"));
  }, { "./KeyEscapeUtils": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\KeyEscapeUtils.js", "./ReactCurrentOwner": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactCurrentOwner.js", "./ReactElementSymbol": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\ReactElementSymbol.js", "./getIteratorFn": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\getIteratorFn.js", "./reactProdInvariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\reactProdInvariant.js", "_process": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\process\\browser.js", "fbjs/lib/invariant": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\invariant.js", "fbjs/lib/warning": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\fbjs\\lib\\warning.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js": [function(require, module, exports) {
    module.exports = require("./lib/React");
  }, { "./lib/React": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\lib\\React.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\DialogActions.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.show = show;
    exports.hide = hide;

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function show(browser) {
      _dispatcher2.default.dispatch({
        type: "SHOW_DIALOG",
        browser,
      });
    }

    function hide() {
      _dispatcher2.default.dispatch({
        type: "HIDE_DIALOG",
      });
    }
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\QuotesActions.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.createQuote = createQuote;
    exports.createTeacher = createTeacher;
    exports.refreshQuotes = refreshQuotes;
    exports.refreshTeachers = refreshTeachers;

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function createQuote(obj) {
      _dispatcher2.default.dispatch({
        type: "CREATE_QUOTE",
        text: obj.text,
        teacher: obj.teacher,
        info: obj.info,
        name: obj.name,
      });
    }

    function createTeacher(obj) {
      _dispatcher2.default.dispatch({
        type: "CREATE_TEACHER",
        name: obj.name,
      });
    }

    function refreshQuotes() {
      _dispatcher2.default.dispatch({
        type: "REFRESH_QUOTES",
      });
    }

    function refreshTeachers() {
      _dispatcher2.default.dispatch({
        type: "REFRESH_TEACHERS",
      });
    }
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SettingsActions.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.showSettings = showSettings;
    exports.changeTab = changeTab;

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function showSettings(tab) {
      _dispatcher2.default.dispatch({
        type: "SHOW_SETTINGS",
        tab,
      });
    }

    function changeTab(tab) {
      _dispatcher2.default.dispatch({
        type: "CHANGE_TAB",
        tab,
      });
    }
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SnackbarActions.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.show = show;
    exports.hide = hide;

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function show(text) {
      _dispatcher2.default.dispatch({
        type: "SHOW_SNACK",
        text,
      });
    }

    function hide() {
      _dispatcher2.default.dispatch({
        type: "HIDE_SNACK",
      });
    }
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\app.js": [function(require, module, exports) {
    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _reactDom = require("react-dom");

    const _reactDom2 = _interopRequireDefault(_reactDom);

    const _Layout = require("./components/Layout");

    const _Layout2 = _interopRequireDefault(_Layout);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    const app = document.getElementById("app");

    _reactDom2.default.render(_react2.default.createElement(_Layout2.default, null), app);
  }, { "./components/Layout": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Layout.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js", "react-dom": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react-dom\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Dialog.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _DialogStore = require("../stores/DialogStore");

    const _DialogStore2 = _interopRequireDefault(_DialogStore);

    const _DialogActions = require("../actions/DialogActions");

    const DialogActions = _interopRequireWildcard(_DialogActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Snackbar = (function(_React$Component) {
      _inherits(Snackbar, _React$Component);

      function Snackbar() {
        _classCallCheck(this, Snackbar);

        const _this = _possibleConstructorReturn(this, (Snackbar.__proto__ || Object.getPrototypeOf(Snackbar)).call(this));

        _this.changeVisibility = _this.changeVisibility.bind(_this);
        _this.state = {
          text: "",
          visible: false,
        };
        return _this;
      }

      _createClass(Snackbar, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _DialogStore2.default.on("dialogChange", this.changeVisibility);
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _DialogStore2.default.removeListener("dialogChange", this.changeVisibility);
        },
      }, {
        key: "changeVisibility",
        value: function changeVisibility() {
          const data = _DialogStore2.default.getProps();
          this.setState({
            text: data.text,
            visible: data.visible,
          });
        },
      }, {
        key: "dontShowAgain",
        value: function dontShowAgain() {
          const date = new Date();
          date.setDate(date.getDate() + 3650);

          document.cookie = `mainPage=true; expires=${date}`;

          DialogActions.hide();
        },
      }, {
        key: "createMarkup",
        value: function createMarkup() {
        return { __html: this.state.text };
      },
      }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement(
        "div",
        { className: `dialog${this.state.visible ? " visible" : ""}` },
        _react2.default.createElement(
          "div",
          { className: "dialog-box" },
          _react2.default.createElement(
            "div",
            { className: "dialog-main" },
            _react2.default.createElement(
              "h2",
              null,
              "Ekran pocz\u0105tkowy"
            ),
            _react2.default.createElement("p", { id: "dialog-msg", dangerouslySetInnerHTML: this.createMarkup() })
          ),
          _react2.default.createElement(
            "div",
            { className: "dialog-btns" },
            _react2.default.createElement(
              "button",
              { onClick: this.dontShowAgain, className: "flat", id: "dialog-close" },
              "Nie pokazuj wi\u0119cej"
            ),
            _react2.default.createElement(
              "button",
              { onClick: DialogActions.hide, className: "flat", id: "dialog-close" },
              "Ok"
            )
          )
        )
      );
      },
    }]);

      return Snackbar;
    }(_react2.default.Component));

    exports.default = Snackbar;
  }, { "../actions/DialogActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\DialogActions.js", "../stores/DialogStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\DialogStore.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\FloatingAB.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _SnackbarStore = require("../stores/SnackbarStore");

    const _SnackbarStore2 = _interopRequireDefault(_SnackbarStore);

    const _SettingsActions = require("../actions/SettingsActions");

    const SettingsActions = _interopRequireWildcard(_SettingsActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const FloatingAB = (function(_React$Component) {
      _inherits(FloatingAB, _React$Component);

      function FloatingAB() {
        _classCallCheck(this, FloatingAB);

        const _this = _possibleConstructorReturn(this, (FloatingAB.__proto__ || Object.getPrototypeOf(FloatingAB)).call(this));

        _this.changeSnackbar = _this.changeSnackbar.bind(_this);
        _this.state = {
          snackbar: false,
        };
        return _this;
      }

      _createClass(FloatingAB, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _SnackbarStore2.default.on("snackbarChange", this.changeSnackbar);
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _SnackbarStore2.default.removeListener("snackbarChange", this.changeSnackbar);
        },
      }, {
        key: "changeSnackbar",
        value: function changeSnackbar() {
          const data = _SnackbarStore2.default.getProps();
          this.setState({
          snackbar: data.visible,
        });
        },
      }, {
        key: "showTab",
        value: function showTab(a) {
        SettingsActions.showSettings(a);
      },
      }, {
      key: "render",
      value: function render() {
        return _react2.default.createElement(
        "div",
        { className: `fab-main${this.state.snackbar ? " fab-snackbar" : ""}` },
        _react2.default.createElement(
          "i",
          { className: "material-icons" },
          "add"
        ),
        _react2.default.createElement(
          "i",
          { className: "material-icons" },
          "close"
        ),
        _react2.default.createElement(
          "div",
          { className: "submenu" },
          _react2.default.createElement(
            "button",
            { onClick: this.showTab.bind(this, "teachers"), className: "fab-mini" },
            _react2.default.createElement(
              "span",
              null,
              _react2.default.createElement(
                "i",
                { className: "material-icons" },
                "person"
              )
            )
          ),
          _react2.default.createElement(
            "button",
            { onClick: this.showTab.bind(this, "quotes"), className: "fab-mini" },
            _react2.default.createElement(
              "span",
              null,
              _react2.default.createElement(
                "i",
                { className: "material-icons" },
                "format_quote"
              )
            )
          )
        )
      );
      },
    }]);

      return FloatingAB;
    }(_react2.default.Component));

    exports.default = FloatingAB;
  }, { "../actions/SettingsActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SettingsActions.js", "../stores/SnackbarStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SnackbarStore.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Header.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _QuotesActions = require("../actions/QuotesActions");

    const QuotesActions = _interopRequireWildcard(_QuotesActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Header = (function(_React$Component) {
      _inherits(Header, _React$Component);

      function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
      }

      _createClass(Header, [{
        key: "refreshQuotes",
        value: function refreshQuotes() {
          QuotesActions.refreshQuotes();
        },
      }, {
        key: "render",
        value: function render() {
          return _react2.default.createElement(
        "header",
        { className: "app-bar fixed" },
        _react2.default.createElement("div", { className: "status-bar" }),
        _react2.default.createElement(
          "nav",
          null,
          _react2.default.createElement(
            "div",
            { className: "title left" },
            _react2.default.createElement(
              "span",
              null,
              "Cytaty Nauczycieli"
            )
          ),
          _react2.default.createElement(
            "div",
            { className: "icons right" },
            _react2.default.createElement(
              "button",
              { onClick: this.refreshQuotes.bind(this), className: "search blink" },
              _react2.default.createElement(
                "i",
                { className: "material-icons" },
                "refresh"
              )
            )
          )
        )
      );
        },
      }]);

      return Header;
    }(_react2.default.Component));

    exports.default = Header;
  }, { "../actions/QuotesActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\QuotesActions.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Layout.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _FloatingAB = require("../components/FloatingAB");

    const _FloatingAB2 = _interopRequireDefault(_FloatingAB);

    const _Header = require("../components/Header");

    const _Header2 = _interopRequireDefault(_Header);

    const _Section = require("../components/Section");

    const _Section2 = _interopRequireDefault(_Section);

    const _Settings = require("../components/Settings");

    const _Settings2 = _interopRequireDefault(_Settings);

    const _Snackbar = require("../components/Snackbar");

    const _Snackbar2 = _interopRequireDefault(_Snackbar);

    const _Dialog = require("../components/Dialog");

    const _Dialog2 = _interopRequireDefault(_Dialog);

    const _QuotesStore = require("../stores/QuotesStore");

    const _QuotesStore2 = _interopRequireDefault(_QuotesStore);

    const _QuotesActions = require("../actions/QuotesActions");

    const QuotesActions = _interopRequireWildcard(_QuotesActions);

    const _DialogActions = require("../actions/DialogActions");

    const DialogActions = _interopRequireWildcard(_DialogActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Layout = (function(_React$Component) {
      _inherits(Layout, _React$Component);

      function Layout() {
        _classCallCheck(this, Layout);

        const _this = _possibleConstructorReturn(this, (Layout.__proto__ || Object.getPrototypeOf(Layout)).call(this));

        _this.getQuotes = _this.getQuotes.bind(_this);
        _this.state = {
          quotes: _QuotesStore2.default.getAll(),
        };
        return _this;
      }

      _createClass(Layout, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _QuotesStore2.default.on("change", this.getQuotes);

          QuotesActions.refreshTeachers();
          QuotesActions.refreshQuotes();
        },
      }, {
        key: "componentDidMount",
        value: function componentDidMount() {
          const checkBrowser = function checkBrowser() {
            const ua = navigator.userAgent;
            if (/Android/i.test(ua) && /Chrome/i.test(ua)) {
            return "Android Chrome";
          }

            const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
            const webkit = !!ua.match(/WebKit/i);
            const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

            if (iOSSafari) {
            return "iOS Safari";
          }

            return "";
          };

          const getCookie = function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
            return parts.pop().split(";").shift();
          }

            return false;
          };

          if (!getCookie("mainPage") && !navigator.standalone) {
            DialogActions.show(checkBrowser());
          }
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _QuotesStore2.default.removeListener("change", this.getQuotes);
        },
      }, {
        key: "getQuotes",
        value: function getQuotes() {
        this.setState({
          quotes: _QuotesStore2.default.getAll(),
        });
      },
      }, {
      key: "createQuote",
      value: function createQuote() {
        QuotesActions.createQuote(Date.now(), Date.now() * 2);
      },
    }, {
      key: "render",
      value: function render() {
        const quotes = this.state.quotes;


        const quotesList = quotes.map((quote) => {
        return _react2.default.createElement(_Section2.default, { quote, key: quote.id });
      });

        return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(_Header2.default, null),
        _react2.default.createElement(
          "main",
          null,
          quotesList
        ),
        _react2.default.createElement(_FloatingAB2.default, null),
        _react2.default.createElement(_Settings2.default, null),
        _react2.default.createElement(_Snackbar2.default, null),
        _react2.default.createElement(_Dialog2.default, null)
      );
      },
    }]);

      return Layout;
    }(_react2.default.Component));

    exports.default = Layout;
  }, { "../actions/DialogActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\DialogActions.js", "../actions/QuotesActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\QuotesActions.js", "../components/Dialog": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Dialog.js", "../components/FloatingAB": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\FloatingAB.js", "../components/Header": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Header.js", "../components/Section": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section.js", "../components/Settings": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings.js", "../components/Snackbar": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Snackbar.js", "../stores/QuotesStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\QuotesStore.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _Main = require("./Section/Main");

    const _Main2 = _interopRequireDefault(_Main);

    const _Footer = require("./Section/Footer");

    const _Footer2 = _interopRequireDefault(_Footer);

    const _More = require("./Section/More");

    const _More2 = _interopRequireDefault(_More);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Section = (function(_React$Component) {
      _inherits(Section, _React$Component);

      function Section() {
        _classCallCheck(this, Section);

        return _possibleConstructorReturn(this, (Section.__proto__ || Object.getPrototypeOf(Section)).apply(this, arguments));
      }

      _createClass(Section, [{
        key: "render",
        value: function render() {
          return _react2.default.createElement(
        "section",
        null,
        _react2.default.createElement(
          "blockquote",
          null,
          _react2.default.createElement(_Main2.default, { text: this.props.quote.text }),
          _react2.default.createElement(_Footer2.default, { teacher: this.props.quote.teacher }),
          _react2.default.createElement(_More2.default, { dateAdded: this.props.quote.dateAdded, info: this.props.quote.info })
        )
      );
        },
      }]);

      return Section;
    }(_react2.default.Component));

    exports.default = Section;


    Section.propTypes = {
      quote: _react2.default.PropTypes.object.isRequired,
    };
  }, { "./Section/Footer": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section\\Footer.js", "./Section/Main": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section\\Main.js", "./Section/More": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section\\More.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section\\Footer.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const SectionFooter = (function(_React$Component) {
      _inherits(SectionFooter, _React$Component);

      function SectionFooter() {
        _classCallCheck(this, SectionFooter);

        return _possibleConstructorReturn(this, (SectionFooter.__proto__ || Object.getPrototypeOf(SectionFooter)).apply(this, arguments));
      }

      _createClass(SectionFooter, [{
        key: "render",
        value: function render() {
          return _react2.default.createElement(
        "footer",
        null,
        this.props.teacher
      );
        },
      }]);

      return SectionFooter;
    }(_react2.default.Component));

    exports.default = SectionFooter;


    SectionFooter.propTypes = {
      teacher: _react2.default.PropTypes.string.isRequired,
    };
  }, { "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section\\Main.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const SectionMain = (function(_React$Component) {
      _inherits(SectionMain, _React$Component);

      function SectionMain() {
        _classCallCheck(this, SectionMain);

        return _possibleConstructorReturn(this, (SectionMain.__proto__ || Object.getPrototypeOf(SectionMain)).apply(this, arguments));
      }

      _createClass(SectionMain, [{
        key: "render",
        value: function render() {
          return _react2.default.createElement("main", { dangerouslySetInnerHTML: { __html: this.props.text } });
        },
      }]);

      return SectionMain;
    }(_react2.default.Component));

    exports.default = SectionMain;


    SectionMain.propTypes = {
      text: _react2.default.PropTypes.string.isRequired,
    };
  }, { "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Section\\More.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const SectionMore = (function(_React$Component) {
      _inherits(SectionMore, _React$Component);

      function SectionMore() {
        _classCallCheck(this, SectionMore);

        const _this = _possibleConstructorReturn(this, (SectionMore.__proto__ || Object.getPrototypeOf(SectionMore)).call(this));

        _this.toggleMore = _this.toggleMore.bind(_this);
        _this.state = {
          hidden: true,
        };
        return _this;
      }

      _createClass(SectionMore, [{
        key: "toggleMore",
        value: function toggleMore() {
          this.setState({
            hidden: !this.state.hidden,
          });
        },
      }, {
        key: "returnDate",
        value: function returnDate(stringDate) {
          const strdate = `${stringDate.replace(" ", "T")}+01:00`;
          const date = new Date(strdate);
          const t2d = function t2d(a) {
            return (`00${a}`).slice(-2);
          };

          return `${t2d(date.getDate())}.${t2d(date.getMonth() + 1)}.${date.getFullYear()}`;
        },
      }, {
        key: "returnInfo",
        value: function returnInfo(infoText) {
          return _react2.default.createElement(
        "div",
        { className: "desc" },
        _react2.default.createElement(
          "p",
          { className: "header" },
          "Dodatkowe informacje"
        ),
        _react2.default.createElement(
          "p",
          null,
          infoText
        )
      );
        },
      }, {
        key: "render",
        value: function render() {
        const info = this.props.info !== "" ? this.returnInfo(this.props.info) : null;

        return _react2.default.createElement(
        "div",
        { className: this.state.hidden ? "hidden" : "" },
        _react2.default.createElement(
          "nav",
          { onClick: this.toggleMore, className: "blink-big blink-black" },
          _react2.default.createElement(
            "div",
            { className: "expand-text" },
            "POKA\u017B WI\u0118CEJ INFORMACJI"
          ),
          _react2.default.createElement(
            "div",
            { className: "expand" },
            _react2.default.createElement("i", { className: "material-icons" })
          )
        ),
        _react2.default.createElement(
          "aside",
          null,
          _react2.default.createElement(
            "div",
            { className: "more" },
            _react2.default.createElement(
              "div",
              { className: "time" },
              _react2.default.createElement(
                "p",
                { className: "header" },
                "Data dodania"
              ),
              _react2.default.createElement(
                "p",
                null,
                _react2.default.createElement(
                  "time",
                  null,
                  this.returnDate(this.props.dateAdded)
                )
              )
            ),
            info
          )
        )
      );
      },
      }]);

      return SectionMore;
    }(_react2.default.Component));

    exports.default = SectionMore;


    SectionMore.propTypes = {
      dateAdded: _react2.default.PropTypes.string,
      info: _react2.default.PropTypes.string,
    };
  }, { "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _SettingsStore = require("../stores/SettingsStore");

    const _SettingsStore2 = _interopRequireDefault(_SettingsStore);

    const _SettingsActions = require("../actions/SettingsActions");

    const SettingsActions = _interopRequireWildcard(_SettingsActions);

    const _Main = require("./Settings/Main");

    const _Main2 = _interopRequireDefault(_Main);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Settings = (function(_React$Component) {
      _inherits(Settings, _React$Component);

      function Settings() {
        _classCallCheck(this, Settings);

        const _this = _possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).call(this));

        _this.toggleSettings = _this.toggleSettings.bind(_this);
        _this.state = {
          visible: _SettingsStore2.default.getSettingsVisible(),
          tab: _SettingsStore2.default.getTab(),
        };
        return _this;
      }

      _createClass(Settings, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _SettingsStore2.default.on("settingsChange", this.toggleSettings);
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _SettingsStore2.default.removeListener("settingsChange", this.toggleSettings);
        },
      }, {
        key: "toggleSettings",
        value: function toggleSettings() {
          this.setState({
          visible: _SettingsStore2.default.getSettingsVisible(),
          tab: _SettingsStore2.default.getTab(),
        });
        },
      }, {
        key: "hideSettings",
        value: function hideSettings() {
        SettingsActions.showSettings(null);
      },
      }, {
      key: "isVisible",
      value: function isVisible() {
        if (this.state.visible) {
          document.body.className = "settings-shown";
          return " shown";
        }
        document.body.className = "";
        return "";
      },
    }, {
      key: "showTab",
      value: function showTab(a) {
        SettingsActions.showSettings(a);
      },
    }, {
      key: "changeTab",
      value: function changeTab(a) {
      SettingsActions.changeTab(a);
    },
    }, {
    key: "render",
    value: function render() {
      const classNamePane = `settings-pane${this.isVisible()}`;
      let content = null;
      let QuotesClasses = "blink-big";
      let TeachersClasses = "blink-big";

      switch (this.state.tab) {
        case "quotes":
          // content = (<Quotes />);
          QuotesClasses = `selected ${QuotesClasses}`;
          break;
        case "teachers":
          // content = (<Teachers />);
          TeachersClasses = `selected ${TeachersClasses}`;
          break;
        default:
          content = null;
      }

      return _react2.default.createElement(
        "div",
        { className: classNamePane },
        _react2.default.createElement(
          "header",
          { className: "app-bar" },
          _react2.default.createElement("div", { className: "status-bar" }),
          _react2.default.createElement(
            "nav",
            null,
            _react2.default.createElement(
              "div",
              { className: "icons left" },
              _react2.default.createElement(
                "button",
                { onClick: this.hideSettings, className: "search blink" },
                _react2.default.createElement(
                  "i",
                  { className: "material-icons" },
                  "close"
                )
              ),
              _react2.default.createElement(
                "span",
                null,
                "Nowy rekord"
              )
            )
          ),
          _react2.default.createElement(
            "ul",
            { className: "tabs" },
            _react2.default.createElement(
              "li",
              { className: QuotesClasses },
              _react2.default.createElement(
                "button",
                { onClick: this.changeTab.bind(this, "quotes") },
                "CYTATY"
              )
            ),
            _react2.default.createElement(
              "li",
              { className: TeachersClasses },
              _react2.default.createElement(
                "button",
                { onClick: this.changeTab.bind(this, "teachers") },
                "NAUCZYCIELE"
              )
            )
          )
        ),
        _react2.default.createElement(
          "main",
          null,
          _react2.default.createElement(_Main2.default, { tab: this.state.tab })
        )
      );
    },
  }]);

      return Settings;
    }(_react2.default.Component));

    exports.default = Settings;
  }, { "../actions/SettingsActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SettingsActions.js", "../stores/SettingsStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SettingsStore.js", "./Settings/Main": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Main.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Input.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) { return typeof obj; } : function(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _SettingsStore = require("../../stores/SettingsStore");

    const _SettingsStore2 = _interopRequireDefault(_SettingsStore);

    const _QuotesStore = require("../../stores/QuotesStore");

    const _QuotesStore2 = _interopRequireDefault(_QuotesStore);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Input = (function(_React$Component) {
      _inherits(Input, _React$Component);

      function Input() {
        _classCallCheck(this, Input);

        const _this = _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).call(this));

        _this.setTouched = _this.setTouched.bind(_this);
        _this.setDirty = _this.setDirty.bind(_this);
        _this.handleChange = _this.handleChange.bind(_this);
        _this.handleBlur = _this.handleBlur.bind(_this);
        _this.handleRadio = _this.handleRadio.bind(_this);
        _this.clearState = _this.clearState.bind(_this);
        _this.openLabel = _this.openLabel.bind(_this);
        _this.closeLabel = _this.closeLabel.bind(_this);
        _this.getTeachers = _this.getTeachers.bind(_this);
        _this.validate = _this.validate.bind(_this);
        _this.state = {
          dirty: false,
          touched: false,
          valid: true,
          value: "",
          selectValue: "",
          radioSelected: 0,
          openSelect: false,
          teachers: [{ "id": -1, "name": "" }],
        };
        return _this;
      }

      _createClass(Input, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _SettingsStore2.default.on("settingsChange", this.clearState);
          _QuotesStore2.default.on("teachersUpdate", this.getTeachers);

          if (this.props.type === "select") {
            const value = this.state.teachers[0];

            this.setState({ selectValue: value.name });
            this.props.setValue(this.props.id, value.id);
          }

          const makeValid = this.props.makeValid;
          const id = this.props.id;

          if (this.props.required) {
            makeValid(id, false);
          }
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _SettingsStore2.default.removeListener("settingsChange", this.clearState);
          _QuotesStore2.default.removeListener("teachersUpdate", this.getTeachers);
        },
      }, {
        key: "getTeachers",
        value: function getTeachers() {
          if (this.props.type === "select") {
            const teachers = _QuotesStore2.default.returnTeachers();
            this.setState({
            teachers,
            selectValue: teachers[0].name,
            radioSelected: 0,
          });

            this.setState({
            value: teachers[0].name,
          });
            this.props.setValue(this.props.id, teachers[0].id);
          }
        },
      }, {
        key: "setTouched",
        value: function setTouched() {
          this.setState({ touched: true });
        },
      }, {
        key: "setDirty",
        value: function setDirty(e) {
        if (e.target.value !== "") {
          this.setState({ dirty: true });
        } else {
          this.setState({ dirty: false });
        }
      },
      }, {
      key: "clearState",
      value: function clearState() {
        this.setState({
        dirty: false,
        touched: false,
        valid: true,
        value: "",
        selectValue: "",
        radioSelected: 0,
        openSelect: false,
      });
      },
    }, {
      key: "validate",
      value: function validate(e) {
      const makeValid = this.props.makeValid;
      const id = this.props.id;
      if (this.props.required) {
        if (e.target.value !== "") {
          this.setState({ valid: true });
          makeValid(id, true);
        } else {
          this.setState({ valid: false });
          makeValid(id, false);
        }
      } else {
        makeValid(id, true);
      }
    },
    }, {
    key: "handleBlur",
    value: function handleBlur(e) {
      this.validate(e);
      this.setState({ touched: true });
    },
  }, {
    key: "handleChange",
    value: function handleChange(e) {
      let value = "";
      if (this.props.type === "select") {
        value = e.target.selectedOptions[0].id;
      } else {
        value = e.target.value;
      }

      this.setDirty(e);
      this.setState({
        value: e.target.value,
      });
      this.validate(e);
      this.props.setValue(this.props.id, value);
    },
  }, {
    key: "handleRadio",
    value: function handleRadio(e) {
      const elId = e.target.id.substring(this.props.id.length + 1) * 1;
      const value = this.state.teachers[elId];
      this.setDirty(e);
      this.setState({
        value: e.target.value,
        selectValue: value.name,
        radioSelected: elId,
      });
      this.validate(e);
      this.props.setValue(this.props.id, value.id);
    },
  }, {
    key: "openLabel",
    value: function openLabel() {
      this.setState({ openSelect: true });
    },
  }, {
    key: "closeLabel",
    value: function closeLabel() {
      const _this2 = this;

      setTimeout(() => {
        _this2.setState({ openSelect: false });
      }, 100);
    },
  }, {
    key: "render",
    value: function render() {
      const _this3 = this;

      const classNames = [];

      if (this.state.touched) {
        classNames.push("touched");
      }

      if (this.state.dirty) {
        classNames.push("dirty");
      }

      if (!this.state.valid) {
        classNames.push("invalid");
      }

      const _ret = (function() {
        switch (_this3.props.type) {
          case "input":
            return {
              v: _react2.default.createElement("input", { onBlur: _this3.handleBlur, onChange: _this3.handleChange, type: "text", value: _this3.state.value, className: classNames.join(" "), id: _this3.props.id, required: _this3.props.required }),
            };
          case "textarea":
            return {
              v: _react2.default.createElement("textarea", { onBlur: _this3.handleBlur, onChange: _this3.handleChange, type: "text", value: _this3.state.value, className: classNames.join(" "), id: _this3.props.id, required: _this3.props.required }),
            };
          case "select":
            // eslint-disable-line
            var options = [];
            var radioOptions = [];
            _this3.state.teachers.forEach((v, i) => {
              options.push(_react2.default.createElement("input", { onChange: _this3.handleRadio, name: _this3.props.id, key: `${_this3.props.id}-${i}`, id: `${_this3.props.id}-${i}`, type: "radio", checked: i === _this3.state.radioSelected }));

              let className = "";
              if (i === _this3.state.radioSelected) {
                className += "current";
              }

              radioOptions.push(_react2.default.createElement(
                "label",
                { key: `${_this3.props.id}-label-${i}`, htmlFor: `${_this3.props.id}-${i}`, className },
                v.name
              ));
            });

            return {
              v: _react2.default.createElement(
                "div",
                { className: "select-group" },
                options,
                _react2.default.createElement(
                  "div",
                  { className: _this3.state.openSelect ? "select-container open" : "select-container" },
                  _react2.default.createElement(
                    "button",
                    { onBlur: _this3.closeLabel, onClick: _this3.openLabel, onFocus: _this3.openLabel, type: "button" },
                    _this3.state.selectValue,
                    _react2.default.createElement(
                      "i",
                      { className: "material-icons" },
                      "arrow_drop_down"
                    )
                  ),
                  _react2.default.createElement(
                    "div",
                    { className: "select-options-container" },
                    _react2.default.createElement(
                      "div",
                      { className: "select-options" },
                      radioOptions
                    )
                  )
                )
              ),
            };
          default:
            return {
              v: null,
            };
        }
      }());

      if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    },
  }]);

      return Input;
    }(_react2.default.Component));

    exports.default = Input;


    Input.propTypes = {
      id: _react2.default.PropTypes.string.isRequired,
      type: _react2.default.PropTypes.string.isRequired,
      required: _react2.default.PropTypes.bool,
      makeValid: _react2.default.PropTypes.func,
      setValue: _react2.default.PropTypes.func,
    };
  }, { "../../stores/QuotesStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\QuotesStore.js", "../../stores/SettingsStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SettingsStore.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Main.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _Quotes = require("./Quotes");

    const _Quotes2 = _interopRequireDefault(_Quotes);

    const _Teachers = require("./Teachers");

    const _Teachers2 = _interopRequireDefault(_Teachers);

    const _QuotesActions = require("../../actions/QuotesActions");

    const QuotesActions = _interopRequireWildcard(_QuotesActions);

    const _SettingsActions = require("../../actions/SettingsActions");

    const SettingsActions = _interopRequireWildcard(_SettingsActions);

    const _SettingsStore = require("../../stores/SettingsStore");

    const _SettingsStore2 = _interopRequireDefault(_SettingsStore);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Main = (function(_React$Component) {
      _inherits(Main, _React$Component);

      function Main() {
        _classCallCheck(this, Main);

        const _this = _possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).call(this));

        _this.setValue = _this.setValue.bind(_this);
        _this.makeValid = _this.makeValid.bind(_this);
        _this.handleQuotesSubmit = _this.handleQuotesSubmit.bind(_this);
        _this.handleTeachersSubmit = _this.handleTeachersSubmit.bind(_this);
        _this.changeTab = _this.changeTab.bind(_this);
        _this.state = {
          valid: [],
          values: [],
        };
        return _this;
      }

      _createClass(Main, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _SettingsStore2.default.on("settingsChange", this.changeTab);
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _SettingsStore2.default.removeListener("settingsChange", this.changeTab);
        },
      }, {
        key: "setValue",
        value: function setValue(id, text) {
          const values = this.state.values;
          values[id] = text;
          this.setState({ values });
        },
      }, {
        key: "changeTab",
        value: function changeTab() {
          this.setState({
          valid: [],
          values: [],
        });
        },
      }, {
        key: "makeValid",
        value: function makeValid(id, isValid) {
        const valid = this.state.valid;
        valid[id] = isValid;
        this.setState({ valid });
      },
      }, {
      key: "isValid",
      value: function isValid(e) {
        e.preventDefault();
        let allValid = void 0;
        allValid = true;

        const valid = this.state.valid;

      /* eslint-disable no-restricted-syntax */
        for (const val in valid) {
        if ({}.hasOwnProperty.call(valid, val)) {
          if (valid[val] === false) {
            allValid = false;
          }
        }
      }
      /* eslint-enable no-restricted-syntax */

        return allValid;
      },
    }, {
      key: "handleQuotesSubmit",
      value: function handleQuotesSubmit(e) {
      const allValid = this.isValid(e);
      if (allValid) {
        console.log(this.state.values);
        QuotesActions.createQuote(this.state.values);
        SettingsActions.showSettings(null);
        this.setState({ valid: [], values: [] });
      } else {
        console.log(this.state.valid, allValid);
      }
    },
    }, {
    key: "handleTeachersSubmit",
    value: function handleTeachersSubmit(e) {
      const allValid = this.isValid(e);
      if (allValid) {
        console.log(this.state.values);
        QuotesActions.createTeacher(this.state.values);
        SettingsActions.showSettings(null);
        this.setState({ valid: [], values: [] });
      } else {
        console.log(this.state.valid, allValid);
      }
    },
  }, {
    key: "render",
    value: function render() {
      switch (_SettingsStore2.default.getTab()) {
        case "quotes":
          return _react2.default.createElement(_Quotes2.default, { handleSubmit: this.handleQuotesSubmit, setValue: this.setValue, makeValid: this.makeValid });
        case "teachers":
          return _react2.default.createElement(_Teachers2.default, { handleSubmit: this.handleTeachersSubmit, setValue: this.setValue, makeValid: this.makeValid });
        default:
          return null;
      }
    },
  }]);

      return Main;
    }(_react2.default.Component));

    exports.default = Main;
  }, { "../../actions/QuotesActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\QuotesActions.js", "../../actions/SettingsActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SettingsActions.js", "../../stores/SettingsStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SettingsStore.js", "./Quotes": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Quotes.js", "./Teachers": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Teachers.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Quotes.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _Input = require("./Input");

    const _Input2 = _interopRequireDefault(_Input);

    const _QuotesActions = require("../../actions/QuotesActions");

    const QuotesActions = _interopRequireWildcard(_QuotesActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Quotes = (function(_React$Component) {
      _inherits(Quotes, _React$Component);

      function Quotes() {
        _classCallCheck(this, Quotes);

        const _this = _possibleConstructorReturn(this, (Quotes.__proto__ || Object.getPrototypeOf(Quotes)).call(this));

        _this.state = {
          teachers: [],
        };
        return _this;
      }

      _createClass(Quotes, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          QuotesActions.refreshTeachers();
        },
      }, {
        key: "render",
        value: function render() {
          const props = this.props;

          return _react2.default.createElement(
        "form",
        { onSubmit: props.handleSubmit },
        _react2.default.createElement(
          "div",
          { className: "form-group" },
          _react2.default.createElement(_Input2.default, { setValue: props.setValue, makeValid: props.makeValid, type: "textarea", id: "text", required: true }),
          _react2.default.createElement(
            "label",
            { htmlFor: "text" },
            "Tre\u015B\u0107 cytatu"
          ),
          _react2.default.createElement("div", { className: "border" })
        ),
        _react2.default.createElement(
          "div",
          { className: "form-group" },
          _react2.default.createElement(_Input2.default, { setValue: props.setValue, makeValid: props.makeValid, type: "select", id: "teacher" }),
          _react2.default.createElement(
            "label",
            { htmlFor: "teacher" },
            "Nauczyciel"
          ),
          _react2.default.createElement("div", { className: "border" })
        ),
        _react2.default.createElement(
          "div",
          { className: "form-group" },
          _react2.default.createElement(_Input2.default, { setValue: props.setValue, makeValid: props.makeValid, type: "textarea", id: "info" }),
          _react2.default.createElement(
            "label",
            { htmlFor: "info" },
            "Dodatkowe informacje"
          ),
          _react2.default.createElement("div", { className: "border" })
        ),
        _react2.default.createElement(
          "div",
          { className: "form-group" },
          _react2.default.createElement(_Input2.default, { setValue: props.setValue, makeValid: props.makeValid, type: "input", id: "name" }),
          _react2.default.createElement(
            "label",
            { htmlFor: "name" },
            "Twoje imi\u0119"
          ),
          _react2.default.createElement("div", { className: "border" })
        ),
        _react2.default.createElement(
          "button",
          { type: "submit", className: "raised blink-big" },
          "Dodaj"
        )
      );
        },
      }]);

      return Quotes;
    }(_react2.default.Component));

    exports.default = Quotes;
  }, { "../../actions/QuotesActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\QuotesActions.js", "./Input": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Input.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Teachers.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _Input = require("./Input");

    const _Input2 = _interopRequireDefault(_Input);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Quotes = (function(_React$Component) {
      _inherits(Quotes, _React$Component);

      function Quotes() {
        _classCallCheck(this, Quotes);

        return _possibleConstructorReturn(this, (Quotes.__proto__ || Object.getPrototypeOf(Quotes)).apply(this, arguments));
      }

      _createClass(Quotes, [{
        key: "render",
        value: function render() {
          const props = this.props;

          return _react2.default.createElement(
        "form",
        { onSubmit: props.handleSubmit },
        _react2.default.createElement(
          "div",
          { className: "form-group" },
          _react2.default.createElement(_Input2.default, { setValue: props.setValue, makeValid: props.makeValid, type: "input", id: "name", required: true }),
          _react2.default.createElement(
            "label",
            { htmlFor: "name" },
            "Imi\u0119 i nazwisko nauczyciela"
          ),
          _react2.default.createElement("div", { className: "border" })
        ),
        _react2.default.createElement(
          "button",
          { type: "submit", className: "raised blink-big" },
          "Dodaj"
        )
      );
        },
      }]);

      return Quotes;
    }(_react2.default.Component));

    exports.default = Quotes;
  }, { "./Input": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Settings\\Input.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\components\\Snackbar.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _react = require("react");

    const _react2 = _interopRequireDefault(_react);

    const _SnackbarStore = require("../stores/SnackbarStore");

    const _SnackbarStore2 = _interopRequireDefault(_SnackbarStore);

    const _SnackbarActions = require("../actions/SnackbarActions");

    const SnackbarActions = _interopRequireWildcard(_SnackbarActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const Snackbar = (function(_React$Component) {
      _inherits(Snackbar, _React$Component);

      function Snackbar() {
        _classCallCheck(this, Snackbar);

        const _this = _possibleConstructorReturn(this, (Snackbar.__proto__ || Object.getPrototypeOf(Snackbar)).call(this));

        _this.changeVisibility = _this.changeVisibility.bind(_this);
        _this.state = {
          text: "",
          visible: false,
        };
        return _this;
      }

      _createClass(Snackbar, [{
        key: "componentWillMount",
        value: function componentWillMount() {
          _SnackbarStore2.default.on("snackbarChange", this.changeVisibility);
        },
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          _SnackbarStore2.default.removeListener("snackbarChange", this.changeVisibility);
        },
      }, {
        key: "changeVisibility",
        value: function changeVisibility() {
          const data = _SnackbarStore2.default.getProps();
          this.setState({
            text: data.text,
            visible: data.visible,
          });
        },
      }, {
        key: "render",
        value: function render() {
          return _react2.default.createElement(
        "div",
        { onClick: SnackbarActions.hide, className: `snackbar${this.state.visible ? " visible" : ""}` },
        this.state.text
      );
        },
      }]);

      return Snackbar;
    }(_react2.default.Component));

    exports.default = Snackbar;
  }, { "../actions/SnackbarActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SnackbarActions.js", "../stores/SnackbarStore": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SnackbarStore.js", "react": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\react\\react.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _flux = require("flux");

    exports.default = new _flux.Dispatcher();
  }, { "flux": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\flux\\index.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\DialogStore.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _events = require("events");

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const DialogStore = (function(_EventEmitter) {
      _inherits(DialogStore, _EventEmitter);

      function DialogStore() {
        _classCallCheck(this, DialogStore);

        const _this = _possibleConstructorReturn(this, (DialogStore.__proto__ || Object.getPrototypeOf(DialogStore)).call(this));

        _this.hideDialog = _this.hideDialog.bind(_this);
        _this.visible = false;
        _this.text = "";
        return _this;
      }

      _createClass(DialogStore, [{
        key: "showDialog",
        value: function showDialog(browser) {
          this.visible = true;
          const tutorialIntro = "Aby dodać tę stronę do ekranu głównego i używać jej jak zwykłej aplikacji:";
          switch (browser) { // eslint-disable-line default-case
            case "Android Chrome":
              this.text = `${tutorialIntro}<br>1. Naci\u015Bnij \u201Ewi\u0119cej opcji\u201D&nbsp;<i class="material-icons">more_vert</i><br>2. Naci\u015Bnij \u201EDodaj do ekranu g\u0142\xF3wnego\u201D`;
              break;
            case "iOS Safari":
              this.text = `${tutorialIntro}<br>1. Naci\u015Bnij \u201Eprzycisk udost\u0119pniania\u201D&nbsp;&nbsp;<img class="apple-icon" src="./img/apple-share-button.png"><br>2. Naci\u015Bnij \u201EDodaj do ekranu pocz\u0105tk.\u201D&nbsp;&nbsp;<img class="apple-icon" src="./img/apple-add-button.png">`;
              break;
            default:
              this.text = "";
              this.visible = false;
          }

          this.emit("dialogChange");
        },
      }, {
        key: "hideDialog",
        value: function hideDialog() {
          this.visible = false;
          this.emit("dialogChange");
        },
      }, {
        key: "getProps",
        value: function getProps() {
          return { visible: this.visible, text: this.text };
        },

    /* eslint-disable default-case */

      }, {
        key: "handleActions",
        value: function handleActions(action) {
        switch (action.type) {
          case "SHOW_DIALOG":
            this.showDialog(action.browser);
            break;
          case "HIDE_DIALOG":
            this.hideDialog();
            break;
        }
      },
    /* eslint-enable default-case */

      }]);

      return DialogStore;
    }(_events.EventEmitter));

    const dialogStore = new DialogStore();
    _dispatcher2.default.register(dialogStore.handleActions.bind(dialogStore));

    exports.default = dialogStore;
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js", "events": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\events\\events.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\QuotesStore.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _events = require("events");

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    const _SnackbarActions = require("../actions/SnackbarActions");

    const SnackbarActions = _interopRequireWildcard(_SnackbarActions);

    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } const newObj = {}; if (obj != null) { for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const QuotesStore = (function(_EventEmitter) {
      _inherits(QuotesStore, _EventEmitter);

      function QuotesStore() {
        _classCallCheck(this, QuotesStore);

        const _this = _possibleConstructorReturn(this, (QuotesStore.__proto__ || Object.getPrototypeOf(QuotesStore)).call(this));

        _this.quotes = [];
        _this.teachers = [{ "id": -1, "name": "" }];
        return _this;
      }

      _createClass(QuotesStore, [{
        key: "createQuote",
        value: function createQuote(text, teacher, info, name) {
          const _this2 = this;

          $.ajax({
            method: "POST",
            url: "https://cytaty.legiec.io/add_quote.php",
            data: {
              text,
              teacher,
              date: "",
              info,
              name,
            },
          }).done(() => {
            SnackbarActions.show("Wysłano cytat do zaakceptowania.");
            _this2.emit("change");
          }).fail(() => {
            console.log("");
          });
        },
      }, {
        key: "createTeacher",
        value: function createTeacher(name) {
          const _this3 = this;

          $.ajax({
            method: "POST",
            url: "https://cytaty.legiec.io/add_teacher.php",
            data: {
              name,
            },
          }).done(() => {
            SnackbarActions.show("Dodano nauczyciela.");
            _this3.emit("change");
          }).fail(() => {
          console.log("");
        });
        },
      }, {
        key: "refreshQuotes",
        value: function refreshQuotes() {
          const _this4 = this;

          $.ajax({
            method: "POST",
            url: "https://cytaty.legiec.io/get_quotes.php",
          }).done((msgA) => {
          const msg = msgA === Object(msgA) ? msgA : JSON.parse(msgA);
          _this4.quotes = msg;

          _this4.emit("change");
        }).fail(() => {
          console.log("");
        });
        },
      }, {
        key: "refreshTeachers",
        value: function refreshTeachers() {
          const _this5 = this;

          $.ajax({
          method: "POST",
          url: "https://cytaty.legiec.io/get_teachers.php",
        }).done((msg) => {
          _this5.teachers = msg;

          _this5.emit("teachersUpdate");
        }).fail(() => {
        console.log("");
      });
        },
      }, {
        key: "returnTeachers",
        value: function returnTeachers() {
        return this.teachers;
      },
      }, {
      key: "getAll",
      value: function getAll() {
        return this.quotes;
      },

    /* eslint-disable default-case */

    }, {
      key: "handleActions",
      value: function handleActions(action) {
      switch (action.type) {
        case "CREATE_QUOTE":
          this.createQuote(action.text, action.teacher, action.info, action.name);
          break;
        case "CREATE_TEACHER":
          this.createTeacher(action.name);
          break;
        case "REFRESH_QUOTES":
          this.refreshQuotes();
          break;
        case "REFRESH_TEACHERS":
          this.refreshTeachers();
          break;
      }
    },
    /* eslint-enable default-case */

    }]);

      return QuotesStore;
    }(_events.EventEmitter));

    const quotesStore = new QuotesStore();
    _dispatcher2.default.register(quotesStore.handleActions.bind(quotesStore));

    exports.default = quotesStore;
  }, { "../actions/SnackbarActions": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\actions\\SnackbarActions.js", "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js", "events": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\events\\events.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SettingsStore.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _events = require("events");

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const SettingsStore = (function(_EventEmitter) {
      _inherits(SettingsStore, _EventEmitter);

      function SettingsStore() {
        _classCallCheck(this, SettingsStore);

        const _this = _possibleConstructorReturn(this, (SettingsStore.__proto__ || Object.getPrototypeOf(SettingsStore)).call(this));

        _this.settings = false;
        _this.tab = null;
        return _this;
      }

      _createClass(SettingsStore, [{
        key: "toggleSettings",
        value: function toggleSettings(a) {
          if (a !== null) {
            this.tab = a;
          }
          this.settings = !this.settings;
          this.emit("settingsChange");
        },
      }, {
        key: "changeTab",
        value: function changeTab(a) {
          this.tab = a;
          this.emit("settingsChange");
        },
      }, {
        key: "getTab",
        value: function getTab() {
          return this.tab;
        },
      }, {
        key: "getSettingsVisible",
        value: function getSettingsVisible() {
        return this.settings;
      },

    /* eslint-disable default-case */

      }, {
      key: "handleActions",
      value: function handleActions(action) {
        switch (action.type) {
          case "SHOW_SETTINGS":
            this.toggleSettings(action.tab);
            break;
          case "CHANGE_TAB":
            this.changeTab(action.tab);
            break;
        }
      },
    /* eslint-enable default-case */

    }]);

      return SettingsStore;
    }(_events.EventEmitter));

    const settingsStore = new SettingsStore();
    _dispatcher2.default.register(settingsStore.handleActions.bind(settingsStore));

    exports.default = settingsStore;
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js", "events": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\events\\events.js" }],
  "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\stores\\SnackbarStore.js": [function(require, module, exports) {
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });

    const _createClass = (function() { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { const descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function(Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }());

    const _events = require("events");

    const _dispatcher = require("../dispatcher");

    const _dispatcher2 = _interopRequireDefault(_dispatcher);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    const SnackbarStore = (function(_EventEmitter) {
      _inherits(SnackbarStore, _EventEmitter);

      function SnackbarStore() {
        _classCallCheck(this, SnackbarStore);

        const _this = _possibleConstructorReturn(this, (SnackbarStore.__proto__ || Object.getPrototypeOf(SnackbarStore)).call(this));

        _this.hideSnackbar = _this.hideSnackbar.bind(_this);
        _this.visible = false;
        _this.text = "";
        _this.timeout = null;
        return _this;
      }

      _createClass(SnackbarStore, [{
        key: "showSnackbar",
        value: function showSnackbar(text) {
          this.visible = true;
          this.text = text;
          this.timeout = setTimeout(this.hideSnackbar, 3000);
          this.emit("snackbarChange");
        },
      }, {
        key: "hideSnackbar",
        value: function hideSnackbar() {
          clearTimeout(this.timeout);
          this.visible = false;
          this.emit("snackbarChange");
        },
      }, {
        key: "getProps",
        value: function getProps() {
          return { visible: this.visible, text: this.text };
        },

    /* eslint-disable default-case */

      }, {
        key: "handleActions",
        value: function handleActions(action) {
        switch (action.type) {
          case "SHOW_SNACK":
            this.showSnackbar(action.text);
            break;
          case "HIDE_SNACK":
            this.hideSnackbar();
            break;
        }
      },
    /* eslint-enable default-case */

      }]);

      return SnackbarStore;
    }(_events.EventEmitter));

    const snackbarStore = new SnackbarStore();
    _dispatcher2.default.register(snackbarStore.handleActions.bind(snackbarStore));

    exports.default = snackbarStore;
  }, { "../dispatcher": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\dispatcher.js", "events": "C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\node_modules\\events\\events.js" }] }, {}, ["C:\\Users\\Bartek\\Projekty\\cytaty.github.io\\src\\js\\app.js"]));

// # sourceMappingURL=app.js.map
