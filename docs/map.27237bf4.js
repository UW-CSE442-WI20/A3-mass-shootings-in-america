// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"us-states.json":[function(require,module,exports) {
module.exports = {
  "type": "Topology",
  "bbox": [-57.66491068874468, 12.97635452036684, 957.5235629133763, 606.5694262668667],
  "transform": {
    "scale": [0.010151986255883769, 0.005935990077365771],
    "translate": [-57.66491068874468, 12.97635452036684]
  },
  "objects": {
    "states": {
      "type": "GeometryCollection",
      "geometries": [{
        "type": "MultiPolygon",
        "arcs": [[[0]], [[1, 2, 3, 4, 5]]],
        "id": "01",
        "properties": {
          "name": "Alabama"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[6]], [[7]], [[8]], [[9]], [[10]], [[11]], [[12]], [[13]], [[14]], [[15]], [[16]], [[17]], [[18]], [[19]], [[20]], [[21]], [[22]], [[23]], [[24]], [[25]], [[26]], [[27]], [[28]], [[29]], [[30]], [[31]], [[32]], [[33]], [[34]], [[35]], [[36]], [[37]], [[38]], [[39]], [[40]], [[41]], [[42]], [[43]], [[44]], [[45]], [[46]], [[47]], [[48]], [[49]], [[50]], [[51]], [[52]], [[53]], [[54]], [[55]], [[56]], [[57]], [[58]], [[59]], [[60]], [[61]]],
        "id": "02",
        "properties": {
          "name": "Alaska"
        }
      }, {
        "type": "Polygon",
        "arcs": [[62, 63, 64, 65, 66]],
        "id": "04",
        "properties": {
          "name": "Arizona"
        }
      }, {
        "type": "Polygon",
        "arcs": [[67, 68, 69, 70, 71, 72]],
        "id": "08",
        "properties": {
          "name": "Colorado"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[73]], [[74]], [[75]], [[76]], [[77]], [[78]], [[79]], [[80]], [[81]], [[82, 83, -4]]],
        "id": "12",
        "properties": {
          "name": "Florida"
        }
      }, {
        "type": "Polygon",
        "arcs": [[84, 85, 86, 87, -83, -3]],
        "id": "13",
        "properties": {
          "name": "Georgia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[88, 89, 90, 91, 92]],
        "id": "18",
        "properties": {
          "name": "Indiana"
        }
      }, {
        "type": "Polygon",
        "arcs": [[93, 94, 95, -70]],
        "id": "20",
        "properties": {
          "name": "Kansas"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[96]], [[97]], [[98]], [[99]], [[100]], [[101]], [[102]], [[103, 104]]],
        "id": "23",
        "properties": {
          "name": "Maine"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[105]], [[106]], [[107, 108, 109, 110, 111, 112, 113, 114]]],
        "id": "25",
        "properties": {
          "name": "Massachusetts"
        }
      }, {
        "type": "Polygon",
        "arcs": [[115, 116, 117, 118, 119]],
        "id": "27",
        "properties": {
          "name": "Minnesota"
        }
      }, {
        "type": "Polygon",
        "arcs": [[120, 121, 122, 123, 124, 125, 126, 127]],
        "id": "34",
        "properties": {
          "name": "New Jersey"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[128]], [[129]], [[130, 131, 132, -86, 133]]],
        "id": "37",
        "properties": {
          "name": "North Carolina"
        }
      }, {
        "type": "Polygon",
        "arcs": [[134, -120, 135, 136]],
        "id": "38",
        "properties": {
          "name": "North Dakota"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-71, -96, 137, 138, 139, 140]],
        "id": "40",
        "properties": {
          "name": "Oklahoma"
        }
      }, {
        "type": "Polygon",
        "arcs": [[141, 142, -123, 143, 144, 145, 146]],
        "id": "42",
        "properties": {
          "name": "Pennsylvania"
        }
      }, {
        "type": "Polygon",
        "arcs": [[147, -136, -119, 148, 149, 150]],
        "id": "46",
        "properties": {
          "name": "South Dakota"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-140, 151, 152, 153, 154]],
        "id": "48",
        "properties": {
          "name": "Texas"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-151, 155, -68, 156, 157, 158]],
        "id": "56",
        "properties": {
          "name": "Wyoming"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-114, 159, 160, 161]],
        "id": "09",
        "properties": {
          "name": "Connecticut"
        }
      }, {
        "type": "Polygon",
        "arcs": [[162, 163, 164, 165, 166, 167, 168, -138, -95, 169]],
        "id": "29",
        "properties": {
          "name": "Missouri"
        }
      }, {
        "type": "Polygon",
        "arcs": [[170, -146, 171, 172, 173]],
        "id": "54",
        "properties": {
          "name": "West Virginia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[174, 175, 176, -93, 177, -164]],
        "id": "17",
        "properties": {
          "name": "Illinois"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-72, -141, -155, 178, -66]],
        "id": "35",
        "properties": {
          "name": "New Mexico"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-169, 179, 180, 181, -152, -139]],
        "id": "05",
        "properties": {
          "name": "Arkansas"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[182]], [[183]], [[184]], [[185]], [[186]], [[187]], [[188]], [[189, 190, -63, 191]]],
        "id": "06",
        "properties": {
          "name": "California"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-128, 192]], [[-144, -122, 193, 194]]],
        "id": "10",
        "properties": {
          "name": "Delaware"
        }
      }, {
        "type": "Polygon",
        "arcs": [[195, 196]],
        "id": "11",
        "properties": {
          "name": "District of Columbia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[197]], [[198]], [[199]], [[200]], [[201]], [[202]], [[203]], [[204]]],
        "id": "15",
        "properties": {
          "name": "Hawaii"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-118, 205, -175, -163, 206, -149]],
        "id": "19",
        "properties": {
          "name": "Iowa"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-178, -92, 207, -174, 208, 209, -165]], [[210, -167]]],
        "id": "21",
        "properties": {
          "name": "Kentucky"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[211, 212]], [[213]], [[-145, -195, 214, 215, 216, 217, -196, 218, -172]]],
        "id": "24",
        "properties": {
          "name": "Maryland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[219]], [[220]], [[221]], [[222]], [[223]], [[224]], [[225]], [[226]], [[227, 228, -90]], [[229]], [[230, 231]]],
        "id": "26",
        "properties": {
          "name": "Michigan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[232]], [[233]], [[234]], [[235]], [[-181, 236, -6, 237, 238]]],
        "id": "28",
        "properties": {
          "name": "Mississippi"
        }
      }, {
        "type": "Polygon",
        "arcs": [[239, -137, -148, -159, 240]],
        "id": "30",
        "properties": {
          "name": "Montana"
        }
      }, {
        "type": "Polygon",
        "arcs": [[241, -104, 242, -109, 243]],
        "id": "33",
        "properties": {
          "name": "New Hampshire"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[244]], [[245]], [[246, -126]], [[247]], [[248]], [[249, 250, -115, -162, 251, -124, -143]]],
        "id": "36",
        "properties": {
          "name": "New York"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[252]], [[253]], [[-229, 254, -147, -171, -208, -91]]],
        "id": "39",
        "properties": {
          "name": "Ohio"
        }
      }, {
        "type": "Polygon",
        "arcs": [[255, 256, 257, -190, 258]],
        "id": "41",
        "properties": {
          "name": "Oregon"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-168, -211, -166, -210, 259, -134, -85, -2, -237, -180]],
        "id": "47",
        "properties": {
          "name": "Tennessee"
        }
      }, {
        "type": "Polygon",
        "arcs": [[260, -157, -73, -65, 261]],
        "id": "49",
        "properties": {
          "name": "Utah"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-216, 262]], [[263, -212]], [[-173, -219, -197, -218, 264, -131, -260, -209]]],
        "id": "51",
        "properties": {
          "name": "Virginia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[265]], [[266]], [[267]], [[268]], [[269]], [[270]], [[271]], [[272]], [[273]], [[274]], [[275, -256, 276]]],
        "id": "53",
        "properties": {
          "name": "Washington"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[277]], [[278]], [[279]], [[280]], [[281]], [[282]], [[283]], [[284]], [[285]], [[286]], [[287, -232, 288, -176, -206, -117]]],
        "id": "55",
        "properties": {
          "name": "Wisconsin"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-150, -207, -170, -94, -69, -156]],
        "id": "31",
        "properties": {
          "name": "Nebraska"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-133, 289, -87]],
        "id": "45",
        "properties": {
          "name": "South Carolina"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-276, 290, -241, -158, -261, 291, -257]],
        "id": "16",
        "properties": {
          "name": "Idaho"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-258, -292, -262, -64, -191]],
        "id": "32",
        "properties": {
          "name": "Nevada"
        }
      }, {
        "type": "Polygon",
        "arcs": [[292, -244, -108, -251]],
        "id": "50",
        "properties": {
          "name": "Vermont"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[293]], [[294]], [[295]], [[296]], [[297]], [[298]], [[299]], [[-182, -239, 300, -153]]],
        "id": "22",
        "properties": {
          "name": "Louisiana"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-111, 301]], [[302]], [[303]], [[-160, -113, 304]]],
        "id": "44",
        "properties": {
          "name": "Rhode Island"
        }
      }]
    },
    "nation": {
      "type": "GeometryCollection",
      "geometries": [{
        "type": "MultiPolygon",
        "arcs": [[[0]], [[83, 4, 237, 300, 153, 178, 66, 191, 258, 276, 290, 239, 134, 115, 287, 230, 288, 176, 88, 227, 254, 141, 249, 292, 241, 104, 242, 109, 301, 111, 304, 160, 251, 124, 246, 126, 192, 120, 193, 214, 262, 216, 264, 131, 289, 87]], [[6]], [[7]], [[8]], [[9]], [[10]], [[11]], [[12]], [[13]], [[14]], [[15]], [[16]], [[17]], [[18]], [[19]], [[20]], [[21]], [[22]], [[23]], [[24]], [[25]], [[26]], [[27]], [[28]], [[29]], [[30]], [[31]], [[32]], [[33]], [[34]], [[35]], [[36]], [[37]], [[38]], [[39]], [[40]], [[41]], [[42]], [[43]], [[44]], [[45]], [[46]], [[47]], [[48]], [[49]], [[50]], [[51]], [[52]], [[53]], [[54]], [[55]], [[56]], [[57]], [[58]], [[59]], [[60]], [[61]], [[73]], [[74]], [[75]], [[76]], [[77]], [[78]], [[79]], [[80]], [[81]], [[96]], [[97]], [[98]], [[99]], [[100]], [[101]], [[102]], [[105]], [[106]], [[128]], [[129]], [[182]], [[183]], [[184]], [[185]], [[186]], [[187]], [[188]], [[197]], [[198]], [[199]], [[200]], [[201]], [[202]], [[203]], [[204]], [[212, 263]], [[213]], [[219]], [[220]], [[221]], [[222]], [[223]], [[224]], [[225]], [[226]], [[229]], [[232]], [[233]], [[234]], [[235]], [[244]], [[245]], [[247]], [[248]], [[252]], [[253]], [[265]], [[266]], [[267]], [[268]], [[269]], [[270]], [[271]], [[272]], [[273]], [[274]], [[277]], [[278]], [[279]], [[280]], [[281]], [[282]], [[283]], [[284]], [[285]], [[286]], [[293]], [[294]], [[295]], [[296]], [[297]], [[298]], [[299]], [[302]], [[303]]]
      }]
    }
  },
  "arcs": [[[69506, 80772], [380, -157], [7, -84], [101, 130], [-57, 89], [-74, -43], [-256, 100], [-101, -35]], [[68880, 62501], [-7, -46], [1414, -189], [1042, -124], [1847, -308], [396, -61]], [[73572, 61773], [70, 469], [326, 1939], [906, 5571], [62, 59], [-19, 125], [95, 129], [64, 485], [82, 222], [132, 204], [41, 265], [67, 105], [-46, 398], [134, 66], [87, 117], [-60, 183], [-141, 178], [-78, 187], [35, 181], [6, 285], [-28, 289], [-92, 408], [70, 398], [-3, 146], [146, 260], [52, 384], [-38, 200], [20, 139], [-32, 271], [22, 258], [-42, 80], [37, 340], [156, 271], [91, 397]], [[75694, 76782], [-1690, 351], [-1190, 211], [-1182, 171], [-870, 144], [24, 123], [-67, 390], [174, 280], [45, 157], [254, 224], [34, 165], [-79, 476], [74, 193], [89, 89], [-101, 97], [-35, 248], [-81, 121], [59, 51], [-94, 99]], [[71058, 80372], [-260, 157], [-344, 138], [-239, 26], [45, -129], [86, 72], [239, -124], [16, -113], [-189, -303], [-123, -105], [-67, -290], [44, -199], [-29, -297], [-54, -152], [-142, -85], [-95, 167], [22, 122], [-71, 405], [12, 507], [-45, 224], [-105, 29], [0, -120], [-145, -111], [-105, 62], [-33, -66], [-117, 89]], [[69359, 80276], [-134, -1892], [-235, -3167], [-52, -748], [28, -1877], [54, -5177], [39, -2880], [26, -1662], [-109, -102], [-96, -270]], [[15941, 90739], [47, -223], [44, 31], [-91, 192]], [[15442, 93819], [42, -103], [61, 69], [-2, -172], [161, -206], [65, -149], [-24, -118], [125, -104], [-52, 383], [56, -94], [91, 167], [61, -77], [-34, 266], [-96, -86], [21, 114], [-138, -53], [-22, 160], [-134, 106], [-181, -103]], [[15046, 95861], [118, -96], [59, 144], [-121, 21], [-56, -69]], [[14874, 94754], [65, -192], [169, -201], [102, 16], [39, 195], [12, -197], [-32, -217], [89, -105], [62, 78], [103, -23], [-54, -154], [151, 129], [-76, -123], [164, 31], [-6, 121], [73, -20], [100, -147], [76, 287], [-61, -38], [-7, 239], [131, -34], [-74, 268], [-171, -105], [62, 163], [-90, 160], [-146, 117], [126, 37], [-146, 104], [-35, 115], [-45, -119], [22, -151], [-141, 441], [-92, 126], [-105, 34], [128, -263], [-55, -17], [72, -272], [-209, 417], [-96, -196], [-2, -257], [-109, -143], [6, -104]], [[14854, 96003], [119, -221], [61, 63], [-150, 199], [-30, -41]], [[14435, 96805], [71, -113], [-3, 201], [-68, -88]], [[12752, 97824], [9, -151], [50, 124], [-59, 27]], [[12678, 97489], [67, -76], [-9, 284], [-62, -20], [4, -188]], [[12397, 97795], [79, -153], [-37, -93], [62, -101], [107, 47], [-29, 107], [-182, 193]], [[12157, 97232], [72, -101], [166, 95], [-15, 134], [-78, -137], [-13, 286], [-67, -120], [-52, 93], [-13, -250]], [[12330, 92853], [20, -148], [159, -124], [-98, 298], [-81, -26]], [[11676, 97411], [39, -75], [105, 122], [-77, 52], [-67, -99]], [[11421, 97611], [92, -25], [-51, 170], [-41, -145]], [[12196, 86075], [110, -33], [3, 101], [-113, -68]], [[11193, 98205], [7, -58], [201, 186], [-53, 52], [-155, -180]], [[10074, 98386], [132, -10], [-14, 76], [-118, -66]], [[9884, 98128], [28, -56], [93, 143], [-78, 113], [-43, -200]], [[9682, 98209], [113, -63], [74, 186], [-177, 16], [-10, -139]], [[10033, 90043], [198, 78], [97, -139], [133, 6], [96, -81], [10, 159], [78, -4], [46, 160], [9, 450], [-177, 9], [-80, 127], [-69, -160], [-79, -22], [-242, -381], [-20, -202]], [[8760, 99025], [201, -102], [44, 40], [207, -329], [81, 99], [18, -87], [-104, -66], [-43, -110], [68, -138], [186, -32], [-15, 119], [68, 60], [68, -133], [63, 124], [-181, 237], [211, -121], [-7, 104], [-91, 97], [-133, 39], [-116, 210], [-179, -40], [-91, 90], [-160, 62], [-95, -123]], [[10675, 82812], [212, -149], [259, -225], [359, -268], [208, -116], [258, -84], [179, 32], [3, 186], [-78, 336], [32, 183], [188, 49], [135, -11], [107, 107], [84, -50], [90, 95], [111, -270], [174, 40], [-34, -143], [-119, -104], [-125, 45], [27, -218], [-102, -299], [-65, -31], [-31, -168], [101, -102], [79, 236], [-30, 174], [135, 305], [80, -38], [-150, -350], [42, -213], [90, -120], [-80, -103], [-217, 52], [-362, -286], [11, -172], [-42, -387], [-325, -737], [-149, -171], [-58, -196], [-145, -222], [101, -35], [57, -159], [54, -421], [247, 104], [311, -10], [225, -224], [99, -195], [58, -394], [60, -252], [230, -468], [124, -140], [155, 74], [134, -81], [172, -212], [165, -284], [130, -88], [129, 133], [238, -92], [95, -123], [169, -392], [73, -5], [239, 172], [18, 100], [-124, 170], [9, 164], [76, 21], [36, -151], [89, -111], [39, -154], [107, 159], [10, 262], [103, 77], [76, -154], [171, -50], [267, 120], [-63, 180], [15, 104], [188, 61], [-39, 166], [196, 58], [50, -112], [143, -13], [16, 65], [234, -168], [186, 129], [46, -33], [77, 145], [36, -63], [150, 172], [144, 34], [71, -53], [278, -28], [134, 149], [130, 66], [89, -35], [179, -246], [166, -87], [551, 444], [124, 25], [1418, 12234], [190, 47], [10, -122], [203, 99], [84, -245], [227, -110], [4, 366], [81, 102], [140, 60], [56, 170], [488, 525], [126, 408], [191, -431], [94, -51], [20, -175], [-40, -232], [66, -31], [-47, -166], [141, -156], [148, -261], [221, 220], [16, 190], [72, 162], [106, -8], [172, 209], [90, 202], [189, 83], [249, 287], [-21, 71], [168, 240], [75, 170], [120, 154], [207, 362], [194, 296], [-17, 181], [140, -19], [14, 241], [121, 28], [67, 249], [100, -76], [255, 139], [134, -28], [163, 80], [44, 114], [138, -54], [87, 232], [-10, 219], [60, 227], [143, 342], [-50, 542], [-96, 348], [-67, -105], [-46, 75], [-181, -461], [66, -185], [-64, -302], [-87, -260], [-74, -60], [126, 281], [34, 394], [-31, 143], [-124, 16], [-143, -77], [-105, -175], [23, -170], [-52, -334], [-1, 316], [-43, 99], [27, 150], [-112, -62], [-45, -134], [24, -199], [-48, -275], [15, -216], [-61, 230], [44, 113], [-91, 164], [-86, -215], [-101, -7], [-30, -132], [44, -187], [80, -60], [-58, -170], [83, -8], [-191, -138], [-25, -161], [-107, -53], [-138, -197], [-246, -69], [-17, -242], [-74, -272], [-79, -23], [-12, -118], [219, 58], [-197, -160], [-63, 12], [-197, -273], [-56, -280], [-14, 125], [-202, 37], [-118, -282], [-218, -386], [-127, -421], [-122, -123], [-27, 93], [136, 181], [38, 204], [156, 360], [128, 533], [-132, -48], [-62, -149], [-84, 1], [-99, 114], [-52, -307], [-111, -222], [-48, 110], [-114, -66], [-46, -158], [-33, 119], [-95, -53], [-7, 89], [133, 14], [132, 153], [58, 1], [130, 346], [-120, 172], [-65, 3], [-42, 154], [-132, -181], [-66, 30], [-218, -176], [-178, -190], [-18, -114], [-174, -184], [-149, -44], [-131, -111], [-217, -96], [-195, -143], [33, -152], [61, 18], [-66, -341], [9, -235], [-56, 319], [-180, 249], [-233, 14], [-225, -109], [45, -181], [-124, 91], [-378, -50], [-106, 16], [-520, 275], [-130, 306], [42, -206], [75, -155], [63, -18], [-114, -134], [-235, -23], [60, -74], [-91, -38], [36, -191], [-147, 213], [-200, -177], [-79, 43], [77, -189], [-140, 182], [18, 139], [-225, 153], [14, -275], [61, 16], [238, -222], [-52, -153], [-98, 142], [43, -170], [-167, 120], [-82, -68], [187, -179], [-137, 77], [-85, -183], [36, -225], [-119, 271], [-49, -239], [-30, 256], [-69, 86], [-49, -100], [-80, 202], [-155, 53], [54, -382], [-81, 19], [-55, 417], [100, 20], [-67, 366], [85, -174], [66, 194], [-57, 288], [133, 221], [-78, 173], [-83, 21], [-49, -271], [-26, 268], [-72, 47], [-193, -61], [-106, 186], [31, -165], [-51, -198], [-4, 275], [-110, -27], [14, 416], [-118, -191], [43, 157], [-154, 355], [-34, 20], [-54, -246], [-11, 222], [-55, 6], [-96, 278], [-121, 28], [-42, -91], [-70, 163], [-63, 8], [-94, -123], [32, -226], [144, -94], [201, -416], [-51, 12], [-148, 203], [-148, -173], [58, -357], [110, -270], [43, -434], [-59, -226], [143, -114], [236, -345], [75, 178], [75, 43], [82, -148], [254, 89], [-245, -157], [-133, -173], [129, -322], [98, -94], [-71, -54], [-93, 156], [-33, 201], [-181, 9], [-69, -64], [-137, 170], [-49, 181], [-117, 56], [-117, 218], [40, 161], [-55, 1], [-171, 314], [31, 150], [-189, 301], [66, 136], [-91, 263], [-158, 25], [83, 47], [-18, 182], [-278, 203], [13, 145], [-154, 94], [-17, 467], [38, -73], [125, 26], [142, 115], [46, 137], [-46, 163], [-111, 177], [-89, 7], [-65, 157], [24, 152], [-87, 322], [-105, 104], [-104, 2], [-167, 132], [7, 119], [-95, 44], [7, 143], [-126, -77], [-56, 304], [-130, -26], [7, 168], [-79, -51], [-148, 237], [92, -55], [-4, 206], [-99, 261], [-140, 18], [-143, 251], [-72, -133], [-137, 326], [-23, -91], [-80, 128], [12, 136], [-101, -74], [-95, 40], [-76, 182], [155, 167], [-162, 174], [-21, 142], [-59, -166], [-5, 187], [-85, -70], [-28, 88], [-262, 72], [-27, 251], [-96, 114], [72, -316], [-108, -54], [-96, 146], [-155, 135], [-73, 160], [-141, -94], [-175, 196], [-122, -30], [86, -328], [-111, -5], [-67, 296], [-97, 212], [-62, -41], [27, 166], [-91, -84], [-45, 172], [-96, -64], [2, -270], [-45, -80], [-49, 103], [52, 124], [-12, 221], [-127, 31], [-84, -269], [-73, 76], [74, 152], [-166, 152], [82, 55], [43, 164], [-116, -146], [-125, 154], [-223, -68], [-121, 89], [-18, 84], [-138, 62], [-89, -60], [-27, -222], [119, -83], [89, -232], [319, -170], [161, 27], [77, 247], [29, -326], [197, -30], [156, -328], [167, -282], [214, -226], [286, -107], [156, 5], [-66, 263], [52, 123], [18, -196], [128, 51], [88, 147], [29, -84], [-149, -228], [110, -343], [266, -358], [125, -86], [260, -267], [118, 87], [8, -256], [135, -318], [136, -147], [168, -260], [74, -747], [79, -59], [-57, -145], [48, -302], [170, -263], [22, -219], [-42, 8], [-424, 300], [-153, -250], [32, -281], [-120, 168], [-47, 221], [52, 293], [-84, 115], [-66, -54], [-111, -471], [-127, -245], [-81, 191], [-51, -152], [-103, -107], [11, -156], [-186, 185], [-249, 181], [-20, 100], [-164, 122], [-65, -154], [79, -145], [12, -260], [-80, -424], [52, -138], [108, -127], [-113, -637], [-84, -319], [-48, 23], [-19, 190], [-80, -6], [-160, 138], [-230, 33], [-171, -99], [-7, -258], [-68, -89], [-93, -324], [-95, -85], [-51, -143], [78, -106], [-157, -17], [179, -244], [5, -205], [-59, -151], [79, -31], [-86, -254], [-43, 121], [-68, -32], [0, -240], [-86, -117], [-3, -116], [72, -86], [-50, -94], [-93, 29], [21, -165], [125, -7], [-79, -221], [165, 10], [-22, -218], [51, -173], [369, -634], [-1, -135], [124, -392], [88, -131], [104, -36], [136, 97], [126, 269], [99, -9], [149, -193], [162, -313], [81, 71], [153, 31], [160, -46], [150, -336], [-38, -433], [4, -196], [-83, -234], [-79, -48], [48, -139], [123, 64], [80, -131], [14, -141], [-118, -296], [-74, 185], [-95, -39], [-176, 110], [-138, 172], [-105, 254], [-4, -237], [-91, -210], [-51, 57], [83, 169], [-76, -7], [-105, -152], [-275, -47], [-212, 91], [-384, -319], [-59, -223], [43, -158], [-74, -195], [-40, -223], [76, 60], [118, -183], [-56, -103], [-284, -198], [-165, -283], [-4, -109]], [[8131, 99405], [170, -218], [19, -146], [90, -89], [116, 59], [-30, -111], [66, -167], [169, -61], [90, 94], [-45, 168], [-220, 115], [-117, 211], [-337, 186], [29, -41]], [[8483, 94388], [117, 58], [-45, 83], [-72, -141]], [[7690, 99248], [115, -18], [13, 144], [-120, -45], [-8, -81]], [[8324, 93559], [119, -32], [-70, 110], [-49, -78]], [[7260, 99402], [111, -86], [-4, 130], [-97, 42], [-10, -86]], [[9073, 85044], [82, -289], [23, 154], [214, 247], [170, -101], [111, 166], [-7, 167], [156, 236], [273, 203], [-86, 173], [-177, -76], [-129, 242], [-40, -211], [-144, -347], [-144, -241], [-78, -48], [-147, 95], [-80, -120], [3, -250]], [[6374, 99403], [99, -80], [51, 59], [-60, 96], [-90, -75]], [[7988, 88764], [78, -103], [-11, 129], [204, 374], [-177, -152], [-94, -248]], [[5678, 99277], [107, 94], [93, -16], [110, 136], [185, 96], [-217, -19], [-244, -168], [-34, -123]], [[5065, 99087], [161, 47], [356, -23], [-4, -141], [103, -89], [69, 166], [-126, 114], [38, 114], [-177, 44], [-154, -54], [-266, -178]], [[4678, 98790], [94, 108], [-57, 122], [-56, -57], [19, -173]], [[4597, 99098], [134, -43], [-3, 92], [-110, 44], [-21, -93]], [[4199, 99135], [142, -179], [46, -182], [107, 30], [-49, 180], [139, 41], [-33, 164], [-83, -57], [-186, 76], [-83, -73]], [[3893, 98832], [254, 11], [35, -137], [64, 76], [-80, 190], [-77, 21], [-45, -103], [-151, -58]], [[3705, 98464], [133, 37], [37, 197], [-113, 200], [-52, -176], [69, 19], [-74, -277]], [[2703, 97629], [93, 9], [33, 99], [-101, 71], [-25, -179]], [[2214, 97770], [118, 120], [86, 361], [-87, -256], [-117, -225]], [[1666, 96970], [161, -15], [70, -133], [31, 91], [-238, 180], [-24, -123]], [[183, 94948], [150, -16], [-12, 216], [-138, -200]], [[3, 93989], [97, -21], [195, 194], [72, 315], [-72, -107], [-48, 47], [-122, -62], [-49, -294], [-73, -72]], [[25124, 95090], [81, -118], [51, 81], [-51, 118], [-81, -81]], [[25034, 95023], [14, -161], [-46, -173], [92, 49], [55, 249], [-115, 36]], [[24855, 94663], [14, -76], [95, 94], [3, 250], [-112, -268]], [[24158, 93842], [17, -68], [85, 176], [-102, -108]], [[24110, 93691], [33, -161], [142, 12], [12, 158], [-80, 94], [-107, -103]], [[24024, 95001], [0, -142], [132, -88], [66, 85], [-25, 152], [-95, 166], [-7, -170], [-71, -3]], [[23894, 94360], [61, -318], [-63, -29], [7, -201], [181, -50], [182, 317], [134, 63], [103, 138], [166, 313], [-134, -41], [-16, 137], [77, -81], [139, 130], [20, 194], [78, -104], [28, 94], [-17, 286], [53, -91], [72, 293], [-8, 132], [-123, 47], [-102, -29], [52, -130], [-141, -80], [-37, -261], [-58, 78], [28, 178], [-83, -21], [-48, -206], [-88, -9], [184, 397], [57, -93], [90, 178], [-71, -22], [68, 159], [-88, 20], [-187, -257], [-92, -329], [-95, 67], [-24, -129], [137, -203], [-117, -158], [-235, -176], [49, -97], [-18, -246], [-64, 209], [-57, -69]], [[23676, 94551], [100, -32], [-46, 118], [-54, -86]], [[23442, 93359], [39, -143], [94, -32], [70, 128], [-28, -204], [-68, -59], [50, -123], [246, 1], [93, -56], [130, 212], [202, 195], [-91, 178], [-141, 25], [-6, 124], [-99, -11], [-90, 114], [-45, -119], [6, 641], [-54, 147], [-77, -120], [-68, -291], [-1, -247], [-56, -4], [-106, -356]], [[22874, 91471], [120, 122], [34, 132], [50, -65], [159, -33], [16, 107], [173, 287], [60, 227], [-112, -215], [-88, -62], [55, 162], [118, 142], [86, 314], [-178, 553], [-43, 18], [-62, -238], [37, -251], [-86, -125], [-96, -243], [-14, -143], [-169, -454], [-60, -235]], [[22808, 92958], [68, -314], [174, 116], [89, -32], [39, 206], [202, 624], [104, 595], [8, 134], [-73, -59], [-251, -492], [-203, -158], [60, -14], [-4, -233], [-73, -67], [18, -224], [-72, 57], [-86, -139]], [[22770, 93146], [15, -154], [118, 129], [4, 281], [-86, 61], [14, -185], [-65, -132]], [[22337, 92395], [-24, -198], [61, -128], [-39, -153], [85, 100], [98, -88], [58, -146], [164, 133], [210, 16], [45, 154], [-74, 88], [86, 54], [122, 380], [-103, 94], [-235, -169], [43, 242], [-34, 181], [-81, -17], [-131, -193], [-45, 15], [-102, -276], [-104, -89]], [[17580, 91326], [38, -191], [142, -287], [94, -372], [66, 151], [-184, 481], [47, 59], [-203, 159]], [[17539, 90713], [44, -321], [78, -154], [-4, 287], [-41, 296], [-77, -108]], [[19970, 66387], [65, -52], [134, 60], [171, -33], [6, -131], [139, -165], [38, -233], [-51, -496], [-150, -33], [-122, -91], [-42, -247], [80, -216], [53, -417], [-85, -155], [84, -202], [-29, -178], [185, -31], [25, -104], [149, -244], [71, -56], [45, -484], [69, -46], [6, -591], [57, -59], [-30, -272], [220, -292], [71, -289], [185, -59], [135, -93], [206, -263], [58, -158], [-50, -197], [-81, -92], [-160, -384], [-89, -60], [42, -268], [-61, -264], [18, -68], [-40, -416], [-121, -252], [-31, -281], [-69, -170], [59, -487]], [[21130, 57818], [83, -258], [-59, -105], [129, -83], [31, -125], [24, -629], [-18, -338], [-54, -333], [96, -444], [-46, -175], [-1, -237], [36, -162], [-7, -200], [47, -176], [63, -57], [-82, -300], [39, -317], [-19, -239], [42, -54], [221, -26], [87, -54], [106, 38], [3, 84], [238, 28], [87, 297], [-21, 59], [113, 209], [153, 14], [218, -544], [43, -39], [86, -746], [104, -1007], [147, -1305]], [[23019, 50594], [855, 279], [1774, 548], [1962, 566], [1594, 421], [51, 38], [1476, 375], [1017, 243]], [[31748, 53064], [-508, 6249], [-181, 2264], [-472, 5802], [-144, 1799], [-450, 5498]], [[29993, 74676], [-1790, -441], [-864, -222], [-1155, -307], [-3138, -3103], [-450, -441], [-2897, -2988], [58, -202], [4, -258], [96, -94], [113, -233]], [[32975, 37767], [867, 205], [1496, 317], [1947, 389], [392, 90], [819, 151], [1448, 238], [300, 36], [1037, 155]], [[41281, 39348], [927, 129], [1118, 143], [1295, 149], [-144, 3845]], [[44477, 43614], [-168, 4810], [-101, 2730], [-57, 1687], [-89, 2368]], [[44062, 55209], [-1157, -141], [-535, -85]], [[42370, 54983], [-2357, -301], [-1165, -181], [-211, -43], [-1901, -326], [-1175, -218], [-11, -32], [-1061, -214], [-1347, -285], [-1394, -319]], [[31748, 53064], [115, -1438], [55, -594], [196, -2424], [2, -431], [139, -1699], [139, -1549], [425, -5250], [42, -454], [114, -1458]], [[85919, 97958], [89, -224], [40, 97], [-83, 167], [-46, -40]], [[85736, 98213], [57, -143], [52, 81], [-109, 62]], [[85214, 98724], [354, -394], [52, 85], [-304, 347], [-102, -38]], [[83862, 99608], [105, -374], [302, -372], [157, -255], [104, -106], [301, 142], [41, 160], [112, 109], [-305, 274], [-30, -81], [-193, 68], [-12, 84], [-321, 322], [-255, 116], [-6, -87]], [[83457, 99810], [252, -176], [-36, 182], [-212, 75], [-4, -81]], [[83145, 99811], [34, -123], [81, -1], [-13, 152], [-102, -28]], [[82261, 91868], [41, 48], [195, 645], [193, 133], [47, -69], [103, 43], [-160, 144], [-215, -201], [-193, -580], [-11, -163]], [[81555, 99934], [106, -66], [40, 63], [-143, 68], [-3, -65]], [[76646, 81241], [191, -195], [-26, 165], [-145, 109], [-20, -79]], [[75694, 76782], [53, 244], [101, 173], [20, 257], [64, 242], [99, 133], [2615, -305], [707, -77], [1759, -212], [-32, 100], [85, 210], [3, 234], [97, 230], [232, -75], [21, -453], [-6, -326], [-114, -328], [5, -510], [98, 7], [29, -197], [105, -2], [60, 95], [119, -19], [179, 128], [129, -25], [221, 56], [93, -74], [91, 39]], [[82527, 76327], [36, 36], [4, 375], [44, 293], [58, 141], [119, 776], [251, 1112], [123, 398], [40, 274], [258, 818], [312, 873], [211, 562], [634, 1338], [323, 573], [142, 446], [-104, 217], [-4, 385], [84, 492], [75, 297], [158, 439], [328, 796], [265, 849], [122, 430], [251, 649], [14, 109], [183, 505], [206, 797], [70, 853], [3, 479], [28, 685], [6, 680], [71, 925], [-7, 675], [-39, -205], [-75, -65], [-84, 129], [-36, 318], [-41, 102], [16, 171], [-41, 146], [7, 255], [48, 245], [43, 40], [-41, 187], [-70, 102], [28, 114], [140, -170], [156, -818], [-17, 414], [-179, 782], [-37, 280], [-360, 866], [-154, 258], [-26, -33], [298, -616], [41, -183], [17, -377], [-207, -8], [-239, 140], [-155, 196], [-143, -108], [-124, 79], [-39, 143], [-355, 176], [-139, -134], [-83, -202], [10, -425], [52, -37], [-138, -441], [-94, -133], [0, -111], [-97, -223], [-68, -40], [-63, -264], [-122, 24], [-96, -307], [-179, -55], [-342, -270], [-118, 201], [-157, -372], [-146, -452], [-131, -756], [-99, -298], [-101, -160], [-224, -187], [-16, -142], [-106, 19], [34, 134], [-94, 61], [-113, -560], [-102, -144], [106, -95], [76, 111], [31, -533], [-32, -276], [-67, -30], [6, -268], [-80, 35], [-103, 170], [97, 463], [-196, 152], [-21, 169], [-25, -241], [-52, -152], [-150, -272], [-235, -527], [-87, -288], [-232, -547], [-286, -491], [-131, -333], [90, 137], [96, -120], [107, -306], [162, -617], [80, -89], [58, -296], [-60, -231], [-155, -32], [65, 358], [-169, -59], [39, -121], [-76, -326], [-286, -163], [28, 207], [-70, 108], [115, 108], [86, -11], [110, 334], [-59, 156], [0, 266], [-154, 83], [40, 272], [-52, 60], [-38, -351], [-129, -295], [-85, -98], [-64, -231], [4, -515], [-56, -204], [-69, -524], [61, -19], [24, 301], [58, 281], [60, 8], [-19, -271], [-62, -90], [70, -263], [99, -853], [-3, -602], [-58, -205], [-3, -184], [-93, -75], [16, -143], [-91, -337], [63, -229], [-175, -321], [13, -106], [-67, -166], [-72, 7], [2, -272], [-47, -34], [-333, 3], [-96, 205], [-93, -308], [-17, -189], [-163, -54], [-28, -203], [-105, -268], [-153, -32], [-44, -136], [-183, -118], [-27, -363], [-46, -212], [-80, -4], [-172, -141], [-111, -213], [-8, -103], [-121, -259], [-104, -122], [-212, -159], [-291, -175], [-196, -205], [-189, 89], [-57, 82], [-222, -49], [5, 113], [-166, 264], [85, 309], [-22, 109], [-166, -2], [-40, -79], [-156, 105], [-236, 362], [-43, 8], [-358, 482], [17, -196], [-76, -25], [-133, 289], [-248, 46], [102, 141], [17, 124], [116, 48], [391, -385], [168, -312], [20, 39], [-143, 302], [-490, 503], [-364, -278], [-135, 2], [-113, 116], [-107, -290], [-61, -329], [47, -200], [24, 341], [58, 291], [55, 61], [57, -140], [-9, -275], [-145, -364], [-90, -135], [-164, -57], [-111, -112], [-131, -208], [-193, -120], [-165, -198], [-211, -190], [-247, -167], [-443, -201], [-279, -71], [-519, 6], [-225, 54], [-318, 135], [-444, 236], [-213, 81], [-54, -22], [-419, 231]], [[73572, 61773], [398, -68], [802, -177], [1113, -230]], [[75885, 61298], [1265, -269], [-2, -21], [918, -243]], [[78066, 60765], [-3, 232], [-194, 300], [-36, 220], [-91, 144], [-35, 245], [45, 177], [210, 221], [115, 2], [175, 301], [166, 132], [108, -80], [154, 75], [78, 344], [80, 76], [109, 259], [57, 339], [111, 145], [87, 228], [96, 128], [95, 301], [60, -7], [210, 259], [148, 78], [192, 242], [149, 465], [128, 124], [48, -32], [120, 94], [136, 266], [148, 138], [-32, 309], [79, 135], [119, 37], [8, 216], [97, 124], [72, -31], [27, 212], [122, 136], [172, 38], [92, 135], [165, 136], [3, 270], [85, 143], [-15, 76], [115, 135], [6, 201], [46, 137], [-17, 171], [79, 183], [-38, 88], [114, 174], [166, 36], [191, 304], [-15, 117], [217, 519], [-53, 184], [90, 189], [27, 271], [103, 78], [108, -71], [170, 185], [79, 6]], [[83114, 71024], [83, 17], [-17, 218], [-81, 122], [-74, -32], [-23, 167], [66, 8], [-91, 225], [-142, -37], [-3, 188], [70, 4], [-34, 221], [-101, 206], [-120, -9], [74, 143], [55, -32], [21, 276], [-51, 276], [-152, 40], [-10, 94], [119, -52], [49, 67], [-139, 619], [35, 293], [-7, 324], [-39, 4], [-78, 298], [-58, 25], [1, 455], [-125, 185], [134, 46], [27, -89], [30, 262], [-45, 391], [-1, 266], [40, 114]], [[68755, 36530], [95, 123], [115, -36], [-31, 139], [272, 45], [228, -135], [292, -294], [170, -224]], [[69896, 36148], [1702, -293], [1620, -318], [17, 245]], [[73235, 35782], [263, 3703], [109, 1630], [113, 1885], [177, 2707]], [[73897, 45707], [-117, 230], [114, 214], [16, 126], [-44, 233], [145, 35], [-49, 183], [30, 207], [-129, -14], [-151, 90], [-309, 416], [-138, -143], [-105, -18], [-216, 89], [-30, 162], [107, 534], [-124, 327], [-180, 146], [-52, 446], [-133, 249], [-95, -57], [-63, 57], [-25, 213], [-84, 256], [22, 287], [-14, 226], [-45, 97], [-137, 85], [-10, 127], [-127, -193], [-122, 30], [-177, -186], [-13, -271], [-145, -198], [-34, 127], [81, 24], [-126, 210], [-104, -34], [58, 116], [-23, 145], [-111, 49], [3, 288], [41, 139], [-141, 61], [-13, 246], [-101, 22], [16, -203], [-121, 81], [-61, -67], [-93, -279], [-106, 24], [-71, 171], [-220, 189], [-42, 413], [-96, 81], [-76, -206], [-66, 1], [-329, -305], [-124, -2], [-98, 150], [-155, -246], [-49, 172], [69, 169], [-26, 211], [-103, 33], [-35, -283], [-250, 142], [-139, -167], [-49, 132], [68, 320], [-59, 134], [-150, -72]], [[68662, 51678], [-138, -393], [145, 22], [-95, -83], [81, -233], [-62, -228], [124, -130], [2, -128], [-71, 72], [56, -194], [67, -46], [-111, -249], [86, -356], [34, 111], [41, -142], [51, 102], [67, -349], [44, -37], [71, -304], [-22, -107], [136, -145], [-13, -129], [51, -389], [40, -114], [121, -134], [23, -319], [-109, -297], [47, -375], [-120, -115], [-4, -265], [-112, -174], [-26, -229], [102, -215], [-61, -156], [31, -312], [78, -41], [-96, -1779], [-120, -2504], [-168, -3209], [-77, -1575]], [[44477, 43614], [1074, 114], [1741, 156], [977, 74], [1091, 66], [1033, 52], [1067, 44], [1496, 43], [1519, 20], [1435, -5]], [[55910, 44178], [176, 351], [108, 38], [24, 92], [154, 30], [41, -133], [143, 40], [-22, 108], [113, 141], [-82, 133], [23, 117], [73, -54], [-24, 179], [-122, -71], [-25, 229], [-96, 83], [-61, 342], [-73, 14], [2, 139], [97, 154], [17, 119], [101, 98], [84, 211], [77, -28], [-36, 158], [19, 198], [93, 121], [40, 225], [79, 23], [72, 131], [84, -58], [44, 99], [121, 7], [-25, 138], [8, 1969], [18, 2539], [0, 689], [25, 2987]], [[57180, 55736], [-1580, 26], [-1748, 2], [-1700, -30], [-1265, -39], [-1541, -77], [-1058, -66], [-400, -35], [-1413, -101], [-1205, -95], [-1208, -112]], [[98249, 17157], [80, -70], [-28, 138], [-52, -68]], [[98072, 17379], [-8, -281], [189, 209], [-58, 185], [-123, -113]], [[97911, 16723], [18, -160], [74, 213], [-92, -53]], [[97504, 17360], [72, -41], [41, 118], [-113, -77]], [[97633, 18829], [27, -143], [42, 237], [-69, -94]], [[97421, 17896], [20, -151], [117, -211], [42, 177], [116, 210], [-35, 153], [-96, 90], [-81, -41], [-26, -244], [-57, 17]], [[97299, 17401], [37, -249], [-19, -265], [74, 19], [-9, 490], [-83, 5]], [[95336, 23105], [-232, -159], [-36, -337], [-289, -340], [-94, -273], [-24, -533], [-45, -55], [-155, -812], [-357, -2014], [-279, -1518], [-390, -2000]], [[93435, 15064], [106, -102], [-19, -103], [161, 66], [69, 236], [72, 26], [25, -300], [-22, -239], [-56, -114], [90, -153], [88, 109], [121, -29], [-57, -208], [-129, -118], [-23, -98], [62, -393], [103, -289], [215, -367], [-86, -199], [78, -262], [102, -201], [-3, -209], [-127, -19], [30, -139], [-64, -64], [37, -148], [-54, -24], [60, -356], [-109, -124], [22, -308], [44, -151], [-22, -115], [72, -143], [47, -222], [55, -55], [-79, -1065], [670, -3350], [232, 26], [52, -40], [67, 478], [52, 185], [245, 141], [229, -362], [85, -25], [85, -134], [4, -114], [84, -76], [211, -78], [-38, -198], [51, -92], [287, -11], [45, 94], [334, 223], [169, 285], [151, 59], [307, 1702], [219, 1163], [221, 1226], [62, 68], [-57, 166], [111, 182], [-56, 110], [80, 460], [134, -9], [3, -69], [140, 190], [236, -19], [64, -97], [116, 336], [-121, 120], [87, 211], [87, 84], [27, 197], [-44, 253], [112, 164], [97, 217], [120, 74], [49, -111], [-16, -155], [117, 33], [100, -43], [163, 283], [162, 408], [103, 76], [71, 368], [-202, 774], [-115, 150], [-106, -280], [-129, 172], [96, 148], [-39, 172], [-65, -11], [-41, 220], [-129, 50], [30, 103], [112, 77], [-86, 245], [-98, -108], [-66, -161], [-106, 210], [-70, -167], [-5, 217], [-40, 69], [-4, 256], [-96, 7], [-82, 216], [-46, -67], [-14, 323], [-100, -58], [-28, -136], [-110, 98], [50, 203], [-46, 269], [74, 74], [-182, 149], [-145, -34], [-144, -295], [16, -110], [104, -144], [-56, -122], [-37, 147], [-46, -141], [-180, 271], [57, 128], [-9, 155], [109, 174], [10, 148], [-84, 309], [5, 141], [91, 145], [10, 231], [-79, 75], [-65, -257], [-15, -196], [-117, -94], [-59, -192], [57, -203], [-130, -74], [-39, -101], [-89, 115], [-52, -360], [34, -170], [-68, -183], [-68, 327], [-81, -73], [-98, 173], [121, 218], [10, 161], [-57, 107], [-17, 252], [17, 239], [-32, 42], [33, 302], [92, -20], [-59, 124], [76, 128], [-21, 170], [-153, 63], [-30, 263], [-83, 44], [18, 189], [-55, 59], [-9, -300], [-56, -24], [-65, 179], [-7, -219], [-90, 74], [29, 165], [-67, 161], [-4, 172], [-90, -131], [12, 155], [-63, 141], [-84, -49], [22, 217], [-89, -140], [-38, 342], [-132, 220], [-66, -251], [-92, 26], [-72, 313], [-76, -2], [-48, 213], [-92, 7], [-55, 218], [55, 246], [-32, 123], [-84, -58], [-118, 189], [-17, 141], [70, 194], [-72, 232], [34, 96], [-171, 178], [-39, 367], [44, 88], [-21, 358], [-41, 275], [-42, 61]], [[97059, 29277], [86, 40], [166, -94], [91, -102], [34, -256], [148, 288], [-63, 194], [-169, 63], [-249, -65], [-44, -68]], [[96137, 29538], [104, -48], [63, -339], [126, -264], [72, 19], [57, 186], [119, 62], [34, -154], [43, 270], [-412, 219], [-82, 201], [-124, -152]], [[91476, 26056], [1287, -471]], [[92763, 25585], [762, -279], [1095, -426], [50, -205], [103, -27], [-37, -194], [66, -153], [117, 7], [21, -220], [147, -172], [139, 33], [42, -65]], [[95268, 23884], [166, 635], [165, 84], [48, -167], [96, 71], [-47, 334], [-46, -28], [-202, 266], [-73, 54], [62, 78], [-48, 256], [-73, 69], [-48, 201], [93, 186], [-84, 49], [41, 238], [84, 9], [15, -132], [79, -64], [74, 128], [139, 12], [101, 117], [36, 139], [165, 243], [2, 304], [-68, 51], [107, 137], [193, 33], [86, 243], [0, 171], [144, 150], [167, 12], [137, -47], [63, 51], [89, -194], [240, -257], [21, -94], [-116, -427], [-58, 136], [-51, -309], [-57, -162], [-102, -68], [-59, 119], [-96, -52], [78, -111], [233, 56], [170, 282], [165, 481], [84, 430], [-3, 287], [-32, 216], [-17, -326], [-73, -38], [-266, 234], [-77, 104], [-152, 41], [-140, 190], [-58, 240], [-216, 156], [-197, 459], [-232, 256], [20, -97], [184, -204], [181, -414], [4, -160], [-90, -352], [47, -90], [-171, -68], [29, 189], [-63, -8], [15, 204], [-78, -23], [17, 118], [-162, 97], [-3, 418], [-129, 140], [-129, 49]], [[95592, 29215], [-113, -592], [-111, -14]], [[95368, 28609], [-67, -111]], [[95301, 28498], [-83, -129], [-122, -56], [-86, -431], [-65, 50], [-72, -467], [-660, 339]], [[94213, 27804], [-11, -57], [-1533, 618], [0, 132], [-77, 54], [-16, -148], [-313, 124], [-772, 279]], [[91491, 28806], [-53, -123], [38, -2627]], [[52912, 9721], [1223, 21], [1539, 2], [319, -5], [-7, -1454], [141, 115], [157, -61], [145, 165], [44, 112], [82, 653], [34, 78], [106, 812], [-26, 198], [18, 202], [76, 138], [154, 141], [149, 26], [33, -62], [226, 39], [62, 185], [325, 13], [244, 43], [61, 221], [19, 205], [223, -14], [264, -119], [2, -175], [161, -82], [11, -58], [208, -70], [45, 70], [289, -16], [390, 297], [138, -22], [1, 165], [-92, 22], [-18, 122], [86, 95], [222, -56], [80, 172], [-16, 187], [162, 488], [147, -115], [-61, -255], [63, -150], [84, 30], [226, -67], [86, 137], [-5, 212], [76, 118], [97, -25], [46, 112], [225, 13], [-11, 109], [134, 269], [120, -52], [-5, 245], [116, -102], [91, 67], [86, -86], [180, -71], [162, -261], [233, -287], [134, -112], [70, 17], [14, 191], [90, 93], [-28, 88], [58, 151], [180, -37], [86, -85], [42, 101], [636, -124], [167, 84], [93, 257], [150, 92], [73, -119], [105, -43], [75, 57], [183, 18], [135, -87], [-142, 201], [-161, 113], [-137, 205], [-192, 132], [-72, 128], [-407, 263], [-123, 113], [-157, 72], [-146, 123], [-291, 327], [-193, 275], [-224, 370], [-212, 394], [-25, 102], [-243, 528], [-174, 323], [-143, 148], [-134, 298], [-57, 39], [-150, 284], [-114, 115], [-312, 472], [128, 301]], [[60864, 18223], [-118, -155], [-150, 131], [-15, 240], [-139, -22], [49, 2243], [-52, 35], [-30, 190], [-134, -8], [-53, 188], [-78, -38], [-42, 125], [-137, 80], [-102, 153], [-86, 264], [-24, 242], [-129, 186], [-23, 301], [11, 243], [173, 17], [198, 424], [8, 213], [-71, 242], [-91, 180], [-6, 386], [42, 311], [-71, 113], [46, 193], [29, 348], [-35, 173], [19, 197], [-61, 347], [115, 124], [275, 419], [34, 131], [322, 24], [55, 70], [55, 228], [111, 143], [260, 124], [210, 245], [92, 495], [97, 141], [175, 154], [214, 341], [244, 98], [254, 554], [72, 272], [-32, 252], [10, 362], [62, 117], [-14, 134], [47, 182]], [[62450, 30375], [-839, 69], [-1825, 125], [-1493, 72], [-1805, 50], [-1333, 18], [-1150, -4]], [[54005, 30705], [16, -4613], [4, -2277], [-56, -226], [-201, -197], [-104, -15], [-74, -174], [-44, -222], [-151, -351], [40, -174], [284, -359], [109, -279], [32, -439]], [[53860, 21379], [-15, -392], [31, -176], [-62, -519], [-5, -421], [-104, -173], [-103, -396], [-13, -332], [-81, -380], [31, -236], [-31, -351], [38, -289], [-65, -274], [-1, -718], [-22, -172], [5, -512], [-38, -298], [20, -664], [-191, -825], [-54, -434], [-65, -167], [-16, -333], [-44, -78], [-63, -368], [48, -420], [-44, -305], [25, -378], [-27, -350], [68, -302], [16, -208], [-55, -153], [-56, -475], [-91, -438], [16, -121]], [[89327, 39227], [55, -243]], [[89382, 38984], [46, -332], [56, -164]], [[89484, 38488], [117, -230], [99, -39], [183, -201], [-3, -299], [273, -539], [107, -95], [46, -194], [69, -4], [79, -188], [-108, -175], [-135, -86], [-65, -152], [-139, -115], [-71, -207], [-159, -14], [-43, -138], [-40, -328], [-64, -77], [-155, 34], [-76, -434], [14, -349], [60, -4], [83, -427], [-179, -316], [-5, -77], [147, -249], [67, -205], [-29, -80], [127, -335], [41, -463], [86, -240], [89, -79]], [[89900, 32183], [731, 443], [723, 388], [31, 4], [-1, 426], [-90, 825]], [[91294, 34269], [-22, 127]], [[91272, 34396], [-201, 199], [13, 281], [-43, 239]], [[91041, 35115], [17, 143], [124, 44], [91, -99], [245, 83], [7, -151], [86, 556], [4, 698], [32, 827], [44, 568], [-37, 307], [-158, 926], [-125, 488], [-158, 248], [-120, 321], [-104, 535], [-68, 532], [-94, 241], [-110, 89], [-71, -19], [-2, -240], [50, -462], [-14, -176], [-141, -69], [-109, 28], [-10, -74], [-141, 57], [-28, 132], [-98, -203], [-210, -106], [-117, -189], [-35, 42], [-159, -181], [-56, -123], [-129, -37], [-35, -304], [18, -154], [-86, -78]], [[89344, 39315], [-17, -88]], [[90812, 53263], [126, 18], [105, 211], [24, 151], [-98, 5], [-5, -151], [-152, -234]], [[90718, 56718], [28, -212], [721, -869], [-18, -831], [-39, -437], [-172, -615], [61, 90], [147, 522], [34, 449], [23, 962], [-146, 80], [-260, 282], [-379, 579]], [[80100, 54078], [536, -89], [349, -82], [599, -113], [233, -77], [725, -132], [1372, -389], [1757, -544], [2781, -937], [187, -92], [1636, -588]], [[90275, 51035], [176, 697], [141, 454], [150, 401], [149, 313], [332, 797], [-58, -26], [-222, -529], [-74, -129], [-83, -5], [-133, -540], [-160, -466], [-64, -56], [8, -135], [-71, -277], [-116, -219], [-162, 12], [-8, -122], [-91, 93], [63, 182], [120, 119], [64, -57], [30, 241], [333, 861], [20, 151], [-144, -162], [-9, -123], [-142, -283], [-79, -12], [42, 207], [105, 95], [-206, -12], [-249, -309], [-97, -6], [160, 273], [69, 33], [60, 176], [-197, 174], [-200, -171], [185, 240], [-38, 60], [-460, -182], [170, 188], [144, 24], [-36, 78], [-150, 80], [-60, 233], [-88, 105], [-117, 36], [-75, -94], [-110, 16], [-126, -367], [-20, -196], [46, -282], [-36, -32], [-60, 279], [17, 252], [87, 287], [110, 256], [-23, 116], [59, 95], [251, -124], [210, -234], [82, 137], [303, -310], [201, -72], [101, 104], [16, 138], [-54, 285], [45, 168], [76, 554], [54, -62], [0, -387], [-45, -493], [69, -195], [-43, -45], [161, -140], [137, 109], [157, 433], [-3, 160], [82, 274], [-39, 100], [43, 167], [-58, 205], [-208, 101], [-131, 434], [-21, 271], [-66, 38], [6, 132], [-110, 207], [-173, -22], [-185, 80], [-268, -2], [-115, -114], [-126, -342], [192, -79], [18, -159], [-167, 144], [-81, -9], [-48, 128], [81, 166], [72, 265], [-248, -70], [-84, 62], [-139, -65], [-208, -29], [-165, -106], [7, 94], [130, 163], [134, -31], [443, 191], [301, -13], [85, 209], [-84, 402], [8, 169], [-70, 242], [-311, 517], [-366, -251], [35, 207], [171, 127], [249, 59], [196, -340], [227, -151], [21, -256], [75, 22], [44, 206], [65, 81], [115, -25], [-87, -220], [149, 61], [49, 241], [-93, 301], [-106, 80], [-109, 506], [-13, 244], [-117, -25], [-25, -262], [-76, -39], [40, 263], [-99, 60], [293, 114], [138, -548], [123, -368], [129, -301], [221, -670], [68, 41], [-147, 333], [-349, 927], [-135, 531], [-41, 304], [-50, -207], [-249, -99], [-169, 44], [-450, 298], [-293, 321], [-173, 332], [-223, 328], [-183, 340], [-229, 579], [-113, 469], [-105, 1016], [1, 231], [-87, 8], [-34, -105], [-299, -5], [-368, 167], [-263, 284]], [[86724, 62866], [-1511, -1858], [-243, -316], [-670, -814], [-351, 101], [-1669, 418], [-14, -449], [-335, -578], [-169, 291], [-41, -400], [-1214, 209], [-672, 126], [-335, 47], [-184, 97], [-33, -103], [-61, 201], [-94, 4], [-405, 404], [-81, 136], [-18, -79], [-558, 462]], [[75885, 61298], [-8, -920], [129, -185], [29, 81], [182, -53], [119, -214], [-41, -202], [48, -95], [-34, -119], [42, -140], [134, -177], [40, -169], [100, -48], [85, -168], [510, -137], [58, -183], [133, -135], [49, -115], [69, 14], [80, -287], [97, -35], [37, -145], [136, -127], [159, 23], [44, -73], [87, -342], [-18, -278], [80, -35], [63, 91], [52, -130], [5, -188], [235, -312], [77, 122], [-8, 244], [98, 29], [155, -248], [74, -330], [188, -234], [76, 0], [37, -110], [133, -5], [45, 157], [168, -97], [161, -749], [180, -264], [153, 53], [-70, -281], [56, -238], [-41, -216], [32, -250]], [[42801, 8880], [996, 142], [1716, 212], [1618, 163], [1025, 87], [1347, 97], [975, 53], [1364, 57], [1070, 30]], [[53860, 21379], [-1176, -19], [-1704, -63], [-1678, -104], [-1053, -81], [-1941, -172], [-861, -91], [-1135, -132], [-1325, -171], [-754, -107]], [[42233, 20439], [81, -1667], [182, -3639], [103, -1962], [21, -506], [181, -3785]], [[57180, 55736], [16, 1928]], [[57196, 57664], [63, 768], [311, 3486], [-16, 2185], [-20, 4584]], [[57534, 68687], [-64, 84], [-123, -237], [-110, 40], [-25, -87], [-94, 17], [-122, -255], [-136, 63], [-131, -178], [-93, -285], [-147, -10], [-153, -278], [-183, -89], [-96, 321], [-229, 47], [-254, -51], [-29, -198], [-281, 181], [-79, -29], [6, 140], [-87, -18], [-79, 86], [-169, -185], [-11, 98], [-88, -20], [-56, 101], [-149, -29], [-139, 128], [11, 172], [-94, 87], [-105, -87], [-60, 228], [-61, 90], [-147, -344], [-143, 13], [-48, -187], [-85, 6], [-105, -123], [83, -146], [-166, -80], [-29, 228], [-131, 97], [-59, -173], [-104, 82], [-60, -81], [-39, -305], [-164, -11], [15, 242], [-191, 296], [-19, 311], [-138, -40], [-60, -248], [73, -148], [-22, -200], [-57, -93], [-86, 201], [-147, -40], [-69, 204], [-98, -2], [-67, -88], [7, -239], [-74, -63], [-94, 81], [-82, -63], [14, -153], [-80, -109], [-100, -24], [-54, 149], [-220, 339], [-59, 30], [-215, -191], [74, -349], [-47, -67], [-103, 43], [-111, -51], [-53, -307], [56, -174], [-60, -96], [-86, 152], [-239, -88], [-116, -91], [-103, 281], [-127, 73], [-162, -340], [-129, -66], [-79, 117], [-123, 26], [-90, -125], [-186, -92], [-130, -162], [-115, 69], [-172, -91], [-94, 14], [-30, -472], [-302, -483], [-36, 302], [-80, 10], [-137, -164], [-114, -16], [-40, 159], [-176, -36], [-102, -162], [-243, -529], [-92, -103], [-101, 65], [184, -7472], [-971, -73], [-958, -83], [-957, -93], [-1113, -123], [-1335, -159]], [[42286, 56906], [84, -1923]], [[80162, 33015], [286, -310], [257, -381], [40, -212], [100, 55], [187, -296], [250, -320]], [[81282, 31551], [105, 1028], [1440, -432], [450, -151], [1240, -396], [1144, -390], [328, -123], [934, -316], [970, -352], [616, -236], [159, 178], [72, 276], [129, -91], [173, 175], [-12, 152], [93, 50], [76, 510], [-38, 55], [98, 129], [115, 286], [114, -27], [44, 124], [135, -64], [46, 66], [80, -66], [14, 110], [93, 137]], [[89484, 38488], [-155, -66], [-121, 23], [-145, 124], [-90, 179], [-72, 272]], [[88901, 39020], [-741, 273], [-1263, 453], [-798, 273], [-1789, 577], [-1573, 492]], [[82737, 41088], [-631, 189], [-1120, 318], [-334, -3491]], [[80652, 38104], [-490, -5089]], [[42034, 24047], [29, -8], [63, -1279], [107, -2321]], [[54005, 30705], [-235, -3], [7, 255], [117, 188], [-8, 290], [-88, 45], [31, 284], [122, 1], [29, 285], [48, 113], [-43, 222], [-77, 50], [15, 348], [-67, 133], [-6, 282], [-146, 317], [3, 240], [151, 196], [98, 383], [-23, 137], [74, 115]], [[54007, 34586], [-91, 30], [-49, -126], [-118, 40], [-56, -183], [-119, -217], [39, -146], [-65, -81], [-121, -22], [-6, -123], [-164, -116], [-93, 49], [-29, -154], [-243, -49], [-128, -146], [-13, -141], [-142, -87], [-180, 2], [-37, 72], [-267, -51], [-106, 56], [-173, -31], [-87, -76], [-77, 36], [-23, 159], [-103, 179], [-138, 16], [-151, -225], [-207, -213], [-336, -295], [-48, -198], [-851, -41], [-1377, -85], [-1237, -95], [-1756, -158], [-221, -33], [-1034, -116], [-1487, -191], [-1051, -146]], [[41662, 31680], [103, -2136], [112, -2227], [157, -3270]], [[57534, 68687], [49, -29], [4, 180], [149, 87], [36, 120], [111, -131], [134, 86], [78, -154], [111, 151], [38, -72], [111, 66], [26, 2051]], [[58381, 71042], [47, 3919], [46, 31], [81, 245], [130, 123], [69, 272], [101, 180], [-14, 108], [53, 228], [-62, 335], [42, 169], [179, 187], [-43, 138], [94, 115], [75, 295], [-44, 194], [131, 144], [43, 362], [98, -45], [10, 398], [60, 224], [-96, 90], [83, 234], [-76, 199], [30, 242], [-120, 323], [-1, 180], [-116, 213], [8, 157], [-90, 102], [-22, 133], [51, 79], [36, 297], [-114, 210], [-12, 206], [102, 145], [-8, 324], [66, 260], [-82, 204], [57, 130], [-157, 250], [-124, 486], [-130, 181], [170, 484]], [[58932, 83793], [1, 44], [-317, 3], [-256, 140], [-959, 776], [-122, 140], [-70, 179], [-93, 32], [23, -123], [181, -323], [151, -62], [53, -154], [139, 23], [-101, -177], [-376, 186], [-79, -18], [138, -363], [28, -266], [-8, -241], [-118, -88], [-114, 97], [-108, 329], [-94, 52], [-88, -160], [-90, 274], [60, 105], [-68, 180], [72, 165], [141, 52], [-40, 178], [78, 63], [-3, 479], [-114, 71], [-283, 451], [-116, -58], [-12, 289], [40, 86], [274, -362], [240, -392], [106, -79], [26, -182], [156, 79], [-140, 204], [-431, 510], [-192, 311], [-221, 304], [-279, 470], [-112, 29], [-730, 746], [-521, 413], [-230, 207], [-215, 230], [-172, 227], [-104, 244], [-375, 358], [-318, 424], [-188, 301], [-234, 462], [-84, 280], [-194, 444], [-146, 455], [-171, 640], [-131, 728], [-46, 663], [18, 664], [35, 341], [99, 678], [82, 437], [109, 751], [71, 847], [-48, -155], [-34, -479], [-158, -1115], [-168, -56], [125, -85], [-160, -842], [-21, -347], [10, -849], [84, -898], [119, -588], [141, -481], [98, -225], [73, -282], [61, -113], [-17, -156], [96, -278], [130, -122], [276, -692], [120, -54], [58, -173], [110, -5], [270, -388], [313, -186], [-24, -289], [-254, 247], [-78, 129], [-125, 17], [-50, -353], [-130, 2], [-68, 439], [44, 133], [-27, 120], [-268, 378], [-182, -97], [-18, -142], [-232, 195], [-121, 172], [151, 119], [222, -206], [-2, 268], [-46, 74], [-279, 749], [-76, -8], [-49, -193], [-148, 28], [-31, -60], [-225, 31], [-76, -41], [-45, 124], [84, 105], [186, -48], [-31, 209], [49, 158], [226, 177], [-139, 474], [-92, 457], [-9, 145], [-89, 344], [-192, 171], [-76, -62], [98, -65], [24, -191], [-55, -11], [-192, 284], [-41, 160], [171, 57], [187, -122], [55, 20], [-52, 1027], [-51, 673], [-25, 10], [60, 751], [56, 213], [5, 275], [66, 4], [196, 800], [-63, 151], [37, 478], [39, 70], [144, 39], [7, 115], [89, -57], [9, 404], [-265, 7], [-1, 64], [-198, 101], [1, 255], [-147, -41], [-7, -83], [-147, -59], [-48, -182], [-73, -16], [-132, -321], [-222, -47], [-85, -109], [-172, -29], [-165, 49], [-123, -60], [-23, 95], [-74, -104], [-143, 65], [-206, -98], [-171, -252], [-2, -109], [-101, 28], [-155, -251], [-64, 33], [-177, -166], [-171, 61], [-168, -345], [-69, -28], [-68, -152], [-135, 43], [-151, -162], [-144, -64], [-87, 58], [-56, -116], [42, -190], [-69, -187], [-86, -62], [-8, -306], [-43, -138], [-12, -260], [-61, -84], [-50, -373], [-118, -146], [17, -102], [-113, -111], [7, -150], [-73, -169], [-62, -26], [40, -256], [-17, -229], [30, -94], [-25, -282], [-108, -89], [7, -121], [-86, -53], [68, -80], [61, -558], [-95, -56], [40, -247], [-83, -195], [-94, -111], [-72, 53], [-57, -130], [-71, 14], [-125, -302], [-206, -271], [-41, -249], [7, -183], [-71, -113], [15, -153], [-117, -60], [-46, -271], [-68, -81], [-54, -230], [-241, -195], [-161, -371], [14, -123], [-111, -336], [27, -151], [-56, -136], [61, -89], [-98, -61], [-40, -141], [29, -123], [-94, -101], [4, -125], [-103, -84], [-6, -301], [-47, -91], [-21, -240], [-46, -6], [-53, -293], [-58, -9], [-19, -321], [-62, -480], [-171, -254], [20, -82], [-54, -202], [-149, -138], [-18, -110], [-234, -254], [-86, -352], [-176, -86], [-38, -147], [-167, -101], [37, -121], [-41, -237], [-53, 218], [-38, -95], [3, -229], [-97, -42], [-82, -362], [-113, -103], [-113, 51], [-23, -127], [-59, 80], [-255, 19], [-133, -116], [-144, -63], [-151, 32], [-84, -89], [-149, 80], [-126, -41], [-121, -219], [-88, -1], [-138, -146], [-78, 23], [-103, 381], [-198, -89], [-100, 113], [-49, -44], [-243, 120], [-18, 175], [-90, 123], [-12, 161], [-56, 10], [-13, 175], [-77, 91], [-93, 619], [-71, 9], [-68, 349], [65, 78], [-98, 183], [-160, 49], [-40, 175], [-178, 238], [-41, 272], [-219, -52], [-105, 22], [-91, -164], [-185, -103], [-76, -114], [-58, -199], [-101, -151], [-169, -39], [-148, -144], [-113, -269], [-92, -93], [-263, -105], [-310, -380], [-209, -532], [-142, -44], [-109, -218], [-122, -160], [-128, -276], [-31, -368], [-76, -198], [-113, -423], [10, -193], [-37, -296], [50, -126], [14, -359], [-117, -486], [-170, -370], [20, -106], [-57, -593], [-43, -139], [-89, -35], [-50, -300], [-106, -18], [-80, -233], [-78, -44], [-115, -212], [-82, 0], [-246, -262], [2, -129], [-277, -438], [-67, -368], [-78, -142], [-225, -235], [-154, -497], [-113, -115], [-29, -204], [-90, -123], [-141, -50], [-221, -300], [-58, -301], [-60, -92], [-29, -230], [-118, -454], [-125, -150], [-75, 49], [-65, -146]], [[34864, 73972], [-133, -198], [-59, -270], [46, -66], [31, -328], [2231, 404], [959, 159], [1106, 174], [1140, 164], [1239, 164], [174, -3992], [200, -3715], [346, -7858], [72, -1713], [70, 9]], [[41662, 31680], [-381, 7668]], [[32975, 37767], [-804, -183], [-1599, -394], [-902, -254], [357, -3817]], [[30027, 33119], [178, -1913], [83, -825], [611, -6643]], [[30899, 23738], [43, -573], [133, -1424], [422, 108], [121, 74], [790, 192], [142, 7], [561, 150], [1012, 230], [30, 31], [911, 211], [2140, 455], [76, 29], [1288, 260], [526, 96], [25, -24], [1804, 311], [1111, 176]], [[94213, 27804], [219, 1303], [118, 899], [-64, 48], [54, 245], [-36, 112]], [[94504, 30411], [-147, -4], [-111, 132], [-103, 34], [-69, 111], [-83, -56], [-39, 142], [-264, 232], [-115, -18], [-139, 172], [-48, -49], [-163, 75], [-24, 98], [-109, -41], [-233, 173], [-30, -177], [-124, 417], [-61, 2], [-95, 292], [-88, -43], [-111, 242], [-45, -23], [-126, 148], [0, 181], [-167, 109], [-122, 238], [-40, -40], [-71, 148]], [[91777, 32906], [-10, -101], [-165, -285], [338, -583], [-154, -265], [-122, -1234], [-173, -1632]], [[55131, 41927], [1908, 27], [910, -34], [913, -65], [484, -24], [846, -76], [1110, -122], [616, -91], [86, 228], [96, 29], [18, 148], [94, 162], [59, 2], [12, 186], [71, 98], [110, 12]], [[62464, 42407], [-68, 144], [-64, 415], [5, 418], [36, 351], [140, 408], [-43, 196], [35, 152], [118, 164], [-1, 246], [227, 364], [97, 88], [71, 223], [82, 20], [117, 338], [351, 385], [205, 326], [96, 620], [-49, 138], [62, 207], [44, 281], [142, 203], [67, -30], [148, -373], [249, 143], [102, 8], [245, 246], [-10, 199], [-141, 308], [69, 300], [-18, 171], [-109, 284], [-47, 398], [-78, 169], [-39, 403], [44, 259], [145, 202], [61, 168], [130, 153], [73, 20], [80, 172], [50, -5], [116, 190], [126, -1], [-80, 166], [43, 135], [91, 42], [94, -149], [117, 183], [74, 23], [148, 217], [-9, 105], [90, 28], [65, 133], [129, 93], [1, 189], [75, 150], [-76, 64], [15, 175], [150, 363], [40, 187], [-19, 169], [-92, 54], [-45, 175], [108, 138], [6, 197], [170, 440], [2, 158], [184, 175], [27, -137], [-92, -169], [85, 12], [117, 188], [17, 121], [104, -21]], [[66869, 55082], [61, 60], [-48, 460], [-64, 162], [115, 121], [-88, 61], [-51, 174], [80, 183], [-63, 152], [-43, 236], [-54, 24], [-132, -244], [-84, 73], [-56, 458]], [[66442, 57002], [-57, 153], [-63, -132]], [[66322, 57023], [29, -154], [-32, -126], [-118, -25], [-41, 110], [66, 204]], [[66226, 57032], [39, 83], [-40, 161], [71, 210], [-43, 163], [-130, 4], [3, 121], [142, 133], [-88, 130], [-194, -29], [-16, 64], [164, 200], [51, 198], [-147, 190], [-35, 319], [-47, 7]], [[65956, 58986], [-1152, 143], [92, -374], [142, -206], [21, -177], [162, -190], [70, -173], [24, -330], [-36, -166], [-116, -79], [-26, -281], [-1731, 168], [-2103, 161], [-1452, 86], [-1388, 59], [-1267, 37]], [[55910, 44178], [-65, -109], [-103, -17], [-25, -100], [38, -260], [-137, -227], [16, -163], [-147, -164], [5, -79], [-102, -88], [-136, -598], [-12, -138], [65, -47], [-18, -175], [-42, 132], [-111, 1], [-5, -219]], [[77907, 47475], [115, 37], [203, -183], [136, -72], [14, -509], [24, -64], [146, -41], [21, -100], [-47, -325], [-88, -330], [109, -202], [-16, -220], [66, -321], [122, -240], [69, 128], [71, 0], [72, 177], [-33, 150], [73, 87], [104, -307], [95, 61], [-46, -147], [16, -167], [-105, -272], [106, -85], [-46, -312], [94, -207], [19, -193], [173, -12], [-3, -277], [163, -323], [109, 200], [81, 2], [116, -187], [79, -22], [48, -188], [76, -71], [89, -306], [196, -440], [93, -73], [-5, -231], [46, -141], [-69, -113], [50, -191], [-17, -164], [49, -100], [-41, -143], [85, -65], [6, -224], [-35, -400], [39, -104], [-11, -213], [55, -367], [44, -78], [17, -223], [-51, -318], [4, -270], [-78, -230], [-79, -126], [38, -176], [184, -140]], [[82737, 41088], [184, 1962], [75, -66], [70, -211], [107, -184], [43, 6], [42, -237], [162, -253], [50, -262], [111, -20], [142, 56], [199, -699], [-9, -124], [113, 49], [-69, 78], [232, 188], [158, 10], [172, -60], [45, -165], [-41, -112], [82, -12], [51, -225], [154, 34], [116, -339], [121, 15], [197, 247], [104, -88], [196, -3], [10, 114], [-72, 54], [45, 175], [165, 148], [60, 138], [34, 340], [66, 28]], [[85852, 41670], [-38, 138], [-64, 638], [-1014, -979], [58, 423], [-93, 406], [39, 40], [-46, 196], [71, 97], [-228, 605], [42, 41], [-64, 230], [-40, -58], [-130, 347], [-21, -98], [-93, 211], [-88, 506], [-247, -265], [-66, 248], [-42, 365], [17, 163], [-50, 14], [-89, 558], [5, 122], [-142, 361], [-298, -88], [-142, -328], [-205, -94], [-41, 472], [34, 157], [-63, 322], [-95, 220], [49, 132], [-86, 133], [-127, 462], [41, 84], [-88, 473], [-105, 228], [-198, 576], [-47, 224], [19, 97], [-62, 166], [66, 160], [87, 47], [-162, 295], [7, 108], [84, -14], [-20, 105], [-274, 411], [-83, -206], [-68, 51], [-237, 375], [-104, 116], [-176, -176], [-25, 186], [72, 125], [-77, 146], [-356, 239], [-181, 219], [-274, -328], [-72, 271], [-55, 24], [-173, 295], [-203, 74], [-222, -267], [-113, 16], [-176, -318], [-16, -213], [-120, -127], [110, -174], [-81, -71]], [[79273, 50584], [-264, -18], [-38, -123], [-145, -87], [-64, -126], [-98, -11], [-117, -422], [-159, -200], [-8, -133], [-102, -46], [-58, -114], [47, -213], [-95, -40], [-81, -252], [-133, -162], [-58, -161], [56, -37], [-23, -246], [56, -122], [-11, -200], [-54, -100], [-17, -296]], [[62464, 42407], [68, -49], [12, -427], [-76, -159], [89, -266], [167, -125], [105, -7], [102, -135], [33, -375], [-7, -172], [153, -386], [58, -70], [21, -440], [-14, -223], [-79, -221], [-88, -32], [-129, -279], [57, -253], [33, -409], [118, -100], [76, 42], [117, -132], [199, -8], [134, -60], [101, -205], [214, -62], [75, -169], [112, -98], [2, -354], [25, -214], [56, -133], [145, -154], [42, -403], [-22, -209], [31, -165], [-46, -145], [-7, -287], [-93, -144], [-297, -235], [-72, -196], [19, -173], [-97, -205], [-132, -121], [-40, -106], [-128, -104], [1, -141]], [[63502, 34098], [930, -94], [1346, -114], [759, -72], [1095, -166], [515, -58]], [[68147, 33594], [13, 412], [-32, 326], [74, 350], [112, 292], [129, 251], [9, 111], [122, 511], [31, 248], [150, 435]], [[68662, 51678], [-51, 242], [-97, 126], [-56, 194], [62, 330], [134, 208], [-29, 170], [-342, 127], [-137, 216], [-81, -80], [-111, 163], [-51, 405], [134, 294], [50, 201], [-47, 301], [-151, 35], [-159, -176], [-183, -65], [-137, -155], [-228, -122], [-121, 28], [-141, 245], [-35, 185], [-72, 125], [-32, 267], [88, 140]], [[34864, 73972], [-1680, -335], [-1475, -315], [-129, 1713], [-1587, -359]], [[65956, 58986], [30, 122], [142, 231], [-55, 78], [-71, -71], [-88, 67], [7, 127], [110, 143], [-133, 66], [-52, 180], [-110, 84], [-54, -63], [-77, 88], [-3, 186], [65, 129], [112, -66], [9, 133], [-175, 209], [91, 137], [-11, 131], [-133, -164], [-88, 56], [-10, 170], [59, 146], [-60, 242], [-28, -238], [-92, 0], [-85, 190], [-13, 143], [80, 25], [29, -139], [79, 98], [-50, 312], [-98, 44], [27, 152], [96, 8], [51, 149], [-75, 99], [102, 171], [-62, 100], [-72, -60], [-60, 68], [-52, 359], [-152, -43], [-25, 181]], [[65061, 62966], [114, 160], [5, 169], [-157, 197], [-148, 115], [-33, -190], [-75, 12], [49, 227], [17, 268], [-28, 105], [-82, -2], [-9, -278], [-87, 273], [43, 117], [129, -8], [20, 100], [-71, 152], [-72, 27], [-16, -218], [-63, 74], [9, 212], [86, 293], [-74, 211], [51, 190], [-24, 94], [-138, 148], [8, 186], [-65, 25], [12, -180], [-143, 29], [46, 221], [-41, 104], [-122, 61], [-20, 238], [-111, -133], [-46, 115], [86, 119], [131, -16], [-31, 177], [-138, -94], [-78, 111], [13, 104], [147, 97], [-27, 206], [-181, 58], [53, 146], [-69, 59], [-39, -139], [-123, 119], [19, 80], [128, 99], [-103, 236], [58, 202], [103, 100], [-282, 66], [1, 182], [52, 78], [90, -51], [67, 161], [-108, 67], [-129, -177], [-122, 124], [172, 186], [13, 119], [-171, 129], [91, 247], [-89, 238], [120, -63], [5, -174], [74, 89], [-7, 165], [-130, 63], [72, 136], [96, -60], [43, -229], [55, 83], [-143, 311], [4, 200], [84, 229], [55, -194], [45, 63], [-83, 196], [17, 290], [-30, 55], [-148, -26], [-30, 126], [148, 162], [-70, 238]], [[63736, 70773], [-1462, 104], [-504, 29], [-2150, 89], [-1239, 47]], [[13284, 60870], [104, 59], [154, 243], [128, 138], [67, 310], [-46, 127], [-78, -116], [-161, -89], [-26, -132], [34, -236], [-119, -103], [-57, -201]], [[13043, 62541], [57, 11], [104, 480], [186, 479], [-142, 26], [-102, -244], [-103, -752]], [[12100, 58185], [117, 62], [-12, 96], [-110, -35], [5, -123]], [[11421, 60871], [95, 16], [146, 289], [-91, 11], [-115, -121], [-35, -195]], [[11257, 57627], [165, 169], [115, 35], [102, 191], [118, 65], [65, -104], [121, 113], [-93, 114], [-188, -43], [-118, 53], [-260, -196], [24, -195], [-51, -202]], [[10630, 57649], [146, 40], [237, -5], [-20, 155], [105, 92], [-14, 156], [-290, 57], [-71, -124], [-93, -371]], [[10292, 57356], [175, -64], [78, 233], [-104, -13], [-149, -156]], [[8891, 24760], [762, 401], [603, 299], [325, 123], [156, 103], [651, 316], [410, 182], [596, 310], [1528, 762], [1194, 543], [459, 198]], [[15575, 27997], [-631, 4183], [-205, 1395], [-309, 2029], [-425, 2726], [-120, 846], [1130, 2903], [659, 1703], [1490, 3831], [1527, 3937], [1213, 3121], [1226, 3147]], [[19970, 66387], [-4489, -908], [20, -358], [-74, -273], [-100, 39], [40, -513], [-27, -85], [79, -175], [16, -538], [-31, -444], [-215, -922], [-136, -262], [-62, -238], [-116, -124], [-84, -354], [-140, -256], [-83, -86], [-107, -236], [-120, -347], [-148, -192], [-25, 148], [-145, 18], [-254, -256], [-14, -135], [77, -86], [23, -135], [-38, -409], [-92, -383], [-81, -90], [-319, -95], [-124, 71], [-71, -161], [-144, -97], [-238, -318], [-73, -38], [-129, -238], [-38, -440], [-141, -325], [-37, -10], [-94, -263], [-153, -222], [-198, -97], [-77, 49], [-140, -150], [-145, -28], [-209, -297], [-228, -153], [-288, -103], [-310, -63], [-28, -312], [-204, -323], [142, -379], [-26, -266], [99, -302], [-32, -247], [-40, -30], [163, -554], [20, -302], [-135, -217], [-49, 50], [-148, -251], [-47, -187], [98, -272], [41, -285], [-41, -201], [-160, -120], [-119, -407], [-62, -375], [-183, -239], [-28, -170], [11, -274], [-164, -487], [-2, -460], [-102, -133], [-48, -394], [-102, -372], [-143, -224], [-88, -377], [26, -244], [-5, -418], [61, -269], [-51, -116], [111, -154], [40, 150], [143, -153], [152, -516], [-49, -535], [-88, -228], [-87, 54], [-226, -115], [-135, -298], [-106, -463], [-52, -29], [-17, -231], [-50, -116], [10, -207], [98, -396], [-25, -321], [14, -172], [-84, -205], [136, -596], [29, -365], [199, -25], [6, 309], [-46, 88], [-32, 265], [16, 189], [152, 153], [117, 332], [50, 9], [53, 240], [77, 27], [-81, -242], [-11, -329], [22, -309], [-108, -269], [27, -114], [-130, -184], [89, -213], [-2, -234], [-107, -70], [-36, -230], [114, -5], [16, -111], [116, 44], [85, -94], [-28, -256], [-130, -217], [-186, 51], [-66, 324], [61, 169], [-82, 40], [-44, 123], [79, 230], [-97, -98], [3, 247], [-97, 6], [-34, -148], [-127, -274], [-84, 2], [-99, -280], [-35, -200], [-84, -157], [-92, -72], [-83, 117], [-55, -72], [153, -363], [52, -180], [-27, -292], [46, -116], [-51, -197], [-71, -2], [29, -218], [-44, -386], [-162, -325], [-102, -271], [-117, -669], [-225, -632], [-82, -332], [2, -147], [123, -208], [18, -136], [-37, -911], [22, -351], [69, -278], [148, -352], [0, -209], [43, -298], [-35, -175], [35, -421], [-71, -162], [-6, -191], [-104, -471], [-61, -98], [-1, -299], [-107, -164], [-198, -630], [61, -185], [10, -310], [-28, -197], [97, -276], [150, -313], [330, -589], [183, -390], [107, -357], [-50, -128], [51, -334], [140, -276], [207, -738], [41, -414], [-5, -777], [-44, -7], [-72, -226], [145, -348], [67, -409]], [[89344, 39315], [-17, -88]], [[89382, 38984], [-112, 180], [-15, 218], [98, 102], [-10, 332], [237, 450], [101, 78], [129, 382], [-6, 193], [72, 361], [165, 214], [41, 235], [262, 366], [108, 57], [67, -85], [108, 497], [131, 779]], [[90758, 43343], [-583, 219], [-512, 160], [-668, -4059], [-94, -643]], [[87032, 42793], [106, -278], [268, 311], [-174, 459]], [[87232, 43285], [-14, -228], [-81, -162], [-105, -102]], [[35766, 96281], [15, -144], [179, -286], [82, -15], [69, -280], [121, -168], [14, -226], [-82, -164], [-69, -255], [-15, -226], [32, -191], [79, -62], [224, 147], [30, 102], [167, 144], [112, 154], [88, -20], [192, 102], [418, 337], [295, 407], [100, 216], [-17, 427], [183, -8], [55, 184], [-5, 187], [171, 268], [188, 152], [-17, 187], [-331, 507], [-322, 284], [-152, 60], [-192, -19], [-135, 221], [-119, 81], [-76, 138], [-110, 55], [-110, 214], [6, 107], [-98, 315], [-148, 208], [-115, -197], [-170, -169], [-160, -85], [-85, -322], [70, -824], [-76, -539], [-64, -38], [-54, -455], [-183, -466], [15, -45]], [[34406, 91804], [72, -328], [154, -99], [97, 106], [150, 419], [187, -96], [128, -117], [199, 69], [0, 53], [205, 214], [36, 129], [236, 119], [35, 277], [-139, 261], [-187, 118], [-106, -31], [-230, 175], [-158, 30], [-137, -134], [-46, -638], [-88, -67], [-67, 80], [-197, -162], [-99, -188], [-45, -190]], [[34402, 93280], [264, -283], [71, 101], [-14, 227], [-114, -15], [-166, 67], [-41, -97]], [[33645, 91867], [153, -106], [194, 64], [126, 196], [58, 207], [-60, 170], [-149, 95], [-123, 17], [-91, -454], [-108, -189]], [[33124, 91117], [114, -264], [-14, -189], [554, 147], [76, -113], [35, 137], [164, 43], [203, -59], [130, 81], [-63, 180], [-132, 168], [-157, 68], [-458, -206], [-330, 60], [-122, -53]], [[31100, 89295], [319, -28], [226, -428], [104, -47], [93, 317], [181, 378], [-9, 267], [131, 181], [29, -187], [88, 8], [-34, 208], [62, 194], [121, 208], [-123, 138], [-116, -64], [-118, 69], [-144, -175], [-192, -37], [-275, 51], [-57, -273], [-81, -117], [-27, -166], [-85, -151], [-2, -199], [-91, -147]], [[27948, 87541], [10, -131], [81, -123], [32, -160], [360, -322], [100, 90], [49, -98], [178, -9], [110, 69], [116, 269], [-7, 149], [-77, 204], [4, 343], [-121, 214], [-121, 129], [-64, -52], [-267, -43], [-135, -234], [-203, -129], [-45, -166]], [[26988, 88208], [30, -141], [198, -232], [52, -175], [85, -29], [-17, 406], [-174, 115], [-94, 321], [-91, -137], [11, -128]], [[62450, 30375], [-20, 166], [57, 157], [-17, 193], [180, 186], [87, 216], [-179, 491], [14, 357], [55, 286], [9, 220], [75, 81], [93, 550], [196, 193], [359, 131], [105, 270], [38, 226]], [[55131, 41927], [24, -92], [-64, -194], [-90, -69], [-78, -210], [78, -151], [-8, -365], [52, -54], [-41, -232], [20, -125], [-69, -142], [11, -305], [-35, -256], [66, -99], [-110, -15], [-33, -388], [66, 26], [20, -131], [-115, -83], [41, -469], [-137, -64], [20, -153], [-58, -112], [-43, 124], [-71, -147], [25, -105], [-58, -182], [31, -69], [-33, -211], [80, -420], [-57, -53], [-96, -341], [54, -254], [-165, -88], [7, -157], [-76, -38], [8, -251], [-124, -194], [-22, -211], [54, -56], [-74, -303], [-80, -166], [4, -188], [58, -177], [-25, -145], [-81, -26]], [[73897, 45707], [119, -187], [113, 159], [149, 72], [152, -108], [59, -120], [65, 61], [22, 167], [149, 51], [79, 102], [42, 188], [109, 220], [61, 328], [252, 83], [154, -98], [214, 71], [39, 118], [108, 87], [30, 140], [187, 75], [74, -235], [156, -108], [99, 85], [179, 25], [155, 195], [72, -131], [167, -25], [37, -190], [95, -116], [28, -123], [88, -22], [137, -152], [146, 630], [75, 71], [131, -9], [223, 282], [45, 182]], [[79273, 50584], [-584, 1209], [-157, 122], [-164, 194], [-273, 395], [23, 287], [-93, 166], [-140, 153], [32, 179], [-25, 164], [-150, 158], [-178, 54], [-82, 303], [4, 149], [-102, 38], [-189, 153], [-192, 215], [-190, 52], [-192, 208], [-42, 95]], [[76579, 54878], [-21, 75], [-526, 89], [-982, 182], [-531, 74], [-324, 10], [-303, 36], [-515, 140], [-609, 86], [-356, 33], [-535, 23], [-310, 39], [-95, 90], [-50, -65], [-926, 192], [-548, 92], [-756, 144], [0, -118], [-393, 1], [93, 519], [-29, 173], [-1387, 166], [-827, 87], [-207, 56]], [[66322, 57023], [-96, 9]], [[89393, 45821], [-90, 33]], [[89303, 45854], [-29, -300], [100, 4], [19, 263]], [[89139, 45236], [-20, -259], [63, -66], [132, 451], [-175, -126]], [[90758, 43343], [1, 502], [-23, 60], [-49, 870], [-48, 291]], [[90639, 45066], [-635, 369], [-57, 193]], [[89947, 45628], [-86, -70], [-119, 59], [-105, 254], [-68, -2], [-24, -186], [16, -243], [91, -130], [-123, -18], [62, -254], [-127, 17], [-64, 133], [-30, -281], [153, -148], [-146, -154], [46, -397], [-77, 108], [-48, 386], [-93, -197], [63, -102], [-88, -166], [-48, 296], [50, 76], [-10, 156], [-58, -21], [-93, 113], [-56, -22], [-146, -251], [-261, -586], [118, -87], [-75, -232], [-1, -159], [64, -98], [51, 68], [61, -111], [22, 113], [134, -16], [117, 50], [-127, -182], [-110, -8], [-106, -95], [-124, -214], [-16, 97], [-83, -35], [12, 194], [-46, -11], [-18, -335], [70, -336], [107, 117], [39, -83], [-67, -365], [-54, -36], [-85, 188], [-74, 13], [28, 154], [-70, 80], [-16, -344], [54, -416], [67, 201], [131, -10], [52, -123], [-55, -164], [43, -200], [-94, 63], [26, 289], [-66, -51], [-13, -241], [-101, -179], [45, -474], [49, -295], [82, -187], [183, -48], [-64, -51], [69, -268], [-62, 2], [21, -420], [-200, 154], [-17, 167], [117, 149], [-63, 70], [-165, 387], [-57, -84], [22, -191], [-56, -74], [-19, 330], [62, 91], [-24, 163], [-76, -295], [-94, -16], [83, 282], [-75, 181], [77, 46], [-137, 293], [-104, -18], [-14, -84], [-154, -61], [120, 236], [205, 159], [19, 304], [95, 130], [-117, 194], [55, 239], [-59, 10], [-22, 192], [61, 75], [-86, 311], [76, 143], [12, 177], [64, 224], [32, 331], [61, 160], [221, 296], [-23, 264], [-86, 7], [43, 126], [76, -100], [55, 40], [-25, 155], [44, 149], [147, 260], [-22, 81], [67, 277], [-202, -174], [-56, -197], [-49, 47], [12, 188], [-105, -78], [-64, -187], [-76, -80], [-151, -26], [-212, 65], [-28, -163], [-127, -262], [71, 385], [-151, -94], [-118, -178], [-113, -348], [-287, 436], [-83, -61], [-85, -361], [31, -287], [146, -377]], [[87148, 43931], [-21, -145], [133, -222], [-28, -279]], [[87032, 42793], [-58, -98], [-184, -22], [-6, -133], [-181, -107], [-212, 20], [-116, -137], [-2, -240], [56, -201], [-140, -86], [-73, -148], [-81, 41], [-183, -12]], [[72376, 19856], [67, -9], [39, 130], [375, 129], [-83, 211], [-132, -33], [-266, -428]], [[71033, 20248], [123, 104], [-12, 121], [-115, -102], [4, -123]], [[70925, 21159], [19, -326], [43, -121], [-3, -187], [103, 3], [51, 546], [-100, 163], [-113, -78]], [[70780, 20656], [76, -41], [-20, 182], [-56, -141]], [[70569, 21819], [78, 44], [14, 191], [-92, -235]], [[70356, 23024], [27, -79], [111, 61], [18, 289], [-57, 6], [-84, -143], [-15, -134]], [[70242, 23544], [52, -156], [65, 57], [-78, 144], [-39, -45]], [[69268, 21380], [125, 190], [-41, 80], [-84, -270]], [[69896, 36148], [165, -256], [144, -313], [170, -897], [180, -557], [73, -415], [49, -481], [15, -927], [-61, -761], [-49, -365], [-106, -446], [-226, -656], [-179, -738], [-80, -223], [-48, -254], [11, -130], [93, -282], [33, -286], [-86, -570], [-101, -318], [121, -259], [107, -519], [97, -386], [16, -294], [-16, -236], [26, -327], [-72, -301], [21, -227], [218, -175], [18, -112], [-21, -520], [136, -26], [61, -252], [104, 95], [96, -59], [71, -403], [92, -177], [75, -376], [117, -112], [22, 123], [-118, 213], [93, 246], [-110, 348], [66, -78], [20, 244], [-36, 29], [-19, 348], [53, 237], [54, -15], [69, -479], [-55, -11], [51, -313], [66, -78], [-17, 555], [-72, 159], [-13, 195], [80, 30], [162, -734], [-2, -716], [-63, -444], [18, -140], [231, -376], [99, -71], [176, 0], [174, -157], [-17, -107], [-190, -20], [-84, -138], [-72, -340], [54, -242], [87, -103], [94, -315], [-121, -98], [337, -17], [30, -168], [360, 261], [159, 159], [70, -81], [132, -8], [185, 75], [154, 246], [47, 210], [316, 6], [178, 218], [134, -7], [208, 187], [159, -54], [205, 295], [-42, 98], [107, 296], [75, 114], [105, 383], [-214, -132], [-74, 166], [43, 82], [-4, 216], [93, 169], [122, 59], [46, 185], [30, 317], [47, 113], [-31, 467], [28, 207], [22, 766], [-48, 41], [-80, 251], [-131, 25], [-50, 191], [-6, 661], [-146, 111], [12, 161], [-235, 72], [-105, 297], [5, 545], [-32, 109], [94, 281], [99, 86], [47, -122], [37, 117], [116, 44], [86, 108], [52, -65], [135, -428], [109, -109], [-50, -156], [67, -453], [37, 159], [121, -229], [-128, -71], [142, -24], [74, -233], [126, -63], [202, -177], [26, -120], [164, -137], [210, 133], [96, 108], [129, 379], [88, 182], [63, 339], [62, 516], [150, 605], [93, 800], [99, 453], [157, 448], [-51, 208], [-6, 461], [38, 172], [-41, 610], [-113, 256], [-61, -10], [-62, 156], [-9, -215], [-59, -76], [119, -301], [-128, -53], [-145, 173], [-23, 152], [72, 187], [-82, 3], [-51, 184], [29, 275], [-57, 398], [-217, 184], [-80, 326], [37, 576], [-84, 104], [16, 231], [-109, 286], [-89, 75], [-12, 177], [-63, 50], [-76, 335], [46, 177], [-47, 42]], [[75446, 35165], [-1481, 426], [-730, 191]], [[64918, 13379], [106, -237], [496, -525], [39, 0], [216, -347], [159, -157], [35, 32], [148, -118], [-35, 110], [-179, 324], [2, 98], [-128, 196], [-335, 265], [-149, 189], [141, 48], [-310, 277], [-100, 1], [-106, -156]], [[63336, 18545], [380, -342], [205, -132], [159, -269], [99, -222], [86, -97], [177, -76], [85, 45], [158, -106], [151, -26], [245, -256], [185, -369], [200, -37], [89, -182], [44, -229], [181, -234], [152, -286], [122, -94], [103, -195], [111, -311], [344, -378], [303, -126], [270, -16], [136, 107], [15, 126], [-155, 105], [-215, 22], [37, 166], [-169, 193], [-150, 334], [-73, 36], [-19, 245], [-84, 74], [-7, 120], [-80, 123], [-13, 192], [-108, 194], [-36, 542], [57, 268], [93, -299], [199, -391], [147, -162], [-6, 88], [-131, 242], [-52, 210], [152, -298], [140, -81], [149, 34], [130, -33], [252, 133], [21, 127], [154, 50], [64, 101], [29, 196], [100, 146], [39, 151], [102, 155], [92, 23], [43, 321], [170, 47], [231, -67], [131, -165], [63, 17], [57, 199], [104, 100], [105, -3], [35, -159], [80, -4], [66, 130], [9, -230], [-49, -167], [83, -78], [45, 96], [-19, 186], [98, 70], [160, -365], [177, -133], [302, -416], [64, 59], [331, -199], [129, 14], [319, -35], [160, -52], [326, -343], [125, -63], [169, -11], [168, -78], [-98, 295], [10, 368], [31, 216], [-41, 72], [75, 165], [117, -60], [222, 120], [175, -195], [74, -4], [71, 253], [198, -140], [49, -241], [254, -53], [34, -134], [150, -18], [34, 93], [-29, 335], [69, 383], [25, 306], [-155, 41], [-34, 223], [193, -58], [47, 103], [118, 48], [-58, 163], [143, 199], [71, -11], [127, 113], [26, -124], [88, 96], [15, -218], [-92, -180], [84, 30], [207, -96], [87, 36], [97, 279], [100, 81], [-41, 222], [-75, 81], [-157, -91], [-168, 88], [-183, -98], [-208, 80], [-150, -43], [-332, 157], [-65, 107], [-181, -178], [-70, 86], [-65, -228], [-69, 37], [-80, -84], [-49, 108], [26, 201], [-76, 122], [83, 339], [-66, 81], [-140, -112], [-24, -96], [-125, -99], [-152, -260], [-241, -124], [-69, 36], [-225, -139], [-68, 53], [-218, 7], [-112, 254], [-78, 258], [-50, 36], [-180, -43], [-124, 72], [-32, 183], [-211, -120], [-226, 37], [-121, 102], [-63, 149], [-36, 452], [-81, 0], [-19, 103], [-125, 80], [-32, 176], [-68, 24], [6, 146], [-62, 38], [29, 197], [-151, -138], [-20, -130], [74, -82], [37, -313], [74, 2], [68, -298], [-27, -138], [-67, -22], [-83, 263], [-217, -64], [24, 183], [-66, 168], [-16, 187], [-158, 128], [-65, -28], [-28, -397], [-54, -100], [-54, 110], [19, 396], [-166, 206], [-119, 440], [-88, 416], [15, 63], [-92, 249], [-94, 382], [-198, 572], [38, 136]], [[67974, 23591], [-114, -32], [-129, -224], [50, -493], [54, -167], [-82, -182], [-86, 169], [-127, 12], [-69, -90], [11, -222], [71, -124], [23, -160], [-69, -234], [51, 18], [22, -184], [-80, -134], [61, -109], [-55, -138], [-152, -161], [-92, 17], [-57, -134], [-151, 59], [-71, -118], [86, -188], [-54, -211], [-230, -125], [-74, 56], [-138, -136], [-51, 69], [-151, -144], [-150, 29], [-14, 111], [-198, -126], [-54, 51], [-119, -78], [-390, -326], [-1620, -572], [-86, -384], [-109, -256], [-135, -31], [-25, -119], [-92, 89], [-43, -124]], [[69164, 80888], [196, -33], [-82, 124], [-114, -91]], [[68657, 80846], [107, -58], [252, 112], [-163, 6], [-196, -60]], [[68245, 81011], [181, -55], [-144, 109], [-37, -54]], [[67912, 80966], [144, -14], [-40, 127], [-104, -113]], [[65061, 62966], [1584, -168], [1108, -142], [1127, -155]], [[69359, 80276], [-202, 212], [-65, -75], [-85, 58], [-39, -93], [-124, -4], [-157, 76], [-130, -126], [-10, 94], [-204, -101], [-305, 137], [-389, 297], [15, -181], [-72, -89], [-94, 100], [77, 180], [-164, 206], [-45, 270], [-146, 35]], [[67220, 81272], [-88, 12], [-98, -170], [-59, -224], [18, -200], [-113, -243], [-7, -175], [-152, -191], [-92, -189], [-41, -288], [-68, -96], [36, -250], [-13, -162], [48, -101], [70, -587], [47, -197], [-48, -27], [-1305, 147], [-1188, 115], [-1100, 90], [134, -162], [-9, -119], [-115, -235], [63, -177], [-111, -206], [2, -125], [128, 12], [104, -63], [17, -145], [-143, -320], [60, -135], [61, 236], [71, 15], [10, -120], [-84, -179], [-13, -332], [123, -43], [77, -121], [-31, -104], [-117, 52], [-64, -100], [34, -125], [132, 120], [54, -39], [-3, -350], [76, -122], [150, -28], [21, -85], [-192, 4], [41, -315], [132, -18], [158, -263], [-20, -164], [206, -232], [-166, -151], [60, -70], [59, 103], [108, -201], [54, -231], [-86, -75], [1, 209], [-207, -14], [-10, -247], [263, -174], [54, 81], [42, -153], [-18, -167], [80, 16], [72, -151], [-178, -75], [-20, -199], [50, -71], [-55, -109], [-65, 72], [-168, -176], [23, -165], [196, 148], [19, -57], [-179, -213], [137, -267], [-46, -88], [-40, 155], [-126, 96], [-70, -208], [128, -205], [41, -137], [-192, -51], [-14, -265], [30, -127], [131, -181], [-40, -333], [-91, -5], [14, 201], [-35, 100], [-120, -99], [81, -291]], [[25191, 4391], [1222, 445], [1212, 407], [994, 341], [998, 311], [2207, 658], [728, 200], [1157, 300], [1795, 442], [1116, 254], [1171, 251], [1418, 281], [1225, 222], [1144, 194], [1223, 183]], [[30899, 23738], [-109, -106], [-18, -168], [-112, -206], [17, -160], [-119, -426], [-100, -136], [-47, 149], [-114, -20], [5, 165], [-104, 206], [69, 225], [-54, 31], [-124, -124], [-50, 40], [-137, -83], [-24, 58], [-179, 82], [-56, -229], [-183, 54], [-78, -62], [-126, 64], [-116, -82], [-79, -159], [-67, -22], [-129, 116], [-76, 292], [-122, -161], [-49, 51], [-71, -106], [-172, -55], [-84, -98], [-105, 44], [-110, 208], [18, 179], [-57, 60], [-50, -162], [-162, -264], [-17, -185], [41, -100], [-89, -324], [55, -57], [1, -227], [-40, -82], [-22, -300], [-160, -245], [-163, 97], [-8, -139], [-135, -221], [-28, -332], [84, -18], [28, -377], [-92, -161], [19, -80], [-89, -80], [-13, -248], [-106, -278], [-49, -294], [30, -252], [-51, -260], [56, -237], [-106, -35], [77, -292], [-124, -203], [-110, -271], [-55, 27], [-17, 167], [-84, 54], [-134, 229], [-97, 49], [-81, -63], [-42, 181], [-126, 100], [-105, -232], [-47, -216], [-137, -44], [38, -167], [-21, -136], [107, -77], [15, -202], [-72, -226], [136, -253], [137, 43], [46, -104], [-43, -222], [50, -62], [-84, -184], [-11, -203], [71, -171], [-81, -136], [28, -156], [107, 12], [3, -362], [58, -17], [58, -211], [9, -196], [93, -185], [-16, -222], [82, -9], [106, -504], [-51, -103], [-100, -1], [-76, 87], [-221, -106], [-23, -161], [44, -94], [-104, -163], [-121, 127], [1, -318], [-135, -162], [-67, -220], [53, -216], [-84, -232], [-71, -15], [-26, -304], [-115, -372], [-72, -101], [-77, -437], [-122, -75], [-155, -207], [-15, -186], [-252, -447], [170, -13], [-59, -117], [3, -163], [-60, -128], [104, -119], [-43, -245], [38, -149], [-124, -260], [-2, -244], [-69, -134], [-132, -553], [-25, -25], [474, -3787]], [[92968, 16433], [-28, -214], [75, -267], [2, -294], [-87, -84], [88, -34], [115, -325], [115, 156], [149, -51], [38, -256]], [[95336, 23105], [-71, 511], [3, 268]], [[92763, 25585], [-178, -247], [-58, -278], [-6, -275], [83, -104], [25, -163], [-59, -150], [17, -265], [-53, -83], [-27, -432], [32, -230], [-55, -173], [-15, -443], [-44, -119], [-5, -248], [65, -142], [-17, -389], [115, -321], [-21, -327], [82, -438], [-49, -125], [77, -417], [-107, -343], [1, -193], [-49, -107], [26, -207], [187, -190], [132, -86], [-16, -102], [147, -185], [60, -277], [88, -145], [-60, -185], [55, -65], [-32, -250], [-65, -79], [-122, -316], [62, -158], [1, -303], [58, -218], [-109, -241], [39, -133]], [[94259, 30777], [16, -81], [139, -125], [-101, 193], [-54, 13]], [[94010, 31176], [83, -93], [-47, 166], [-36, -73]], [[91272, 34396], [57, 203], [-100, 332], [-188, 184]], [[86010, 23729], [65, -193], [-5, 156], [-60, 37]], [[85877, 23714], [49, -155], [56, -2], [-105, 157]], [[81282, 31551], [171, -230], [306, -532], [101, -266], [159, -216], [143, -129], [36, -245], [64, -142], [6, -176], [191, -247], [85, -209], [-33, -214], [-162, -397], [-139, -71], [-30, -300], [-108, -20], [26, -264], [-93, -436], [355, -325], [301, -251], [225, -138], [407, -109], [203, -91], [206, -42], [362, 5], [189, 163], [209, 106], [209, -235], [438, -195], [132, 21], [129, -43], [67, -106], [166, -128], [137, -185], [75, -297], [298, -536], [184, -26], [89, -96], [30, -191], [-24, -284], [-123, -562], [-125, -89], [40, -185], [77, -62], [23, 101], [102, -175], [-32, -132], [-130, -112], [-113, 90], [4, -152], [-95, -84], [-85, 29], [-24, -261], [45, -403], [103, -55], [110, -181], [-15, -156], [219, -341], [128, -127], [113, -294], [45, -344], [314, -859], [331, -759], [240, -340], [118, -254], [99, -38], [110, -170], [159, 38], [68, -63], [540, -182], [290, -114], [413, -204], [811, -371]], [[90152, 17663], [56, 344], [-21, 322], [86, 96], [-13, 253], [55, 578], [163, 283], [55, 262], [-29, 233], [87, 350], [-3, 121], [-76, 241], [4, 574], [51, 50], [53, 349], [85, 197], [-1, 206], [93, 166], [-49, 557], [29, 192], [53, 37], [11, -221], [108, -57], [29, 140], [111, 197], [127, 1001], [190, 1589], [-1, 141], [71, 192]], [[91777, 32906], [-23, 153], [-101, 185], [20, 260], [-77, 24], [78, 174], [71, -327], [98, -15], [18, -144], [207, -164], [9, -116], [143, 45], [-10, -130], [93, 70], [213, -3], [118, -144], [-7, -145], [160, -52], [436, -197], [216, -158], [218, -373], [151, -415], [179, -143], [-91, 309], [118, 134], [118, -14], [37, -101], [117, 187], [200, -302], [-1, -93], [150, -89], [-1, 98], [-344, 472], [-398, 593], [-259, 324], [-289, 329], [-416, 554], [-232, 238], [-154, 105], [-39, -33], [-354, 349], [-358, 112], [-246, 290], [-2, -130], [-131, 58], [-76, -169], [22, -144], [-64, -99]], [[76665, 35383], [90, -78], [-29, 133], [-61, -55]], [[76474, 35258], [-5, -239], [90, 37], [-85, 202]], [[75446, 35165], [21, 96], [121, 51], [76, -76], [173, 183], [287, 124], [127, 191], [115, 67], [117, -160], [25, -159], [94, 160], [111, -32], [1, 98], [201, 295], [238, 125], [183, -221], [173, -73], [91, -140], [282, -270], [129, 61], [319, -65], [213, -341], [219, -497], [225, -398], [62, -21], [357, -458], [174, -105], [582, -585]], [[12669, 9647], [108, 15], [52, 185], [-35, 171], [65, 175], [135, 74], [197, -76], [73, 51], [252, 529], [6, 212], [52, 305], [-14, 364], [-52, 203], [21, 128], [-68, 457], [109, 209], [276, 294], [141, 78], [56, 138], [125, 62], [116, -63], [127, 39], [334, -121], [85, -114], [92, -10], [107, 102], [324, 24], [178, 217], [103, 0], [164, 210], [10, 262], [81, 24], [93, -108], [218, 66], [65, 84], [77, -78], [276, -49], [99, -74], [110, 79], [59, 178], [154, 73], [307, 31], [81, -106], [164, -18], [180, -75], [259, 22], [205, 53], [97, -150], [89, -40], [116, 126], [367, 25], [194, 110], [202, -96], [44, -63], [1301, 537], [1831, 740]], [[22477, 15058], [37, 321], [108, 434], [103, 25], [30, 160], [108, 55], [58, 129], [-6, 270], [68, 282], [-181, 345], [-32, 174], [-61, 55], [-189, 404], [-176, 645], [-140, 259], [-97, 111], [-37, 157], [18, 187], [-231, 496], [-225, 137], [-208, 542], [-28, 134], [-135, 136], [-14, 217], [-58, 98], [52, 262], [-70, 120], [62, 176], [116, -33], [62, 216], [120, 23], [-19, 144], [70, 49], [25, 163], [-83, 175], [-76, 28], [36, 266], [-123, 370], [-28, 176], [-64, 10], [-34, 187], [-891, 6782]], [[20344, 29945], [-965, -370], [-1406, -558], [-315, -116], [-819, -351], [-826, -368], [-438, -185]], [[8891, 24760], [-103, -269], [-48, -279], [36, -246], [-32, -298], [25, -314], [63, -403], [160, -458], [19, -325], [-47, -96], [1, -228], [-61, -49], [11, -412], [254, -509], [112, -406], [96, -226], [86, -298], [-8, -147], [125, -117], [141, -268], [161, -401], [266, -871], [264, -1048], [157, -761], [125, -443], [36, -220], [141, -558], [100, -638], [97, -228], [245, -852], [107, -483], [32, -281], [69, -268], [14, -228], [42, -61], [126, -540], [35, -266], [-36, -133], [80, -259], [37, -263], [-14, -161], [104, -70], [35, -110], [40, -404], [-24, -441], [26, -34], [96, 314], [66, 81], [7, -125], [173, -4], [43, 118], [95, -68], [69, 47], [134, -106]], [[76579, 54878], [704, -150], [28, 11], [996, -234], [1339, -335], [13, -89], [486, -108], [-45, 105]], [[25159, 31686], [238, 100], [2765, 805], [30, 27], [1083, 301], [752, 200]], [[23019, 50594], [40, -393], [386, -3395], [213, -1895], [827, -7291], [133, -1140], [498, -4382], [43, -412]], [[90639, 45066], [-114, 645], [-46, 106], [-99, -29], [-68, 171], [-79, 409], [-28, 513], [42, 151], [-91, 444], [50, 26], [-78, 489], [-89, 187], [29, 184], [-12, 216], [-87, 298], [-116, 68], [-30, 120], [-27, -248], [-130, -347], [-15, -289], [29, -155], [-21, -251], [34, -757], [117, -595], [-40, -100], [121, -104], [65, -242], [-53, -134], [-83, 18], [127, -232]], [[89393, 45821], [-48, 170], [-42, -137]], [[87148, 43931], [-114, 109], [-75, -59], [11, 186], [-65, 403], [-6, 179], [126, 388], [196, -93], [123, -130], [56, -147], [65, 80], [-4, 249], [142, 168], [18, 161], [234, 118], [132, -59], [79, 87], [27, -81], [152, -25], [40, 137], [129, 114], [53, 151], [86, 20], [113, 144], [132, 30], [210, 154], [1, 221], [-86, 112], [66, 463], [-49, 148], [91, 46], [-108, 140], [-215, -142], [-54, 112], [-185, -433], [-225, -133], [-213, -329], [-69, -11], [-43, -139], [-95, -67], [4, 102], [203, 228], [168, 327], [117, 126], [104, 8], [123, 343], [96, 106], [157, -62], [57, 102], [199, 8], [-84, 197], [65, 73], [77, -79], [77, 211], [41, 224], [-17, 309], [-131, -166], [-152, -96], [-35, 154], [148, 267], [60, 23], [-237, 181], [52, 113], [130, -82], [21, 248], [83, -70], [118, 131], [56, 146], [-19, 335], [-69, -30], [-99, 242], [-121, -212], [-196, -127], [-112, -126], [5, -162], [-106, -202], [-137, 76], [-36, 100], [-80, -128], [-116, 1], [-34, -73], [-117, 167], [82, 82], [185, -47], [116, 147], [57, -10], [28, -210], [90, 319], [-1, 180], [54, 92], [106, -9], [207, 228], [33, 210], [164, -72], [48, -109], [79, 120], [-50, -275], [100, -56], [66, 53], [259, 49], [131, -134], [48, 61], [143, 538], [163, 455], [80, 287]], [[14862, 6382], [74, -321], [94, -198], [34, 192], [-43, 213], [83, 114], [-146, 108], [-101, -10], [5, -98]], [[15406, 1954], [23, -124], [84, 180], [-102, 38], [-5, -94]], [[15419, 1242], [35, -30], [74, 424], [-70, -175], [-39, -219]], [[15303, 1766], [52, -72], [38, 176], [-91, 66], [1, -170]], [[15041, 3040], [217, -393], [42, -164], [85, 2], [0, 229], [80, 259], [-85, 20], [-50, -89], [-212, 227], [124, 29], [36, 161], [3, 263], [-31, 54], [-3, 338], [115, -252], [57, 222], [73, 77], [-12, 314], [-73, 159], [-67, -75], [-15, -298], [-121, 24], [24, -103], [-73, -172], [62, -284], [2, -190], [-92, -29], [-86, -329]], [[15092, 837], [197, 290], [-144, -111], [-53, -179]], [[14901, 1109], [101, -37], [-11, 104], [-90, -67]], [[15060, 0], [83, 139], [-90, -41], [7, -98]], [[14646, 1390], [52, -76], [102, 50], [51, 235], [84, 71], [-52, -259], [244, -242], [60, 35], [160, 276], [-122, 109], [20, 233], [-44, 189], [-67, 50], [-34, 241], [-92, -29], [-49, -193], [-162, -77], [-95, -176], [-56, -437]], [[14656, 1030], [70, 51], [83, 244], [-153, -295]], [[23764, 3862], [-308, 2316], [-212, 1520], [-374, 2878], [-370, 2808], [-64, 290], [82, 238], [33, 488], [-89, 247], [15, 411]], [[12669, 9647], [-176, -120], [-59, -167], [-69, 68], [-63, -67], [-132, 107], [-46, -46], [-71, -291], [-48, -51], [-121, 130], [111, -417], [71, -389], [70, -510], [37, 210], [-68, 308], [-52, 442], [91, 47], [-8, -268], [34, -190], [53, 107], [111, -181], [-33, -413], [78, -104], [162, -98], [-67, -161], [-51, 67], [-143, 23], [-108, -231], [35, -238], [7, -374], [63, 50], [-16, 125], [197, -118], [191, -2], [-40, -114], [-166, -162], [16, -147], [-133, -115], [-56, 52], [-11, 302], [-93, 21], [101, -504], [37, -409], [14, -443], [-76, -311], [71, -718], [23, -785], [-52, -120], [12, -182], [-72, -233], [-77, -128], [-17, -312], [67, -497], [-17, -293], [49, -31], [161, -495], [-71, -237], [119, 25], [111, 150], [210, 440], [136, 192], [53, -4], [168, 268], [-19, 57], [159, 222], [169, 129], [233, 70], [141, 198], [223, 89], [46, 130], [212, 102], [153, -121], [114, 236], [15, 163], [181, 49], [-30, 84], [61, 107], [-29, 187], [56, 5], [45, -155], [-55, -143], [24, -125], [188, -35], [0, 104], [-94, 69], [24, 183], [135, -166], [-12, 334], [-83, -5], [38, 213], [-2, 211], [54, 96], [-133, 11], [-15, 137], [-105, 70], [-49, 191], [-119, 203], [-19, -72], [120, -324], [-89, 16], [-138, 337], [-148, 163], [-293, 474], [-136, 337], [181, 110], [197, -53], [78, -97], [-303, 66], [-78, -130], [344, -596], [201, -153], [162, -6], [61, -226], [119, -187], [146, -158], [51, 22], [7, -324], [89, 181], [-42, 619], [-94, -54], [40, 165], [-46, 205], [-2, 245], [-92, 84], [-25, 117], [67, 85], [-77, 125], [-76, 258], [10, 78], [-89, 183], [18, 140], [-123, 208], [-98, -311], [89, -284], [-102, 94], [-68, 180], [11, 166], [103, 173], [-61, 24], [-78, 228], [-75, -208], [-49, -382], [85, -84], [36, -189], [-143, 212], [-1, 244], [-58, 140], [76, -17], [22, 234], [131, 141], [108, -199], [65, -9], [163, -369], [7, -96], [100, 246], [62, -176], [163, -37], [27, -512], [-30, -388], [132, -67], [-94, -242], [125, -216], [21, -300], [99, -105], [110, -351], [134, -43], [24, -198], [-59, -108], [-76, -336], [42, -223], [-24, -175], [-84, -40], [-60, 131], [17, 234], [77, 311], [-114, -327], [-62, -44], [-6, -200], [50, -236], [109, -28], [72, 109], [72, -107], [-30, -166], [-119, -209], [-43, -184], [25, -119], [-166, 30], [-38, -202], [55, -176], [107, 5], [60, 81], [19, 172], [96, 32], [11, -365], [89, 23], [46, -94], [-74, -258], [8, -220], [64, -118], [-50, -123], [-90, -26], [-133, 85], [62, -130], [-82, -88], [23, -251], [-70, -161], [83, -139], [-97, -80], [125, -187], [942, 460], [493, 255], [749, 337], [735, 342], [1027, 463], [1251, 539], [1349, 560], [1684, 671]], [[68914, 22457], [20, -269], [174, 29], [-99, 338], [-95, -98]], [[68290, 23143], [62, -57], [22, 205], [-84, -148]], [[63207, 16893], [34, -273], [63, -21], [-19, 246], [-78, 48]], [[63131, 17383], [115, -121], [-23, 124], [-92, -3]], [[62931, 17215], [183, -183], [-24, 205], [-134, 46], [-25, -68]], [[62774, 17559], [121, -235], [6, 63], [-127, 172]], [[62791, 17080], [85, 170], [-74, 18], [-11, -188]], [[62728, 16857], [189, -134], [70, 174], [69, -120], [17, 143], [-85, 38], [-90, 170], [-170, -271]], [[62735, 17769], [88, -67], [169, -299], [76, 96], [-160, 124], [32, 111], [-90, 22], [-107, 133], [-8, -120]], [[62419, 17032], [80, -64], [-1, 145], [-79, -81]], [[60864, 18223], [114, 93], [188, -53], [371, -286], [97, -7], [453, -451], [64, 74], [191, -186], [95, -207], [81, 31], [125, -111], [141, 251], [-65, 254], [-124, 266], [56, 211], [-91, 165], [-48, 239], [72, 45], [223, -260], [22, -178], [244, 329], [263, 103]], [[67974, 23591], [-46, 200], [6, 261], [-293, 143], [-1, 230], [-104, 261], [-50, 281], [-59, 147], [-26, 323], [23, 104], [-62, 172], [64, 97], [122, -6], [31, -179], [140, -232], [81, -61], [41, -296], [152, -460], [262, -249], [56, 117], [-10, -170], [55, -328], [131, -381], [24, -333], [68, 5], [113, -126], [3, -254], [73, -149], [116, -28], [12, 303], [-74, -12], [3, 511], [-108, 135], [-19, 179], [-69, 180], [35, 137], [-64, 140], [24, 82], [-93, 125], [-50, 170], [-56, 404], [-151, 600], [-76, 899], [77, 341], [-8, 193], [-187, 318], [-99, 879], [29, 265], [50, 158], [8, 338], [-101, 404], [-20, 455], [-79, 272], [-48, 559], [65, 299], [-25, 132], [67, 232], [-40, 130], [20, 158], [84, 206], [2, 211], [50, 201], [102, 179], [-11, 298], [-43, 363], [56, 470]], [[86724, 62866], [-293, 292], [-156, 271], [-186, 463], [-122, 454], [-82, 220], [-73, 434], [-10, 489], [18, 309], [-88, 217], [-139, 179], [-23, 332], [-119, 4], [-105, 85], [-85, -108], [-96, 142], [-44, 253], [87, 17], [5, 107], [-198, 277], [-40, 185], [-206, 258], [-81, -103], [-66, 150], [119, 41], [-12, 201], [-149, 218], [-35, 141], [-140, 51], [-122, 132], [-50, 165], [-46, -48], [-207, 361], [-65, -52], [-82, 123], [-29, -99], [-89, 30], [-10, 143], [128, 241], [-42, 287], [-178, 228], [-119, 103], [-24, -133], [-142, -94], [-84, 152], [99, 72], [108, 165], [-76, 241], [-151, 239], [-83, 62], [-70, 205], [43, 56]], [[23764, 3862], [1427, 529]], [[25159, 31686], [-900, -304], [-373, -158], [-328, -88], [-455, -160], [-1702, -617], [-1057, -414]], [[90152, 17663], [759, -342], [827, -305], [1230, -583]], [[68478, 81607], [101, 196], [44, 242], [-12, 424], [-71, 256], [53, -491], [-17, -291], [-98, -336]], [[67590, 81695], [275, -427], [-59, 263], [111, 185], [-101, 177], [-25, -152], [-188, 26], [-13, -72]], [[67119, 83759], [120, -47], [-63, 146], [-57, -99]], [[65722, 85543], [62, -82], [83, 194], [-59, 51], [-86, -163]], [[65368, 85634], [275, 84], [-133, 37], [-142, -121]], [[64997, 85816], [172, -79], [21, 53], [-186, 85], [-7, -59]], [[62472, 83979], [171, -172], [155, 9], [269, 254], [-98, 125], [-2, 132], [-151, 54], [-366, -331], [22, -71]], [[67220, 81272], [-116, 129], [-60, -15], [-109, 197], [-6, 124], [-83, 61], [27, 129], [-199, -36], [-70, 157], [45, 220], [123, 19], [89, -92], [-21, 196], [103, 140], [180, -70], [33, -303], [-18, -133], [162, -196], [17, -149], [218, 138], [-112, 123], [4, 112], [106, 44], [30, 197], [99, -57], [71, -279], [109, 68], [-17, 183], [-95, 14], [-75, 153], [156, -28], [-22, 99], [-245, 128], [134, 176], [76, -81], [-46, 200], [-161, -103], [-74, 190], [2, 326], [-61, 25], [-53, -278], [-73, 6], [-8, 300], [-252, 50], [128, 111], [3, 107], [-165, -144], [90, 178], [-81, 56], [95, 218], [139, 21], [85, 141], [50, 256], [248, -51], [122, 97], [11, -98], [151, 280], [72, -153], [182, 341], [56, 230], [123, -108], [49, 129], [-164, 72], [-11, 107], [113, -1], [-46, 177], [-80, -69], [-70, 237], [18, 228], [-153, -99], [-3, -127], [-71, -97], [-202, 478], [-103, 146], [130, -487], [63, -76], [-12, -177], [63, -85], [-14, -166], [-74, -68], [-51, 282], [-115, 20], [-156, -315], [-247, -113], [-70, -139], [-399, -64], [-78, 54], [-323, 507], [-309, 410], [-27, -164], [-86, -45], [23, -147], [-91, -318], [-93, -137], [-96, 280], [10, -251], [-81, -175], [-84, 218], [-95, -36], [-51, 77], [-86, -61], [22, 190], [-79, 156], [-22, 177], [-57, -15], [-30, 190], [-58, -36], [-142, 166], [-21, 208], [-109, -43], [10, -149], [-208, -310], [-74, 50], [-185, -53], [-72, -101], [-138, -9], [-157, -88], [-115, -185], [82, -55], [46, -194], [142, 200], [45, -79], [5, 224], [100, 49], [-32, -340], [-171, -197], [-4, -138], [-77, -14], [-55, 138], [-90, 52], [5, -135], [-66, 28], [78, -227], [-76, -126], [-196, 181], [-76, -258], [-67, 34], [-54, -383], [-185, 11], [39, -112], [4, -281], [-226, -36], [-222, 177], [-53, -18], [-1, -166], [50, -138], [46, 49], [-9, -195], [-114, -18], [-92, 81], [-66, -63], [-11, 133], [-261, 250], [-42, -104], [-122, 62], [65, 199], [128, 18], [-62, 103], [60, 201], [141, -78], [-57, 110], [47, 62], [-226, 36], [-178, 173], [-138, 40], [-571, -171], [-248, -125], [-406, -308], [-165, -97], [-285, -116], [-230, -6], [-98, 53], [-250, -14], [-515, 148], [-184, 182]], [[95592, 29215], [-93, 200], [-84, -312], [-51, -295], [-35, 41], [85, 503], [-94, 39], [2, 118], [-97, 21], [57, -491], [-9, -165], [95, -265]], [[95164, 29555], [-30, -368], [40, -17], [41, 273], [-51, 112]], [[94994, 30830], [25, -283], [79, 270], [-104, 13]], [[95301, 28498], [6, 151], [-60, 167], [-48, -240], [-205, -230], [57, 371], [-96, 31], [78, 62], [52, 269], [-66, 66], [75, 148], [34, 232], [-46, 423], [-221, 142], [-138, 179], [-206, 192], [-13, -50]]]
};
},{}],"data.csv":[function(require,module,exports) {
module.exports = "/data.7074662a.csv";
},{}],"map.js":[function(require,module,exports) {
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var regeneratorRuntime = require("regenerator-runtime");

var topology = require("./us-states.json");

var map, tooltip, hist_tooltip, info, focus, zoom, view, prevYear;
var width = 975,
    height = 610,
    focus = d3.select(null);
var projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]),
    path = d3.geoPath();

