;(function (window, Pilot, undefined) {
"use strict";

var arr = [],
    arr_slice = arr.slice,
    get_type = Pilot.utils.get_type;

var Pubsub = Pilot.Pubsub = Pilot.extend({
    init: function () {
        this.handlers = Pubsub.handlers[this.id] = Pubsub.handlers[this.id] || {};
    },
    on: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: true});
    },
    one: function (e, h) {
        e && h && (this.handlers[e] = this.handlers[e] || []).push({handler: h, retain: false});
    },
    off: function (e) {
        e ? (delete this.handlers[e]) : (this.handlers = Pubsub.handlers[this.id] = {});
    },
    trigger: function (e) {
        var args = arr_slice.call(arguments, 1);
        this.handlers[e] = (this.handlers[e] || []).filter(function (h) {
            return h.handler.apply(null, args), h.retain;
        });
    },
    destroy: function () {
        delete Pubsub.handlers[this.id];
        delete Pubsub.instances[this.id];
    }
});

Pubsub.handlers = {};

Pubsub.trigger = function (e) {
    var instances = Pubsub.instances;
    for (var x in instances) {
        instances.hasOwnProperty(x) && instances[x].trigger.apply(instances[x], arguments);
    }
};

})(window, Pilot);
