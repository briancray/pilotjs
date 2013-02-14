;(function (window, Pilot, undefined) {
"use strict";

var cache = {
    loaded: {},
    loading: {},
    instances: {}
};

var Component = Pilot.Component = function (id) {
    var name = id.split('.')[0],
        component = cache.loaded[name];
    if (this instanceof Component) {
        return this;
    }
    else if (!component) {
        !cache.loading[name] && Pilot.inject('components/' + name + '.js').then(function () {
            Component(id).ready(cache.loading[name].command_queue);
            delete cache.loading[name];
        });
        return cache.loading[name] || (cache.loading[name] = new Component(id));
    }
    return cache.instances[id] || (cache.instances[id] = new component(id));
};

Component.prototype = {
    queue: function (method) {
        if (this.method) {
            this.method.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else {
            (this.command_queue || (this.command_queue = [])).push(Array.prototype.slice.call(arguments, 0));
        }
    },
    ready: function (queue) {
        var component = this;
        queue && queue.forEach(function (command) {
            component[command[0]] && component[command[0]].apply(component, command.slice(1));
        });
    },
    get_element: function () {
        var component = this,
            component_elements = document.getElementsByClassName('component');
        return Array.prototype.filter.call(component_elements, function (element) {
            return element.getAttribute('data-component') === component.id;
        })[0];
    },
    destroy: function () {
        this.events.destroy();
        delete cache.instances[this.id];
    }
};

Component.define = function (name, definition) {
    var component = cache.loaded[name] = function (id) {
        this.id = id;
        this.element = this.get_element();
        this.events = Pilot.Pubsub(id);
        this.data = Pilot.Data(id);
        return this;
    };
    component.prototype = Pilot.utils.extend(definition(), Component.prototype);
};

Component.render = function () {
    var component_elements = document.getElementsByClassName('component'),
        active_components = {},
        cached_instances = cache.instances;
    Array.prototype.forEach.call(component_elements, function (element) {
        var id = element.getAttribute('data-component');
        active_components[id] = Component(id);
    });
    for (var id in cached_instances) {
        if (!active_components[id]) {
            cached_instances[id].unload && cached_instances[id].unload();
            cached_instances[id].destroy();
        }
    }
    Pilot.Pubsub.trigger('refresh');
    for (var id in active_components) {
        active_components[id].queue('load');
    }
};

document.addEventListener('DOMContentLoaded', function () {
    Component.render();
});

})(window, Pilot);