var data = require("./data.csv");

var smallest_year = 9999;
var largest_year = 0;
var allData = [];
var curData = [];
var year_to_data = {};
var filters = {
  race: [],
  location_state: [],
  gender: [],
  weapon_type: [],
  mental: [],
  age: [],
  legal: [],
  location: [],
  type: []
};
var selected_filters = {
  race: [],
  location_state: [],
  gender: [],
  weapon_type: [],
  mental: [],
  age: [],
  legal: [],
  location: [],
  type: []
};
var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

function parseData() {
  return _parseData.apply(this, arguments);
}

function _parseData() {
  _parseData = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return d3.csv(data,
            /*#__PURE__*/
            function () {
              var _ref = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee(row) {
                var state, weapons, rounded_age;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        allData.push(row);

                        if (year_to_data[row.year] === undefined) {
                          year_to_data[row.year] = [row];
                        } else {
                          year_to_data[row.year].push(row);
                        }

                        smallest_year = Math.min(smallest_year, parseInt(row.year));
                        largest_year = Math.max(largest_year, parseInt(row.year));

                        if (!filters.race.includes(row.race.trim())) {
                          filters.race.push(row.race.trim());
                        }

                        state = row.location.split(", ")[1];

                        if (!filters.location_state.includes(state)) {
                          filters.location_state.push(state);
                        }

                        if (!filters.gender.includes(row.gender)) {
                          filters.gender.push(row.gender);
                        }

                        weapons = row.weapon_type.split(";");
                        weapons.forEach(function (weapon) {
                          weapon = weapon.trim();

                          if (!filters.weapon_type.includes(weapon)) {
                            filters.weapon_type.push(weapon);
                          }
                        });

                        if (!filters.mental.includes(row.prior_signs_mental_health_issues)) {
                          filters.mental.push(row.prior_signs_mental_health_issues);
                        }

                        rounded_age = Math.floor(parseInt(row.age_of_shooter) / 10) * 10;
                        rounded_age = row.age_of_shooter == "Unclear" ? "Unknown" : rounded_age + "-" + Number(rounded_age + 9);

                        if (!filters.age.includes(rounded_age)) {
                          filters.age.push(rounded_age);
                        }

                        if (!filters.legal.includes(row.weapons_obtained_legally)) {
                          filters.legal.push(row.weapons_obtained_legally);
                        }

                        if (!filters.type.includes(row.type)) {
                          filters.type.push(row.type);
                        }

                        if (!filters.location.includes(row.location_type)) {
                          filters.location.push(row.location_type);
                        }

                      case 17:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2) {
                return _ref.apply(this, arguments);
              };
            }());

          case 2:
            Object.values(filters).forEach(function (v) {
              return v = v.sort();
            });

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _parseData.apply(this, arguments);
}

