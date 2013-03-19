;(function (global, undefined) {
"use strict";

var doc = document;
var el_head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var node = (function (scripts) {
    return scripts[scripts.length - 1];
})(doc.getElementsByTagName('script'));
var main = node.getAttribute('data-main');
var anonymous_queue = [];
var settings = {
    baseUrl: (function (href) {
        var place = href.split('/').slice(0, 3).join('/');
        var path;
        if (main) {
            if (main.slice(0, place.length) === place) {
                path = main;
            }
            else if (main[0] === '/') {
                path = place + main;
            }
            else {
                path = href.slice(0, href.lastIndexOf('/') + 1) + main;
            }
            main = main.slice(main.lastIndexOf('/') + 1);
        }
        else {
            path = href;
        }
        return path.slice(0, path.lastIndexOf('/') + 1);
    })(global.location.href.split('?')[0])
};
var exports = {};

function config (config) {
    extend(settings, config);
};

function define (id, dependencies, factory) {
    var arg_count = arguments.length;

    if (arg_count === 1) {
        factory = id;
        dependencies = ['require', 'exports', 'module'];
        id = null;
    }
    else if (arg_count === 2) {
        if (pilot.toString.call(id) === '[object Array]') {
            factory = dependencies;
            dependencies = id;
            id = null;
        }
        else {
            factory = dependencies;
            dependencies = ['require', 'exports', 'module'];
        }
    }
    else if (!dependencies.length) {
        dependencies = ['require', 'exports', 'module'];
    }

    if (!id) {
        anonymous_queue.push([dependencies, factory]);
        return;
    }

    function ready () {
        var handlers = exports[id].handlers;
        var context = exports[id].context;
        var module = exports[id] = typeof factory === 'function' ? factory.apply(null, anonymous_queue.slice.call(arguments, 0)) || exports[id] : factory;
        module.pilot = 2;
        module.context = context;
        for (var x = 0, xl = handlers.length; x < xl; x++) {
            handlers[x](module);
        }
    };

    require(dependencies, ready, id);
};

define.amd = {};

function require (module, callback, context) {
    var loaded_modules = [];

    if (pilot.toString.call(module) === '[object Array]') {
        for (var x = 0, xl = module.length; x < xl; x++) {
            switch (module[x]) {
                case 'require':
                    var _require = function (new_module, callback) {
                        return require(new_module, callback, context);
                    };
                    _require.toUrl = toUrl;
                    loaded_modules[x] = _require;
                    break;
                case 'exports':
                    loaded_modules[x] = exports[context];
                    break;
                case 'module':
                    loaded_modules[x] = {
                        id: context,
                        uri: toUrl(context)
                    };
                    break;
                case exports[context] ? exports[context].context : '':
                    loaded_modules[x] = exports[exports[context].context];
                    break;
                default:
                    (function (x) {
                        require(module[x], function (def) {
                            loaded_modules[x] = def;
                            loaded_modules.length === module.length && callback && callback.apply(null, loaded_modules);
                        }, context);
                    })(x);
            };
        }
        if (loaded_modules.length === xl && callback) {
            callback.apply(null, loaded_modules);
        }
        return;
    }

    module = context ? toUrl(module, context) : module;
     
    if (exports[module]) {
        if (exports[module].pilot === 1) {
            callback && exports[module].handlers.push(callback);
        }
        else {
            callback && callback(exports[module]);
        }
        return exports[module];
    }
    else {
        exports[module] = {
            pilot: 1,
            handlers: [callback],
            context: context
        };
    }
    
    inject(toUrl(module), function () {
        var queue_item;
        if (queue_item = anonymous_queue.shift()) {
            queue_item.unshift(module);
            exports[module].pilot === 1 && define.apply(null, queue_item);
        }
    });
};

var toUrl = require.toUrl = function (id, context) {
    var new_context, i;
    switch (id) {
        case 'require':
        case 'exports':
        case 'module':
            return id;
    }
    new_context = (context || settings.baseUrl).split('/');
    new_context.pop();
    id = id.split('/');
    i = id.length;
    while (--i) {
        switch (id[0]) {
            case '..':
                new_context.pop();
                id.shift();
                break;
            case '.':
            case '':
                id.shift();
        }
    }
    return (new_context.length ? new_context.join('/') + '/' : '') + id.join('/') + (context === undefined && !/\.[a-z]{1,3}$/.test(id[id.length - 1]) ? '.js' : '');
};

function inject (file, callback) {
    var script = doc.createElement('script');
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            script.onload = script.onreadystatechange = null;
            el_head.removeChild(script);
            callback && callback();
        }
    };
    script.type = 'text/javascript';
    script.async = true;
    script.src = file;
    el_head.appendChild(script);
};

function extend (target, source) {
    for (var x in source) {
        source.hasOwnProperty(x) && (target[x] = source[x]);
    }
    return target;
};

function get_type (v) {
    return pilot.toString.call(v).slice(8, -1);
};

global.pilot = {
    config: config,
    inject: inject,
    define: global.define = define,
    require: global.require = require,
    exports: exports,
    extend: extend,
    get_type: get_type
};

main && require(main);

})(this);
