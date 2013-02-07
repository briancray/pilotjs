;(function (window, undefined) {
"use strict";

var cache = {
    synced: false,
    handlers: {},
    data: {},
    scripts: {
        injected: [],
        injecting: []
    },
    modules: {
        loaded: {},
        loading: {},
        instances: {}
    },
    models: {
        loaded: {},
        instances: {}
    }
};

var pilot = {
    start: function () {
        pilot.sync();
        pilot.render();
    },
    trigger: function (e) {
        var modules = cache.modules.instances;
        for (var x in modules) {
            modules.hasOwnProperty(x) && modules[x].events.trigger(e, true);
        }
    },
    sync: function () {
        if (!cache.synced) {
            var data = localStorage.getItem('data');
            data ? (cache.data = pilot.utils.fromJSON(data) || {}) : (cache.data = {});
            cache.synced = true;
        }
        else {
            localStorage.setItem('data', pilot.utils.toJSON(cache.data));
        }
    },
    inject: function (file) {
        var p = pilot.Promise(),
            scripts = cache.scripts;
        if (scripts.injecting.indexOf(file) > -1) {
            return p;
        }
        else if (scripts.injected.indexOf(file) > -1) {
            p.success();
            return p;
        }
        var script = document.createElement('script'),
            when_ready = function () {
                scripts.injecting.splice(scripts.injecting.indexOf(file), 1);
                scripts.injected.push(file);
                p.success();
            };
        scripts.injecting.push(file);
        script.type = 'text/javascript';
        script.async = true;
        if (script.readyState) { // IE
            script.onreadystatechange = function () {
                if (script.readyState === 'loaded' || script.readyState === 'complete') {
                    script.onreadystatechange = null;
                    when_ready();
                }
            };
        }
        else { // Others
            script.onload = when_ready;
        }
        script.src = file;
        document.head.appendChild(script);
        return p;
    },
    render: function () {
        var module_elements = document.getElementsByClassName('module'),
            active_modules = {},
            cached_instances = cache.modules.instances;
        Array.prototype.forEach.call(module_elements, function (element) {
            var id = element.getAttribute('data-module');
            active_modules[id] = pilot.Module(id);
        });
        for (var id in cached_instances) {
            if (!active_modules.hasOwnProperty(id)) {
                cached_instances[id].events.off();
                cached_instances[id].unload && cached_instances[id].unload();
                delete cached_instances[id];
            }
            else {
                delete active_modules[id];
            }
        }
        pilot.trigger('refresh');
        for (var id in active_modules) {
            active_modules[id].queue('load');
        }
    },
    extend: function (source) {
        pilot.utils.extend(pilot, source);
    }
};

pilot.Module = function (id) {
    var name = id.split('.')[0],
        modules = cache.modules,
        module = modules.loaded[name];
    if (this instanceof pilot.Module) {
        return this;
    }
    else if (!module) {
        !modules.loading[name] && pilot.inject('modules/' + name + '.js').then(function () {
            pilot.Module(id).ready(modules.loading[name].command_queue);
            delete modules.loading[id];
        });
        return modules.loading[name] || (modules.loading[name] = new pilot.Module(id));
    }
    return modules.instances[id] || (modules.instances[id] = new module(id));
};

pilot.Module.prototype = {
    queue: function (method) {
        if (this.method) {
            this.method.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else {
            (this.command_queue || (this.command_queue = [])).push(Array.prototype.slice.call(arguments, 0));
        }
    },
    ready: function (queue) {
        var module = this;
        queue && queue.forEach(function (command) {
            module[command[0]] && module[command[0]].apply(module, command.slice(1));
        });
    },
    get_element: function () {
        var module = this,
            module_elements = document.getElementsByClassName('module');
        return Array.prototype.filter.call(module_elements, function (element) {
            return element.getAttribute('data-module') === module.id;
        })[0];
    }
};

pilot.Module.define = function (name, definition) {
    var module = cache.modules.loaded[name] = function (id) {
        this.id = id;
        this.element = this.get_element();
        this.events = pilot.Pubsub(id);
        this.data = pilot.Data(id);
        return this;
    };
    module.prototype = pilot.utils.extend(definition(), pilot.Module.prototype);
};

pilot.Model = function (id) {
    var name = id.split('.')[0],
        models = cache.models,
        model = models.loaded[name];
    if (this instanceof pilot.Model) {
        return this;
    }
    else if (!model) {
        pilot.inject('modules/' + name + '.js').then(function () {
            var model = pilot.Model(id);
            model.load && model.load();
        });
        return models.loaded[name] = new pilot.Model(id);
    }
    return modules.instances[id] || (modules.instances[id] = new model(id));
};

pilot.Model.prototype = {
    get: function (k) {
        return this.data.get(k);
    },
    set: function (k, v) {
        this.data.set(k, v);
    },
    remove: function (k) {
        this.data.remove(k);
    }
};

pilot.Model.define = function (name, definition) {
    var model = cache.model.loaded[name] = function (id) {
        this.id = id;
        this.events = pilot.Pubsub(id);
        this.data = pilot.Data(id);
        return this;
    };
    model.prototype = pilot.utils.extend(definition(), pilot.Model.prototype);
};

pilot.utils = {
    // get the real type of an object in lowercase
    get_type: function (o) {
        return Object.prototype.toString.call(o).split(' ')[1].slice(0, -1).toLowerCase();
    },

    // make a date pretty
    format_date: function (d, format) {
    },

    // show a date relative to now (unless more than 2 days old, then just make it pretty
    format_date_relative: function (d) {
        d = d instanceof Date ? d : new Date(d);
        var delta = ~~((Date.now() - d.getTime()) / 1000),
            minute = 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;

        return delta < 30 ? 'Just now' :
            delta < minute ? delta + ' seconds ago' :
            delta < 2 * minute ? 'A minute ago' :
            delta < hour ? delta + ' minutes ago' :
            delta < hour * 2 ? 'An hour ago' :
            delta < day ? delta + ' hours ago' :
            delta < day * 2 ? 'Yesterday' :
            pilot.utils.format_date(d);
    },

    // shorten a number -- 1000 becomes 1k, 1000000 becomes 1m, etc.
    trim_number: function (n, precision) {
        n = +n;
        var len = Math.floor((n.length - 1) / 3),
            trim_until = n.length - len * 3,
            trimmed1 = n.slice(0, trim_until),
            trimmed2 = precision ? n.slice(trim_until, trim_until + precision) : '',
            size = ['', 'k', 'm', 'b', 't'][len],
            trimmed = trimmed1 + (trimmed2.length ? '.' + trimmed2 : '') + size;
        return size.length ? trimmed : ''+n;
    },

    // trim a string and append an ellipsis
    trim_string: function (s, len) {
        len = len || 60;
        if (len >= str.length) {
            return str;
        }
        len = str.indexOf(' ', len);
        return str.slice(0, len) + '&hellip;';
    },

    // trim the middle of a url out
    trim_url: function (url, len) {
        str = str.replace(/^https?:\/\/(?:www\.)?/, '');
        len = len || 60;
        if (len >= str.length) {
            return str;
        }
        var locations = [],
            last = str.indexOf('/'),
            m = ['', ''];
        while (last > 0) {
            locations.push(last);
            last = str.indexOf('/', last + 1);
        }
        if (str.charAt(str.length - 1) == '/') {
            locations.pop();
        }
        if (locations.length <= 1) {
            return str;
        }
        m[1] = str.slice(locations.pop());
        m[0] = str.slice(0, locations.pop() + 1);
        while (m.join('').length > len && locations.length > 1) {
            m[0] = str.slice(0, locations.pop() + 1);
        }
        return m.join('&hellip;');
    },

    // add commas to a long number
    format_number: function (n) {
        n = +n;
        return n != n ? '0' :
            (''+Math.round(n)).split('').reverse().join('').match(/.{1,3}/g).join().split('').reverse().join('');
    },

    // create a simple hash from a string
    hash: function (s) { 
        for (var h = 0, x = 0, xl = s.length; x < xl; x++) { 
            h = (h << 5) - h + s.charCodeAt(x);
            h &= h;
        }
        return h;
    },

    // decodes HTML entities
    decode_entities: function (s) {
        return s.replace(/&#(\d+);?/g, function(a, c) {
            return String.fromCharCode(c)
        });
    },

    // encodes non-word characters into their HTML entity equivalent
    encode_entities: function (s) {
        return s.replace(/(\W)/g, function(c, p, i) {
            return '&#' + s.charCodeAt(i) + ';';
        });
    },

    // add a shallow copy of one object to another, retaining the original properties
    extend: function (t, s) {
        for (var x in s) {
            !t.hasOwnProperty(x) && (t[x] = s[x]);
        }
        return t;
    },

    // make something into json
    toJSON: function (v) {
        return JSON.stringify(v);
    },

    // parse json into a native form
    fromJSON: function (v) {
        return JSON.parse(v);
    }
};

// pilot.Pubsub is an event framework
pilot.Pubsub = function (id) {
    if (this instanceof pilot.Pubsub) {
        this.id = id;
        this.handlers = cache.handlers[id] = cache.handlers[id] || {};
        return this;
    }
    return new pilot.Pubsub(id);
};

pilot.Pubsub.prototype = {
    on: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: true});
    },
    one: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: false});
    },
    off: function (e) {
        e ? (delete this.handlers[e], delete cache.handlers[this.id][e]) : (this.handlers = cache.handlers[this.id] = {});
    },
    trigger: function (e, local) {
        if (local && this.handlers[e]) {
            this.handlers[e] = this.handlers[e].filter(function (h) {
                return h.handler(), h.retain;
            });
            !this.handlers[e].length && delete this.handlers[e];
        }
        else if (!local) {
            pilot.trigger(e);
        }
    },
    destroy: function () {
        delete cache.handlers[this.id];
    }
};