function filterData(data) {
  if (data === undefined) {
    return [];
  }

  var filteredData = data;
  filteredData = selected_filters.race.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.race.includes(row.race);
  }) : filteredData;
  filteredData = selected_filters.location_state.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.location_state.includes(row.location.split(", ")[1]);
  }) : filteredData;
  filteredData = selected_filters.gender.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.gender.includes(row.gender);
  }) : filteredData;
  filteredData = selected_filters.weapon_type.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.weapon_type.filter(function (val) {
      return row.weapon_type.split(";").map(function (s) {
        return s.trim();
      }).includes(val);
    }).length > 0;
  }) : filteredData;
  filteredData = selected_filters.mental.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.mental.includes(row.prior_signs_mental_health_issues);
  }) : filteredData;
  filteredData = selected_filters.age.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.age.includes("" + row.age_of_shooter.substring(0, 1));
  }) : filteredData;
  filteredData = selected_filters.legal.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.legal.includes(row.weapons_obtained_legally);
  }) : filteredData;
  filteredData = selected_filters.location.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.location.includes(row.location_type);
  }) : filteredData;
  filteredData = selected_filters.type.length > 0 ? filteredData.filter(function (row) {
    return selected_filters.type.includes(row.type);
  }) : filteredData;
  return filteredData;
}

