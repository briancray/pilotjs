;(function (window, controller, undefined) {
"use strict";

controller.modules = {
    loaded: {},
    load: function (name) {
        var p = controller.promise(),
            modules = controller.modules;
        if (name) {
            controller.scripts.inject('modules/' + name + '.js').then(function (name) {
                modules.loaded[name].load && modules.loaded[name].load();
                p.success();
            });
        }
        else {
            var module_elements = document.getElementsByClassName('module');
            Array.prototype.forEach.call(module_elements, function (element) {
                var name = element.getAttribute('data-module');
                modules.load(name);
            });
        }
        return p;
    },
    unload: function (name) {
        var p = controller.promise(),
            modules = controller.modules;
        if (name && modules.loaded[name]) {
            modules.loaded[name].events.off();
            modules.loaded[name].unload && modules.loaded[name].unload();
            p.success();
        }
        else if (!name) {
            var module_elements = document.getElementsByClassName('module');
            Array.prototype.forEach.call(module_elements, function (element) {
                var name = element.getAttribute('data-module');
                modules.unload(name);
            });
        }
        return p;
    },
    define: function (name, module) {
        loaded[name] = module;
    }
};

})(window, controller);
