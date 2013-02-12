;(function (window, undefined) {
"use strict";

var cache = {
    loaded: {},
    loading: {},
    instances: {}
};

Pilot.Module = function (id) {
    var name = id.split('.')[0],
        module = cache.loaded[name];
    if (this instanceof Pilot.Module) {
        return this;
    }
    else if (!module) {
        !cache.loading[name] && Pilot.Script.inject('modules/' + name + '.js').then(function () {
            Pilot.Module(id).ready(cache.loading[name].command_queue);
            delete cache.loading[name];
        });
        return cache.loading[name] || (cache.loading[name] = new Pilot.Module(id));
    }
    return cache.instances[id] || (cache.instances[id] = new module(id));
};

Pilot.Module.prototype = {
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
    },
    destroy: function () {
        this.events.destroy();
        delete cache.instances[this.id];
    }
};

Pilot.Module.define = function (name, definition) {
    var module = cache.loaded[name] = function (id) {
        this.id = id;
        this.element = this.get_element();
        this.events = Pilot.Pubsub(id);
        this.data = Pilot.Data(id);
        return this;
    };
    module.prototype = Pilot.utils.extend(definition(), Pilot.Module.prototype);
};

Pilot.Module.render = function () {
    var module_elements = document.getElementsByClassName('module'),
        active_modules = {},
        cached_instances = cache.instances;
    Array.prototype.forEach.call(module_elements, function (element) {
        var id = element.getAttribute('data-module');
        active_modules[id] = Pilot.Module(id);
    });
    for (var id in cached_instances) {
        if (!active_modules[id]) {
            cached_instances[id].unload && cached_instances[id].unload();
            cached_instances[id].destroy();
        }
    }
    Pilot.Pubsub.trigger('refresh');
    for (var id in active_modules) {
        active_modules[id].queue('load');
    }
};

document.addEventListener('DOMContentLoaded', function () {
    Pilot.Module.render();
});

})(window);