function renderMap() {
  return _renderMap.apply(this, arguments);
}

function _renderMap() {
  _renderMap = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var data, _loop, j;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // Initialize svg object
            document.getElementById("map").innerHTML = "";
            data = filterData(curData);
            map = d3.select("#map").append("svg").attr("width", width).attr("height", height).attr("id", "map").append("g");
            tooltip = d3.select("#map").append("div").attr("class", "tooltip");
            zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
            view = map.append("rect").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all");
            map.call(zoom); // Adding usa border

            map.append("path").attr("class", "map").attr("d", path(topojson.feature(topology, topology.objects.nation))); // Adding state borders

            map.append("path").attr("class", "map").attr("d", path(topojson.feature(topology, topology.objects.states))); // adding lines to ambiguous States

            map.selectAll("path").selectAll("path").data(topojson.feature(topology, topology.objects.states).features).enter().append("line").attr("x1", "0").attr("x2", "100").attr("y1", "0").attr("y2", "100").attr("style", "stroke:rgb(255,0,0);stroke-width:2"); // Adding states names to display at the center

            map.append("text").attr("x", "100").attr("y", "520").attr("text-anchor", "middle").attr("font-size", "10px").attr("style", "font-family: Arial, Helvetica, sans-serif").text("Alaska");
            map.append("text").attr("x", "675.0748626338498").attr("y", "437").attr("text-anchor", "middle").attr("font-size", "10px").attr("style", "font-family: Arial, Helvetica, sans-serif").text("Alabama");
            map.selectAll("path").data(topojson.feature(topology, topology.objects.states).features).enter().append("text").attr("x", function (d) {
              // maually fixing display
              switch (d.properties.name) {
                case "Michigan":
                  return path.centroid(d)[0] + 20;

                case "Florida":
                  return path.centroid(d)[0] + 25;

                case "New Hampshire":
                  return path.centroid(d)[0] + 51;

                case "Connecticut":
                  return path.centroid(d)[0] + 45;

                case "Rhode Island":
                  return path.centroid(d)[0] + 35;

                case "District of Columbia":
                  return path.centroid(d)[0] + 85;

                case "Massachusetts":
                  return path.centroid(d)[0] + 49;

                case "Delaware":
                  return path.centroid(d)[0] + 50;

                case "New Jersey":
                  return path.centroid(d)[0] + 50;

                default:
                  return path.centroid(d)[0];
              }
            }).attr("y", function (d) {
              switch (d.properties.name) {
                case "Michigan":
                  return path.centroid(d)[1] + 25;

                case "Florida":
                  return path.centroid(d)[1] + 25;

                case "New Hampshire":
                  return path.centroid(d)[1] + 15;

                case "Connecticut":
                  return path.centroid(d)[1] + 30;

                case "Rhode Island":
                  return path.centroid(d)[1] + 20;

                case "District of Columbia":
                  return path.centroid(d)[1] + 40;

                case "Massachusetts":
                  return path.centroid(d)[1];

                case "Delaware":
                  return path.centroid(d)[1] + 15;

                case "New Jersey":
                  return path.centroid(d)[1] + 15;

                default:
                  return path.centroid(d)[1];
              }
            }).attr("text-anchor", "middle").attr("font-size", "9px").attr("style", "font-family: Arial, Helvetica, sans-serif").attr("fill", function (d) {
              if (d.properties.name == "Hawaii" || d.properties.name == "New Hampshire" || d.properties.name == "Rhode Island" || d.properties.name == "Connecticut" || d.properties.name == "District of Columbia" || d.properties.name == "New Jersey" || d.properties.name == "Massachusetts" || d.properties.name == "Delaware") {
                return "white";
              }
            }).attr("stroke", function (d) {
              if (d.properties.name == "Hawaii" || d.properties.name == "New Hampshire" || d.properties.name == "Rhode Island" || d.properties.name == "Connecticut" || d.properties.name == "District of Columbia" || d.properties.name == "New Jersey" || d.properties.name == "Massachusetts" || d.properties.name == "Delaware") {
                return "black";
              }
            }).attr("stroke-width", function (d) {
              if (d.properties.name == "New Hampshire" || d.properties.name == "Rhode Island" || d.properties.name == "Connecticut" || d.properties.name == "District of Columbia" || d.properties.name == "New Jersey" || d.properties.name == "Massachusetts" || d.properties.name == "Delaware") {
                return "0.2px";
              } else if (d.properties.name == "Hawaii") return "0.1px";
            }).text(function (d) {
              // Manually erasing states names that are hard to display
              return d.properties.name;
            });
            map.selectAll(".path").data(topojson.feature(topology, topology.objects.states).features).enter().append("line").attr("x1", function (d) {
              if (d.properties.name == "New Hampshire" || d.properties.name == "Rhode Island" || d.properties.name == "Connecticut" || d.properties.name == "District of Columbia" || d.properties.name == "New Jersey" || d.properties.name == "Massachusetts" || d.properties.name == "Delaware") {
                return path.centroid(d)[0];
              }

              return 0;
            }).attr("x2", function (d) {
              switch (d.properties.name) {
                case "New Hampshire":
                  return path.centroid(d)[0] + 15;

                case "Connecticut":
                  return path.centroid(d)[0] + 20;

                case "Rhode Island":
                  return path.centroid(d)[0] + 11;

                case "District of Columbia":
                  return path.centroid(d)[0] + 45;

                case "Massachusetts":
                  return path.centroid(d)[0] + 20;

                case "Delaware":
                  return path.centroid(d)[0] + 30;

                case "New Jersey":
                  return path.centroid(d)[0] + 25;

                default:
                  return 0;
              }
            }).attr("y1", function (d) {
              if (d.properties.name == "New Hampshire" || d.properties.name == "Rhode Island" || d.properties.name == "Connecticut" || d.properties.name == "District of Columbia" || d.properties.name == "New Jersey" || d.properties.name == "Massachusetts" || d.properties.name == "Delaware") {
                return path.centroid(d)[1];
              }

              return 0;
            }).attr("y2", function (d) {
              switch (d.properties.name) {
                case "New Hampshire":
                  return path.centroid(d)[1] + 10;

                case "Connecticut":
                  return path.centroid(d)[1] + 25;

                case "Rhode Island":
                  return path.centroid(d)[1] + 15;

                case "District of Columbia":
                  return path.centroid(d)[1] + 35;

                case "Massachusetts":
                  return path.centroid(d)[1] - 2;

                case "Delaware":
                  return path.centroid(d)[1] + 12;

                case "New Jersey":
                  return path.centroid(d)[1] + 10;

                default:
                  0;
              }
            }).attr("stroke", "yellow").attr("stroke-width", 1).attr("opacity", 0.8);

            _loop = function _loop(j) {
              var row = data[j];
              var coord = [row.longitude, row.latitude];
              var x = projection(coord)[0],
                  y = projection(coord)[1]; // Adding circles

              map.append("circle").attr("cx", x).attr("cy", y).attr("r", Math.sqrt(row.fatalities) * 2).attr("fill", "red").attr("stroke", "rgba(255, 0, 0, 0.5)").attr("stroke-width", "1%").attr("opacity", "0.8").attr("id", "point").on("mouseover", function () {
                d3.select(this).attr("opacity", 0.6);
                div.transition().duration(200).style("opacity", 0.9);
                div.html(row.case + "<br/>" + row.fatalities + " casualties").style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
              }).on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                div.transition().duration(500).style("opacity", 0);
              }).on("click", function () {
                openPanel(row);
              });
            };

            for (j = 0; j < data.length; j++) {
              _loop(j);
            }

          case 16:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _renderMap.apply(this, arguments);
}

