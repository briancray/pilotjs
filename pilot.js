;(function (window, undefined) {
"use strict";

var pilot = {};

pilot.start = function () {
    pilot.modules.load();
};

pilot.data = {};

pilot.events = {
    handlers: {},
    off: function (e) {
        var modules = pilot.modules.instances;
        for (var x in modules) {
            modules.hasOwnProperty(x) && modules[x].events.off(e);
        }
    },
    trigger: function (e) {
        var modules = pilot.modules.instances;
        for (var x in modules) {
            modules.hasOwnProperty(x) && modules[x].events.trigger(e, true);
        }
    }
};

pilot.modules = {
    loaded: {},
    instances: {},
    load: function (context) { 
        context = !context ? document : 
            o.tagName ? context :
            document.querySelectorAll(context);
        var module_elements = context.getElementsByClassName('module');
        Array.prototype.forEach.call(module_elements, function (element) {
            var id = element.getAttribute('data-module'),
                name = id.split('.')[0],
                modules = pilot.modules;
            pilot.scripts.inject('modules/' + name + '.js').then(function () {
                var module = modules.instantiate(id, element);
                module.load && module.load();
            });
        });
    },
    unload: function (context) {
        context = !context ? document : 
            o.tagName ? context :
            document.querySelectorAll(context);
        var module_elements = context.getElementsByClassName('module');
        Array.prototype.forEach.call(module_elements, function (element) {
            var id = element.getAttribute('data-module'),
                modules = pilot.modules,
                module = modules.instantiate(id, element);
            module.unload && module.unload();
            module.events.destroy();
            delete modules.instances[id];
        });
    },
    define: function (name, definition) {
        var module = pilot.modules.loaded[name] = function (id, element) {
            this.id = id;
            this.element = element;
            this.events = pilot.EventSet(this.id);
            this.data = pilot.DataSet(this.id);
            return this;
        };
        module.prototype = definition();
    },
    instantiate: function (id, element) {
        var name = id.split('.')[0],
            modules = pilot.modules,
            module = modules.loaded[name];
        return modules.instances[id] || (modules.instances[id] = new module(id, element));
    }
};

pilot.scripts = {
    injecting: [],
    injected: [],
    inject: function (file) {
        var p = pilot.Promise(),
            scripts = pilot.scripts;
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
    }
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

pilot.EventSet = function (id) {
    if (this instanceof pilot.EventSet) {
        this.id = id;
        this.handlers = pilot.events.handlers[id] = pilot.events.handlers[id] || {};
        return this;
    }
    return new pilot.EventSet(id);
};

pilot.EventSet.prototype = {
    on: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: true});
    },
    one: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: false});
    },
    off: function (e) {
        e ? (delete this.handlers[e], delete handlers[this.id][e]) : (this.handlers = pilot.events.handlers[this.id] = {});
    },
    trigger: function (e, local) {
        if (local && this.handlers[e]) {
            this.handlers[e] = this.handlers[e].filter(function (h) {
                return h.handler(), h.retain;
            });
            !this.handlers[e].length && delete this.handlers[e];
        }
        else if (!local) {
            pilot.events.trigger(e);
        }
    },
    destroy: function () {
        delete pilot.handlers[this.id];
    }
};

pilot.DataSet = function (id) {
    if (this instanceof pilot.DataSet) {
        this.data = pilot.data[id] = pilot.data[id] || {};
        this.id = id;
        return this;
    }
    return new pilot.DataSet(id);
};

pilot.DataSet.prototype = {
    set: function (k, v) {
        switch (pilot.utils.get_type(k)) {
            case 'string':
                this.data[k] = v;
                break;
            case 'object':
                pilot.utils.extend(this.data[x], k[x]);
                break;
        }
    },
    get: function (k) {
        return k ? this.data[k] : this.data;
    },
    remove: function (k) {
        k ? (delete this.data[k], delete data[this.id][k]) : (this.data = pilot.data[this.id] = {});
    },
    destroy: function () {
        delete pilot.data[this.id];
    }
};

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

window.pilot = window.pi = pilot;

})(window);
