;(function (window, Pilot, undefined) {
"use strict";

var cache = {
    handlers: {},
    instances: {}
};

// Pilot.Pubsub is an event framework
Pilot.Pubsub = function (id) {
    if (this instanceof Pilot.Pubsub) {
        this.id = id;
        this.handlers = cache.handlers[id] = cache.handlers[id] || {};
        return this;
    }
    return cache.instances[id] || (cache.instances[id] = new Pilot.Pubsub(id));
};

Pilot.Pubsub.prototype = {
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
            Pilot.Pubsub.trigger(e);
        }
    },
    destroy: function () {
        delete cache.handlers[this.id];
        delete cache.instances[this.id];
    }
};

Pilot.Pubsub.trigger = function (e) {
    var instances = cache.instances;
    for (var x in instances) {
        instances.hasOwnProperty(x) && instances[x].trigger(e, true);
    }
};

})(window, Pilot);