function zoomed() {
  map.attr("transform", d3.event.transform);
}

function closePanel() {
  d3.select("#info").style("opacity", 0.6).transition().duration(300).style("opacity", 0).on("end", function () {
    d3.select("#info").html("");
  });
}

function victimCount(count, col) {
  var ret = "";

  for (var i = 0; i < count; i++) {
    ret += "<i class=material-icons style=font-size:14px;color:" + col + ";>person</i>";
  }

  return ret;
}

function openPanel(pointData) {
  closePanel();
  var fat = pointData.fatalities,
      inj = pointData.injured;
  var content = "<div class=info_panel><div class=title>" + pointData.case + "</div><br><div class=info>" + "<i class=material-icons style=font-size:14px;color:black;>location_on</i>  " + pointData.location + "<br><i class=material-icons style=font-size:14px;color:black;>date_range</i>  " + pointData.date + "</div><div class=stat-container>" + "<div class=stat><div class=cat>Fatalities<br><h6>" + fat + "</h6></div>" + "<div class=count>" + victimCount(fat, "darkred") + "</div></div>" + "<div class=stat><div class=cat>Injured<br><h6>" + inj + "</h6></div>" + "<stat class=count>" + victimCount(inj, "orangered") + "</div></div><div class=desc>" + pointData.summary + "<br><center><br><button id=wb class=btn>X</button></div>";
  d3.select("#info").html(content).style("opacity", 0).style("height", 0).transition().duration(700).style("opacity", 0.6).style("height", "auto");
  document.getElementById("wb").addEventListener("click", closePanel);
}

