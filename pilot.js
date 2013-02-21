;(function (window, undefined) {
"use strict";

var Pilot = function () {};

Pilot.extend = (function () {
    var initializing = false,
        fn_test = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    return function (prop) {
        var base = this,
            _super = base.prototype,
            prototype = null;

        initializing = true;
        prototype = new base();
        initializing = false;

        for (var name in prop) {
            prototype[name] = typeof prop[name] === 'function' && typeof _super[name] === 'function' && fn_test.test(prop[name]) ?
                (function (name, fn) {
                    return function() {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);        
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        function Module (id, options) {
            if (!initializing) {
                if (this instanceof Module) {
                    this.id = id;
                    this.init && this.init.apply(this, arguments);
                    return this;
                }
                else {
                    return Module.factory(id, options);
                }
            }
        };

        Module.prototype = prototype;
        Module.prototype.constructor = Module;
        Module.extend = Pilot.extend;
        Module.factory = Pilot.factory;
        Module.instances = {};

        return Module;
    };
})();

Pilot.factory = function (id, options) {
    var id_split = id.indexOf('.'),
        uses_namespace = id_split !== -1,
        name = uses_namespace ? id.slice(0, id_split) : id,
        namespace = uses_namespace ? id.slice(id_split) : '',
        module = this,
        instances = module.instances;
    id = (name + namespace).toLowerCase();
    if (name) {
        name = Pilot.utils.capitalize(name);
        if (!module[name]) {
            Pilot.inject(module.type + '/' + name.toLowerCase() + '.js', function () {
                instances[id] = Pilot.utils.extend(new module[name](id, options), instances[id]);
            });
            return instances[id] = new module(id, options);
        }
        else {
            return instances[id] = instances[id] || new module[name](id, options);
        }
    }
    return instances[id] = instances[id] || new module(id, options);
};
 
Pilot.inject = function (file, callback) {
    var scripts = Pilot.inject.scripts || (Pilot.inject.scripts = {});
    if (scripts[file]) {
        (function wait_for_inject () {
            if (scripts[file] === 1) {
                return window.setTimeout(wait_for_inject, 100);
            }
            callback && callback();
        })();
    }
    var script = document.createElement('script'),
        when_ready = function () {
            scripts[file] = 2;
            callback && callback();
        };
    scripts[file] = 1;
    script.type = 'text/javascript';
    if (script.readyState) {
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
};

Pilot.start = function () {
    Pilot.inject('lib.js', function () {
        Pilot.Widget.render();
    });
};

document.addEventListener('DOMContentLoaded', Pilot.start);

window.Pilot = Pilot;

})(window);
