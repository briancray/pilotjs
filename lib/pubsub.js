define([], function () {
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