function initSlider() {
  return _initSlider.apply(this, arguments);
}

function _initSlider() {
  _initSlider = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var slider_label, slider, all_years;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            slider_label = document.getElementById("slider_year");
            slider = document.getElementById("slider");
            all_years = document.getElementById("all_years_button");
            all_years.addEventListener("click", function () {
              slider_label.innerText = "All years";
              curData = allData;
              document.getElementById("map").innerHTML = "";
              highlightYear("all");
              renderMap();
            });
            slider_label.innerText = "All years";
            slider.setAttribute("max", largest_year);
            slider.setAttribute("min", smallest_year);
            slider.addEventListener("change", function () {
              document.getElementById("slider_year").innerText = document.getElementById("slider").value;
              var currentYear = document.getElementById("slider").value;
              highlightYear(currentYear);
              var temp = year_to_data[currentYear];

              if (temp === undefined) {
                curData = [];
              }

              curData = temp;
              document.getElementById("map").innerHTML = "";
              renderMap();
            });

          case 8:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _initSlider.apply(this, arguments);
}

function initFilter() {
  return _initFilter.apply(this, arguments);
}

function _initFilter() {
  _initFilter = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var race_filter, location_state_filter, gender_filter, weapon_type_filter, mental_filter, age_filter, legal_filter, location_filter, type_filter;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            race_filter = document.getElementById("select_race");
            filters.race.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              race_filter.appendChild(option);
            });
            race_filter.addEventListener("change", function () {
              selected_filters.race = $(this).val();
              renderMap();
              initHistogram();
            });
            location_state_filter = document.getElementById("select_state");
            filters.location_state.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              location_state_filter.appendChild(option);
            });
            location_state_filter.addEventListener("change", function () {
              selected_filters.location_state = $(this).val();
              renderMap();
              initHistogram();
            });
            gender_filter = document.getElementById("select_gender");
            filters.gender.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              gender_filter.appendChild(option);
            });
            gender_filter.addEventListener("change", function () {
              selected_filters.gender = $(this).val();
              renderMap();
              initHistogram();
            });
            weapon_type_filter = document.getElementById("select_weapon");
            filters.weapon_type.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              weapon_type_filter.appendChild(option);
            });
            weapon_type_filter.addEventListener("change", function () {
              selected_filters.weapon_type = $(this).val();
              renderMap();
              initHistogram();
            });
            mental_filter = document.getElementById("select_mental");
            filters.mental.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              mental_filter.appendChild(option);
            });
            mental_filter.addEventListener("change", function () {
              selected_filters.mental = $(this).val();
              renderMap();
              initHistogram();
            });
            age_filter = document.getElementById("select_age");
            filters.age.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element.substring(0, 1));
              option.innerText = "" + element;
              age_filter.appendChild(option);
            });
            age_filter.addEventListener("change", function () {
              selected_filters.age = $(this).val();
              renderMap();
              initHistogram();
            });
            legal_filter = document.getElementById("select_legal");
            filters.legal.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              legal_filter.appendChild(option);
            });
            legal_filter.addEventListener("change", function () {
              selected_filters.legal = $(this).val();
              renderMap();
              initHistogram();
            });
            location_filter = document.getElementById("select_location");
            filters.location.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              location_filter.appendChild(option);
            });
            location_filter.addEventListener("change", function () {
              selected_filters.location = $(this).val();
              renderMap();
              initHistogram();
            });
            type_filter = document.getElementById("select_type");
            filters.type.forEach(function (element) {
              var option = document.createElement("option");
              option.setAttribute("value", element);
              option.innerText = element;
              type_filter.appendChild(option);
            });
            type_filter.addEventListener("change", function () {
              selected_filters.type = $(this).val();
              renderMap();
              initHistogram();
            });
            document.getElementById("filter_reset").addEventListener("click", function () {
              $(".selectpicker").val("default");
              $(".selectpicker").selectpicker("refresh");
              selected_filters = {
                race: [],
                location_state: [],
                gender: [],
                weapon_type: [],
                mental: [],
                age: [],
                legal: [],
                location: [],
                type: []
              };
              renderMap();
              initHistogram();
            });
            $(".selectpicker").selectpicker("refresh");

          case 29:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _initFilter.apply(this, arguments);
}