// pilot.Data is an arbitrary data set
pilot.Data = function (id, is_private) {
    if (this instanceof pilot.Data) {
        this.is_private = is_private;
        this.data = !is_private ? (cache.data[id] = cache.data[id] || {}) : {};
        this.id = id;
        return this;
    }
    return new pilot.Data(id);
};

pilot.Data.prototype = {
    set: function (k, v) {
        switch (pilot.utils.get_type(k)) {
            case 'string':
                this.data[k] = v;
                break;
            case 'object':
                pilot.utils.extend(this.data[x], k[x]);
                break;
        }
        !this.is_private && pilot.sync();
    },
    get: function (k) {
        return k ? this.data[k] : this.data;
    },
    remove: function (k) {
        k ? (delete this.data[k], delete cache.data[this.id][k]) : (this.data = cache.data[this.id] = {});
        !this.is_private && pilot.sync();
    },
    destroy: function () {
        if (!this.is_private) {
            delete cache.data[this.id];
            pilot.sync();
        }
    }
};

// pilot.Promise is a promise framework
pilot.Promise = function () {
    if (this instanceof pilot.Promise) {
        this.handlers = {
            success: [],
            error: [],
            progress: []
        };
        return this;
    }
    return new pilot.Promise();
};

pilot.Promise.prototype = {
    status: 'unfulfilled', 
    then: function (success, error, progress) {
        !!success && this.add('success', success);
        !!error && this.add('error', error);
        !!progress && this.add('progress', fulfilled);
        switch (this.status) {
            case 'fulfilled':
                this.success();
                break;
            case 'failed':
                this.error();
                break;
        }
        return this;
    },
    success: function () {
        this.status = 'fulfilled';
        this.handlers.success.forEach(function (f) {
            f.apply(null, arguments);
        });
        return this.clear();
    },
    error: function () {
        this.status = 'failed';
        this.handlers.error.forEach(function (f) {
            f.apply(null, arguments);
        });
        return this.clear();
    },
    progress: function () {
        this.handlers.progress.forEach(function (f) {
            f.apply(null, arguments);
        });
        return this;
    },
    add: function (type, callback) {
        switch (pilot.utils.get_type(callback)) {
            case 'function':
                this.handlers[type].push(callback);
                break;
            case 'array':
                this.handlers[type].concat(callback);
        }
        return this;
    },
    clear: function () {
        this.handlers = {
            success: [],
            error: [],
            progress: []
        };
        return this;
    }
};

/*
pilot.models = {
    loaded: {},
    instances: {},
    load: function (id) { 
        pilot.inject('model/' + name + '.js').then(function () {
            var model = pilot.models.instantiate(id);
            model.load && model.load();
        });
    },
    unload: function (id) {
        delete models.instances[id];
    },
    define: function (name, definition) {
        var model = pilot.models.loaded[name] = function (id) {
            this.id = id;
            this.data = pilot.Data(id);
            this.events = pilot.Pubsub(id);
            return this;
        };
        model.prototype = definition();
    },
    instantiate: function (id) {
        var name = id.split('.')[0],
            models = pilot.models,
            model = models.loaded[name];
        return models.instances[id] || (models.instances[id] = new model(id));
    }
};
*/

window.pilot = window.pi = pilot;

})(window);
