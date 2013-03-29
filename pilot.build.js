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

define.amd = {
    jQuery: true
};

function require (modules, callback, context) {
    var loaded_modules = [];

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
                var _require = function (new_module, callback) {
                    return require(new_module, callback, context);
                };
                _require.toUrl = function (module) {
                    return toUrl(module, context);
                };
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
                    load(modules[x], function (def) {
                        loaded_modules[x] = def;
                        loaded_modules.length === xl && callback && callback.apply(null, loaded_modules);
                    }, context);
                })(x);
        };
    }
    loaded_modules.length === xl && callback && callback.apply(null, loaded_modules);
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
    }
    else {
        exports[module] = {
            pilot: 1,
            handlers: [callback],
            context: context
        };
    }
    
    inject(toUrl(module) + '.js', function () {
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
    return (new_context.length ? new_context.join('/') + '/' : '') + id.join('/');
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

global.pilot = {
    config: config,
    inject: inject,
    define: global.define = define,
    require: global.require = require,
    exports: exports,
    get_type: get_type,
    extend: extend
};

main && require(main);

})(this);

define('lib/data', function () {
"use strict";

var extend = pilot.extend;
var JSON = JSON;
var fromJSON = JSON.parse;
var toJSON = JSON.stringify;
var all_data = {};

function data (name, initial) {
    if (!(this instanceof data)) {
        return new data(name, initial);
    }
    else if (typeof name === 'string') {
        this.name = name;
        if (all_data[name]) {
            this.synced = true;
            this.data = all_data[name];
        }
        else {
            this.synced = false;
            this.data = all_data[name] = initial || {};
            this.sync();
        }
    }
    else {
        this.data = name || {};
    }
    return this;
};

data.prototype = {
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
    get: function (key, default_value) {
        var keys, current_key, current_value;
        if (!key || key.indexOf('.') === -1) {
            return key ? this.data[key] : this.data;
        }
        keys = key.split('.'),
        current_key = keys[x],
        current_value = this.data;
        for (var x = 0, xl = keys.length; x < xl; current_key = keys[++x]) {                                                                                                                         
            current_value = current_value[current_key];
            if (!current_value) {
                return default_value;
            }
        }
        return current_value;
    },
    remove: function (key) {
        key ? (delete this.data[key]) : (this.data = {});
        this.sync();
        return this;
    },
    destroy: function () {
        this.data = null;
        this.sync();
    },
    sync: function () {
        var data;
        if (!this.name) {
            return;
        }
        else if (this.synced) {
            if (this.data) {
                localStorage.setItem('data.' + this.name, toJSON(this.data));
                all_data[this.name] = this.data;
            }
            else {
                localStorage.removeItem('data.' + this.name);
                delete all_data[this.name];
            }
        }
        else {
            data = localStorage.getItem('data' + this.name);
            data ? (this.data = all_data[this.name] = fromJSON(data) || {}) : (this.data = all_data[this.data] = {});
            this.synced = true;
        }
    }
};

return data;

});

define('lib/pubsub', function () {
"use strict";

var arr_slice = Array.prototype.slice;
var handlers = {};

var pubsub = {
    on: function (e, handler) {
        var event_info, event_name, event_namespace;
        if (!e || !handler) {
            return pubsub;
        }
        event_info = e.split('.');
        event_name = event_info[0];
        event_namespace = event_info[1];
        event_name && (handlers[event_name] = handlers[event_name] || []).push({handler: handler, retain: true, namespace: event_namespace});
        return pubsub;
    },
    one: function (e, handler) {
        var event_info, event_name, event_namespace;
        if (!e || !handler) {
            return pubsub;
        }
        event_info = e.split('.');
        event_name = event_info[0];
        event_namespace = event_info[1];
        event_name && (handlers[event_name] = handlers[event_name] || []).push({handler: handler, retain: false, namespace: event_namespace});
        return pubsub;
    },
    off: function (e) {
        var event_info, event_name, event_namespace;
        if (!e) {
            handlers = {};
            return pubsub;
        }
        event_info = e.split('.');
        event_name = event_info[0];
        event_namespace = event_info[1];
        function clear_namespace (h) {
            return h.namespace !== event_namespace;
        }
        if (event_name) {
            if (!event_namespace) {
                handlers[event_name] = null;
            }
            else {
                handlers[event_name] = (handlers[event_name] || []).filter(clear_namespace);
            }
        }
        else {
            for (var x in handlers) {
                handlers.hasOwnProperty(x) && (handlers[x] = (handlers[x] || []).filter(clear_namespace));
            }
        }
        return pubsub;
    },
    trigger: function (event_name) {
        var args;
        if (!e) {
            return pubsub;
        }
        args = arr_slice.call(arguments, 1);
        handlers[event_name] = (handlers[event_name] || []).filter(function (h) {
            return h.handler.apply(null, args), h.retain;
        });
        return pubsub;
    }
};

return pubsub;

});