function initHistogram() {
  return _initHistogram.apply(this, arguments);
}

function _initHistogram() {
  _initHistogram = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    var currentWidth, h, w, xscale, yscale, graph, filtered_year_data, dx, _loop2, i, event;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            // get current width of the slider div
            document.getElementById("histogram").innerHTML = "";
            currentWidth = parseInt(d3.select("#slider").style("width"), 10);
            h = 75, w = currentWidth, xscale = w / 39, yscale = 6;
            graph = d3.select("#histogram").append("svg").attr("height", h).attr("width", w).attr("id", "svg-histogram");
            hist_tooltip = d3.select("#histogram").append("div").attr("class", "tooltip");
            filtered_year_data = get_year_to_data();
            dx = 0;

            _loop2 = function _loop2(i) {
              var value = filtered_year_data[i] === undefined ? 0 : filtered_year_data[i].length;
              var dy = h - value * yscale;
              graph.append("rect").attr("height", value * yscale).attr("width", xscale).attr("x", dx).attr("y", dy).attr("id", "y_" + i).style("stroke", "black").on("mouseover", function () {
                var x = d3.select(this).attr("x"),
                    y = d3.select(this).attr("y") - 20;
                hist_tooltip.html("<b>" + i + ":</b> " + filtered_year_data[i].length + " shootings ").style("left", x + "px").style("top", y + "px").style("opacity", 1);
              }).on("mouseout", function () {
                hist_tooltip.html("").style("opacity", 0);
              }).on("click", function () {
                var event = new Event("change");
                document.getElementById("slider").value = i;
                document.getElementById("slider").dispatchEvent(event);
              });
              dx += xscale + 1;
            };

            for (i = 1982; i < 2020; i++) {
              _loop2(i);
            }

            window.addEventListener("resize", resizeHisto);
            highlightYear("all");

            if (document.getElementById("slider_year").innerText !== "All Years") {
              event = new Event("change");
              document.getElementById("slider").dispatchEvent(event);
            }

          case 12:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _initHistogram.apply(this, arguments);
}

