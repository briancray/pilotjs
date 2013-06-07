;(function (global, undefined) {
"use strict";

var doc = document;
var el_head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var node = (function (scripts) {
    return scripts[scripts.length - 1];
})(doc.getElementsByTagName('script'));
var main = node.getAttribute('data-main');
var anonymous_queue = [];
var arr_slice = anonymous_queue.slice;
var arr_foreach = anonymous_queue.forEach;
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
    var sources = arr_slice.call(arguments, 1);
    var l = sources.length;
    while (l-- > -1) {
        for (var x in sources[l]) {
            sources[l].hasOwnProperty(x) && (target[x] = sources[l][x]);
        }
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

define('pilot/model', [], function () {
"use strict";

var extend = pilot.extend;
var j = JSON;
var fromJSON = j.parse;
var toJSON = j.stringify;
var all_data = {};

function model () {}

model.prototype = {
    init: function (id, initial) {
        if (typeof id === 'string') {
            this.id = id;
            if (all_data[id]) {
                this.synced = true;
                this.data = all_data[id];
            }
            else {
                this.synced = false;
                this.data = all_data[id] = initial || {};
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
    },
    sync: function () {
        var data;
        if (!this.id) {
            return;
        }
        else if (this.synced) {
            if (this.data) {
                localStorage.setItem('data.' + this.id, toJSON(this.data));
                all_data[this.id] = this.data;
            }
            else {
                localStorage.removeItem('data.' + this.id);
                delete all_data[this.id];
            }
        }
        else {
            data = localStorage.getItem('data' + this.id);
            data ? (this.data = all_data[this.id] = fromJSON(data) || {}) : (this.data = all_data[this.data] = {});
            this.synced = true;
        }
    }
};

return model;

});

define('pilot/pubsub', [], function () {
"use strict";

var arr_slice = Array.prototype.slice;
var instances = {};
var date_now = Date.now;

function pubsub () {}

pubsub.prototype = {
    init: function (id) {
        this.id = typeof id === 'string' ? id : pilot.generate_id('pubsub');
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
            pubsub.trigger.apply(null, args);
        }
        return this;
    },
    destroy: function (e) {
        instances[this.id] = null;
    }
};

pubsub.trigger = function () {
    var args, id;
    args = arr_slice.call(arguments, 0);
    args[0] = args[0] + '.local';
    for (id in instances) {
        instances.hasOwnProperty(id) && instances[id].trigger.apply(instances[id], args);
    }
};

return pubsub;

});

define('pilot/view', ['pilot/pubsub', 'pilot/model'], function (pubsub, model) {
"use strict";

var arr_foreach = Array.prototype.forEach;
var instances = [];

function view () {}

view.prototype = {
    init: function (el, params) {
        instances.push(this);
        this.el = el;
        this.id = el.getAttribute('data-view') || '';
        this.params = params;
        this.events = new pubsub().init(this.id);
        this.settings = new model().init(this.id);
        this.render();
        view.load(this.el, params);
        return this;
    },
    render: function () {
        this.el.innerHTML = '';
    },
    destroy: function () {
        this.events.destroy();
    }
};

view.load = function (context, params) {
    context = context || 'body';
    context = typeof context === 'string' ? doc.querySelector(context) : context;
    params = typeof params === 'object' ? params : {};
    var url_params = {};
    window.location.search.slice(1).split('&').forEach(function (param) {
        var key_val = param.split('=');
        url_params[decodeURIComponent(key_val[0])] = decodeURIComponent(key_val.slice(1).join(''));
    });
    params = pilot.extend(url_params, params);
    arr_foreach.call(context.getElementsByClassName('view'), function (el_view) {
        var data_view = el_view.getAttribute('data-view') || '';
        data_view && require([data_view.split('.')[0]], function (view_module) {
            new view_module().init(el_view, params);
        });
    });
};

view.unload = function (context) {
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

return view;

});

