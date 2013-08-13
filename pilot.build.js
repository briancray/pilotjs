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

define('pilot/model', [], function () {
"use strict";

var extend = pilot.extend;
var j = JSON;
var fromJSON = j.parse;
var toJSON = j.stringify;
var allData = {};

function Model () {}

Model.prototype = {
    init: function (id, initial) {
        if (typeof id === 'string') {
            this.id = id;
            if (allData[id]) {
                this.synced = true;
                this.data = allData[id];
            }
            else {
                this.synced = false;
                this.data = allData[id] = initial || {};
                this.sync();
            }
        }
        else {
            this.data = id || {};
        }
        return this;
    },
    set: function (key, value) {
        if (typeof key === 'string') {
            this.data[key] = value;
        }
        else {
            extend(this.data, key);
        }
        this.sync();
        return this;
    },
    get: function (key, defaultValue) {
        var keys, currentKey, currentValue;
        if (!key || typeof key !== 'string') {
            return this.data;
        }
        else if (key.indexOf('.') === -1) {
            return this.data[key];
        }
        keys = key.split('.'),
        currentKey = keys[x],
        currentValue = this.data;
        for (var x = 0, xl = keys.length; x < xl; currentKey = keys[++x]) {
            currentValue = currentValue[currentKey];
            if (typeof currentValue === 'undefined') {
                return defaultValue;
            }
        }
        return currentValue;
    },
    remove: function (key) {
        key && typeof key === 'string' ? (delete this.data[key]) : (this.data = {});
        this.sync();
        return this;
    },
    destroy: function () {
        this.data = null;
        this.sync();
    },
    sync: function () {
        var data;
        if (!this.id) {
            return;
        }
        else if (this.synced) {
            if (this.data) {
                localStorage.setItem('data.' + this.id, toJSON(this.data));
                allData[this.id] = this.data;
            }
            else {
                localStorage.removeItem('data.' + this.id);
                delete allData[this.id];
            }
        }
        else {
            data = localStorage.getItem('data' + this.id);
            data ? (this.data = allData[this.id] = fromJSON(data) || {}) : (this.data = allData[this.data] = {});
            this.synced = true;
        }
    }
};

return Model;

});

define('pilot/pubsub', [], function () {
"use strict";

var arrSlice = Array.prototype.slice;
var instances = {};
var dateNow = Date.now;

function Pubsub () {}

Pubsub.prototype = {
    init: function (id) {
        this.id = typeof id === 'string' ? id : pilot.generateId('pubsub');
        this.handlers = {};
        return instances[this.id] = this;
    },
    on: function (e, handler, retain) {
        retain = typeof retain === 'undefined' ? true : retain;
        var handlers = this.handlers[e] || (this.handlers[e] = []);
        handlers.push({handler: handler, retain: retain});
        return this;
    },
    one: function (e, handler) {
        return this.on(e, handler, false);
    },
    off: function (e) {
        if (e && typeof e === 'string') {
            this.handlers[e] = [];
        }
        else if (typeof e === 'undefined') {
            this.handlers = {};
        }
        return this;
    },
    trigger: function (e) {
        var handlers, args, nsIndex;
        if ((nsIndex = e.indexOf('.local')) !== -1) {
            args = arrSlice.call(arguments, 1);
            e = e.slice(0, nsIndex);
            handlers = this.handlers[e];
            if (handlers && handlers.length) {
                this.handlers[e] = handlers.filter(function (h) {
                    return h.handler.apply(null, args), h.retain;
                });
            }
        }
        else {
            args = arrSlice.call(arguments, 0);
            Pubsub.trigger.apply(null, args);
        }
        return this;
    },
    destroy: function (e) {
        instances[this.id] = null;
    }
};

Pubsub.trigger = function () {
    var args, id;
    args = arrSlice.call(arguments, 0);
    args[0] = args[0] + '.local';
    for (id in instances) {
        instances.hasOwnProperty(id) && instances[id].trigger.apply(instances[id], args);
    }
};

return Pubsub;

});

define('pilot/view', ['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arrForEach = Array.prototype.forEach;
var instances = [];

function View () {}

View.prototype = {
    init: function (el, params) {
        instances.push(this);
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
        this.params = params;
        this.events = new pubsub().init(this.id);
        this.settings = new model().init(this.id);
        this.render();
        View.load(this.el, params);
        return this;
    },
    render: function () {
        this.el.innerHTML = '';
    },
    destroy: function () {
        this.events.destroy();
    }
};

View.load = function (context, params) {
    context = context || 'body';
    context = typeof context === 'string' ? doc.querySelector(context) : context;
    params = typeof params === 'object' ? params : {};
    var urlParams = {};
    window.location.search.slice(1).split('&').forEach(function (param) {
        var keyVal = param.split('=');
        urlParams[decodeURIComponent(keyVal[0])] = decodeURIComponent(keyVal.slice(1).join(''));
    });
    params = pilot.extend(urlParams, params);
    arrForEach.call(context.getElementsByClassName('view'), function (elView) {
        var dataView = elView.getAttribute('data-view') || '';
        dataView && require([dataView.split('.')[0]], function (viewModule) {
            new viewModule().init(elView, params);
        });
    });
};

View.unload = function (context) {
    context = context || 'body';
    context = typeof context === 'string' ? doc.querySelector(context) : context;
    instances = instances.filter(function (instance) {
        if (context.contains(instance.el)) {
            instance.destroy();
            return false;
        }
        return true;
    });
};

return View;

});

