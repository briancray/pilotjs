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
    return typeof config === 'string' ? settings.config : extend(settings, config);
}

function define (id, dependencies, factory) {
    var arg_count = arguments.length;

    if (arg_count === 1) {
        factory = id;
        dependencies = ['require', 'exports', 'module'];
        id = null;
    }
    else if (arg_count === 2) {
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
        anonymous_queue.push([dependencies, factory]);
        return;
    }

    function ready () {
        var handlers, context, module;
        if (exports[id]) {
            handlers = exports[id].handlers;
            context = exports[id].context;
        }
        module = exports[id] = typeof factory === 'function' ? factory.apply(null, anonymous_queue.slice.call(arguments, 0)) || exports[id] || {} : factory;
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
    var loaded_modules = [], loaded_count = 0, has_loaded = false;

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
                loaded_count++;
                break;
            case 'exports':
                loaded_modules[x] = exports[context] || (exports[context] = {});
                loaded_count++;
                break;
            case 'module':
                loaded_modules[x] = { 
                    id: context,
                    uri: toUrl(context)
                };  
                loaded_count++;
                break;
            case exports[context] ? exports[context].context : '':
                loaded_modules[x] = exports[exports[context].context];
                loaded_count++;
                break;
            default:
                (function (x) {
                    load(modules[x], function (def) {
                        loaded_modules[x] = def;
                        loaded_count++;
                        loaded_count === xl && callback && (has_loaded = true, callback.apply(null, loaded_modules));
                    }, context);
                })(x);
        };  
    }
    !has_loaded && loaded_count === xl && callback && callback.apply(null, loaded_modules); 
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
        var queue_item;
        if (queue_item = anonymous_queue.shift()) {
            queue_item.unshift(module);
            exports[module].pilot === 1 && define.apply(null, queue_item);
        }
    });
}

var toUrl = require.toUrl = function (id, context) {
    var new_context, i, changed;
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
            case '.':
            case '':
                id.shift();
                changed = true;
        }
    }
    return (new_context.length && changed ? new_context.join('/') + '/' : '') + id.join('/');
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
}

function extend (target, source) {
    for (var x in source) {
        source.hasOwnProperty(x) && (target[x] = source[x]);
    }
    return target;
}

function get_type (v) {
    return pilot.toString.call(v).slice(8, -1);
}

function generate_id (prefix) {
    return (prefix || 'instance') + '_' + Date.now() + '.' + (Math.floor(Math.random() * 900000) + 100000);
}

global.pilot = {
    config: config,
    inject: inject,
    define: global.define = define,
    require: global.require = require,
    exports: exports,
    get_type: get_type,
    extend: extend,
    generate_id: generate_id
};

main && require([main]);

})(window);

define('pilot/data', [], function () {
"use strict";

var extend = pilot.extend;
var j = JSON;
var fromJSON = j.parse;
var toJSON = j.stringify;
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
        if (!key || typeof key !== 'string') {
            return this.data;
        }
        else if (key.indexOf('.') === -1) {
            return this.data[key];
        }
        keys = key.split('.'),
        current_key = keys[x],
        current_value = this.data;
        for (var x = 0, xl = keys.length; x < xl; current_key = keys[++x]) {                                                                                                                         
            current_value = current_value[current_key];
            if (typeof current_value === 'undefined') {
                return default_value;
            }
        }
        return current_value;
    },
    remove: function (key) {
        key && typeof key === 'string' ? (delete this.data[key]) : (this.data = {});
        this.sync();
        return this;
    },
    destroy: function () {
        this.data = null;
        this.sync();
        this = null;
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

define('pilot/pubsub', [], function () {
"use strict";

var arr_slice = Array.prototype.slice;
var instances = {};
var date_now = Date.now;

function global_trigger () {
    var args, id;
    args = arr_slice.call(arguments, 0);
    args[0] = args[0] + '.local';
    for (id in instances) {
        instances.hasOwnProperty(id) && instances[id].trigger.apply(instances[id], args);
    }
}

function pubsub () {
    if (!(this instanceof pubsub)) {
        return new pubsub();
    }
    this.handlers = {};
    this.id = pilot.generate_id('pubsub');
    return instances[this.id] = this;
}

pubsub.prototype = {
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
        var handlers, args, ns_index;
        if ((ns_index = e.indexOf('.local')) !== -1) {
            args = arr_slice.call(arguments, 1);
            e = e.slice(0, ns_index);
            handlers = this.handlers[e];
            if (handlers && handlers.length) {
                this.handlers[e] = handlers.filter(function (h) {
                    return h.handler.apply(null, args), h.retain;
                });
            }
        }
        else {
            args = arr_slice.call(arguments, 0);
            global_trigger.apply(null, args);
        }
        return this;
    },
    destroy: function (e) {
        instances[this.id] = null;
        this = null;
    }
};

return pubsub;

});

define('pilot/router', ['pilot/pubsub'], function (pubsub) {

var global = window;
var loc = global.location;
var root = loc.protocol + '//' + loc.host + '/';
var root_len = root.length;
var history = global.history;
var get_type = pilot.get_type;
var routes = [];
var parser = {
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
    query_parser: /(?:^|&)([^&=]*)=?([^&]*)/g,
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor']
};
var events = pubsub();

if (history && history.pushState) {
    global.onpopstate = function () {
        router.run(loc.href);
    };
    document.addEventListener('click', function (e) {
        var el = e.target;
        var href = el.href;
        var bypass;
        if (href && href.indexOf('#') !== 0 && href.slice(0, root_len) === root) {
            bypass = el.getAttribute('data-bypass');
            if ((bypass && bypass === 'true') || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }
            e.preventDefault();
            router.run(href);
            history.pushState(parse(href), null, href);
        }
    });
}

var router = {
    add: function (route) {
        if (get_type(route) === 'Array') {
            routes.push.apply(routes, route);
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
            events.trigger('unload', route.params);
            route.callback(route.params);
            events.trigger('load', route.params);
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

define('pilot/jsonp', [], function () {
"use strict";

var global = window;
var p = pilot;
var inject = p.inject;
var extend = p.extend;
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