function highlightYear(_x) {
  return _highlightYear.apply(this, arguments);
}

function _highlightYear() {
  _highlightYear = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7(year) {
    var highlight, def, i, _i;

    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            highlight = {
              color: "steelblue",
              opacity: 1
            };
            def = {
              color: "lightgray",
              opacity: 0.4
            };

            if (year === "all") {
              for (i = 1982; i < 2020; i++) {
                d3.select("#y_" + i).style("fill", highlight.color).style("opacity", highlight.opacity);
              }
            } else if (prevYear === "all") {
              for (_i = 1982; _i < 2020; _i++) {
                if (String(_i) !== year) {
                  d3.select("#y_" + _i).style("fill", def.color).style("opacity", def.opacity);
                }
              }
            } else {
              d3.select("#y_" + prevYear).style("fill", def.color).style("opacity", def.opacity);
              d3.select("#y_" + year).style("fill", highlight.color).style("opacity", highlight.opacity);
            }

            prevYear = year;

          case 4:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _highlightYear.apply(this, arguments);
}

function init() {
  return _init.apply(this, arguments);
}

function _init() {
  _init = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8() {
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return parseData();

          case 2:
            curData = allData;
            _context8.next = 5;
            return renderMap();

          case 5:
            _context8.next = 7;
            return initHistogram();

          case 7:
            _context8.next = 9;
            return initSlider();

          case 9:
            _context8.next = 11;
            return initFilter();

          case 11:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _init.apply(this, arguments);
}

function get_year_to_data() {
  // this just filters it
  var data = filterData(allData);
  var ret = [];

  for (var i = 0; i < data.length; i++) {
    if (ret[data[i].year] === undefined) {
      ret[data[i].year] = [data[i]];
    } else {
      ret[data[i].year].push(data[i]);
    }
  }

  return ret;
} // resize function for histogram


function resizeHisto() {
  var currentWidth = parseInt(d3.select("#slider").style("width"), 10);
  var w = currentWidth,
      xscale = w / 40;
  var graph = d3.select("#histogram").attr("width", w);
  var svg = d3.select("#svg-histogram").attr("width", w);
  var histo = d3.select("#svg-histogram").selectAll("rect").attr("width", xscale);
  histo.selectAll("rect").each(function (d, i) {
    d3.select(this).attr("x", xscale * i);
  });
}

init();
},{"regenerator-runtime":"../node_modules/regenerator-runtime/runtime.js","./us-states.json":"us-states.json","./data.csv":"data.csv"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "61222" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","map.js"], null)
//# sourceMappingURL=/map.27237bf4.js.map