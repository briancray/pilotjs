;(function (global, undefined) {
"use strict";

var doc = document;
var elHead = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var node = (function (scripts) {
    return scripts[scripts.length - 1];
})(doc.getElementsByTagName('script'));
var main = node.getAttribute('data-main');
var anonymousQueue = [];
var arrSlice = anonymousQueue.slice;
var arrForEach = anonymousQueue.forEach;
var settings = {
    baseUrl: (function (loc) {
        var place = loc.protocol + '//' + loc.host + '/';
        var path;
        if (main) {
            if (main.slice(0, place.length) === place) {
                path = main;
            }
            else {
                path = place + main;
            }
            main = main.slice(main.lastIndexOf('/') + 1);
        }
        else {
            path = place;
        }
        return path.slice(0, path.lastIndexOf('/') + 1);
    })(global.location),
    viewsPath: 'views/',
    viewContext: doc.body || doc.getElementsByTagName('body')[0] || doc.documentElement
};
var exports = {};

function config (config) {
    return typeof config === 'string' ? settings[config] : extend(settings, config);
}

function define (id, dependencies, factory) {
    var argCount = arguments.length;

    if (argCount === 1) {
        factory = id;
        dependencies = ['require', 'exports', 'module'];
        id = null;
    }
    else if (argCount === 2) {
        if (settings.toString.call(id) === '[object Array]') {
            factory = dependencies;
            dependencies = id;
            id = null;
        }
        else {
            factory = dependencies;
            dependencies = ['require', 'exports', 'module'];
        }
    }

    if (!id) {
        anonymousQueue.push([dependencies, factory]);
        return;
    }

    function ready () {
        var handlers, context, module;
        if (exports[id]) {
            handlers = exports[id].handlers;
            context = exports[id].context;
        }
        module = exports[id] = typeof factory === 'function' ? factory.apply(null, anonymousQueue.slice.call(arguments, 0)) || exports[id] || {} : factory;
        module.pilot = 2;
        module.context = context;
        for (var x = 0, xl = handlers ? handlers.length : 0; x < xl; x++) {
            handlers[x](module);
        }
    };

    require(dependencies, ready, id);
}

define.amd = {
    jQuery: true
};

function require (modules, callback, context) {
    var loadedModules = [], loadedCount = 0, hasLoaded = false;

    if (typeof modules === 'string') {
        if (exports[modules] && exports[modules].pilot === 2) {
            return exports[modules];
        }
        throw new Error(modules + ' has not been defined. Please include it as a dependency in ' + context + '\'s define()');
        return;
    }

    for (var x = 0, xl = modules.length; x < xl; x++) {
        switch (modules[x]) {
            case 'require':
                var _require = function (newModule, callback) {
                    return require(newModule, callback, context);
                };
                _require.toUrl = function (module) {
                    return toUrl(module, context);
                };
                loadedModules[x] = _require;
                loadedCount++;
                break;
            case 'exports':
                loadedModules[x] = exports[context] || (exports[context] = {});
                loadedCount++;
                break;
            case 'module':
                loadedModules[x] = {
                    id: context,
                    uri: toUrl(context)
                };
                loadedCount++;
                break;
            case exports[context] ? exports[context].context : '':
                loadedModules[x] = exports[exports[context].context];
                loadedCount++;
                break;
            default:
                (function (x) {
                    load(modules[x], function (def) {
                        loadedModules[x] = def;
                        loadedCount++;
                        loadedCount === xl && callback && (hasLoaded = true, callback.apply(null, loadedModules));
                    }, context);
                })(x);
        };
    }
    !hasLoaded && loadedCount === xl && callback && callback.apply(null, loadedModules);
}

function load (module, callback, context) {
    module = context ? toUrl(module, context) : module;

    if (exports[module]) {
        if (exports[module].pilot === 1) {
            callback && exports[module].handlers.push(callback);
        }
        else {
            callback && callback(exports[module]);
        }
        return;
    }
    else {
        exports[module] = {
            pilot: 1,
            handlers: [callback],
            context: context
        };
    }

    inject(toUrl(module) + '.js', function () {
        var queueItem;
        if (queueItem = anonymousQueue.shift()) {
            queueItem.unshift(module);
            exports[module].pilot === 1 && define.apply(null, queueItem);
        }
    });
}

var toUrl = require.toUrl = function (id, context) {
    var newContext, i, changed;
    switch (id) {
        case 'require':
        case 'exports':
        case 'module':
            return id;
    }
    newContext = (context || settings.baseUrl).split('/');
    newContext.pop();
    id = id.split('/');
    i = id.length;
    while (--i) {
        switch (id[0]) {
            case '..':
                newContext.pop();
            case '.':
            case '':
                id.shift();
                changed = true;
        }
    }
    return (newContext.length && changed ? newContext.join('/') + '/' : '') + id.join('/');
};

function inject (file, callback) {
    var script = doc.createElement('script');
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            script.onload = script.onreadystatechange = null;
            elHead.removeChild(script);
            callback && callback();
        }
    };
    script.type = 'text/javascript';
    script.async = true;
    script.src = file;
    elHead.appendChild(script);
}

function extend (target, source) {
    var sources = arrSlice.call(arguments, 1);
    var l = sources.length;
    while (l-- > -1) {
        for (var x in sources[l]) {
            sources[l].hasOwnProperty(x) && (target[x] = sources[l][x]);
        }
    }
    return target;
}

function getType (v) {
    return pilot.toString.call(v).slice(8, -1);
}

function generateId (prefix) {
    return (prefix || 'instance') + '_' + Date.now() + '.' + (Math.floor(Math.random() * 900000) + 100000);
}

global.pilot = {
    config: config,
    inject: inject,
    define: global.define = define,
    require: global.require = require,
    exports: exports,
    getType: getType,
    extend: extend,
    generateId: generateId
};

main && require([main]);

})(window);