define('lib/router', function () {

var global = window;
var loc = global.location;
var root = loc.protocol + '//' + loc.host + '/';
var history = global.history;
var get_type = pilot.get_type;
var routes;
var parser = {
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    query_parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
};

function route_click (e) {
    var el = e.target;
    var href = el.href;
    var bypass;
    if (el.tagName === 'A' && href && href.indexOf('#') !== 0) {
        bypass = el.getAttribute('data-bypass');
        if (href.slice(0, root.length) === root) {
            if ((bypass && bypass === 'true') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.alKey) {
                return;
            }
            e.preventDefault();
            router.run(href);
            history.pushState(parse(href), null, href);
        }
    }
}

function route_loc () {
    router.run(loc.href);
}

if (history && history.pushState) {
    global.onpopstate = route_loc;
    document.addEventListener('click', route_click);
}

var router = {
    add: function (route) {
        if (get_type(route) === 'array') {
            routes = routes.push.apply(route);
        }
        else {
            routes.push(route);
        }
        return router;
    },
    get: function (url) {
        var uri = router.parse(url);
        var route = routes.filter(function (route) {
            return route.route && route.route.test(uri.path);
        })[0];
        var matches;
        if (route) {
            route.params = uri.params;
            matches = uri.path.match(route.route).slice(1);
            if (matches && matches.length && route.matches.length) {
                matches.forEach(function (match) {
                    route.params[route.matches[match]] = decodeURIComponent(matches[match]);
                });
            }
        }
        return route;
    },
    run: function (url) {
        var route = router.get(url);
        if (route) {
            route.callback(route.params, route);
        }
        return router;
    },
    parse: function (str) {
        var parser_key = parser.key;
        var matches = parser.uri_parser.exec(str);
        var uri = {
            params: {}
        };
        var i = 14;
        while (i--) {
            uri[parser_key[i]] = matches[i] || '';
        }
        uri[parser_key[12]].replace(parser.query_parser, function (a, b, c) {
            b && (uri.params[b] = decodeURIComponent(c));
        });
        return uri;
    }
};

return router;

});

define('lib/jsonp', function () {
"use strict";

var global = window;
var pilot = pilot;
var inject = pilot.inject;
var extend = pilot.extend;
var encode = global.encodeURIComponent;
var random = Math.random;
var cache = {};

function noop () {}

function jsonp (options, callback) {
    if (!(this instanceof jsonp)) {
        return new jsonp(options, callback);
    }
    else if (typeof options === 'string') {
        options = {
            url: options,
            success: callback
        };
    }
    this.options = extend(options, jsonp.defaults);
    this.call();
    return this;
};

jsonp.prototype = {
    create_url: function () {
        var url = this.options.url;
        this.stringify_data();
        this.request_url = url + (this.url_params ? (url.indexOf('?') === -1 ? '?' : '&') + this.url_params : '');
        return this;
    },
    create_callback: function () {
        var url = this.request_url;
        this.call_timestamp = Date.now()
        this.callback_name = 'jsonp_' + this.call_timestamp + '_' + Math.floor(random() * 999);
        global[this.callback_name] = function (d) {
            var call_cache = cache[this.request_url];
            global.clearTimeout(call_cache.timeout);
            call_cache.data = cache[this.request_url].cache && d;
            call_cache.success.filter(function (handler) {
                return handler(d), false;
            });
            call_cache.error = [];
            global[this.callback_name] = null;
        };
        this.full_url = url + (url.indexOf('?') === -1 ? '?' : '&') + this.options.callback_param + '=' + this.callback_name;
        return this;
    },
    stringify_data: function () {
        var params, data;
        if (!this.options.data) {
            return '';
        }
        params = [];
        data = this.options.data || {};
        for (var x in data) {
            data.hasOwnProperty(x) && (data.push(encode(x) + '=' + encode(data[x])));
        }
        this.url_params = data.join('&');
        return this;
    },
    call: function () {
        var call_cache, cached_data, cached_success;
        this.create_url();
        call_cache = cache[this.request_url];
        if ((cached_success = call_cache.success).length) {
            cached_success.push(this.success);
            call_cache.errors.push(this.error);
            return;
        }
        else if (cached_data = call_cache.data) {
            this.success(cached_data);
            return;
        }
        this.create_callback();
        call_cache = cache[this.request_url] = {
            success: [this.success],
            error: [this.error],
            cache: this.options.cache,
            callback: this.callback_name
        };
        inject(this.full_url);
        call_cache.timeout = global.setTimeout(function () {
            var callback_name = call_cache.callback;
            call_cache.error.filter(function (handler) {
                return handler(d), false;
            });
            call_cache.success = [];
            global[callback_name] = null;
        }, this.options.timeout);
    }
};

jsonp.defaults = {
    url: '',
    callback_param: 'callback',
    success: noop,
    error: noop,
    data: null,
    timeout: 5000,
    cache: true
};

return jsonp;

});

